const { Device, games, devices } = require("../store.js");
const GameManager = require("../game/GameManager");
const jwt = require("jsonwebtoken");
const pendingRequestsManager = require("../modules/pendingRequestsManager.js");

// Clé secrète pour vérifier les JWT (doit correspondre à celle utilisée dans auth.js)
const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete_ultra_securisee_pour_jwt_auth_97232";

// Variables globales pour les fonctions helper
let globalIO = null;

/**
 * Gestionnaire principal des connexions Socket.IO
 * Gère les connexions, les rooms et les événements en temps réel
 */
module.exports = (io, gameManagerInstance = null) => {
  // Initialiser la variable globale pour les fonctions helper
  globalIO = io;

  // Utiliser l'instance GameManager fournie ou en créer une nouvelle
  const gameManager = gameManagerInstance || new GameManager(io);

  // Exposer les fonctions de gestion des demandes pour l'API
  io.getPendingRequests = pendingRequestsManager.getPendingRequests;
  io.getPendingRequestsCount = pendingRequestsManager.getPendingRequestsCount;

  io.on("connection", (socket) => {
    console.log(`🔌 Nouvelle connexion Socket.IO: ${socket.id}`);

    // Événement de connexion pour le control-center avec validation JWT
    socket.on("control_center_connect", (data) => {
      try {
        const { token } = data;

        // Validation des données
        if (!token) {
          socket.emit("control_center_error", {
            success: false,
            error: "Token manquant",
            message: "Un token JWT est requis pour la connexion au control-center",
          });
          return;
        }

        // Vérification du JWT
        let decoded;
        try {
          decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
          console.log(`❌ JWT invalide pour la connexion control-center: ${jwtError.message}`);
          socket.emit("control_center_error", {
            success: false,
            error: "Token invalide",
            message: "Le token JWT fourni est invalide ou expiré",
          });
          return;
        }

        // Marquer la socket comme control-center
        socket.isControlCenter = true;

        console.log(`🔐 Control-center connecté avec succès`);

        // Confirmer la connexion
        socket.emit("control_center_connected", {
          success: true,
          message: "Connecté au control-center avec succès",
        });

        // Joindre la room des control-center
        socket.join("control_center");

        // Envoyer le nombre actuel de demandes en attente
        const count = pendingRequestsManager.getPendingRequestsCount();
        socket.emit("pending_requests_count", {
          count: count,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Erreur lors de la connexion du control-center:", error);
        socket.emit("control_center_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour mettre à jour l'avancement d'une partie
    socket.on("update_game_advancement", (data) => {
      if (!socket.isControlCenter) {
        socket.emit("control_center_error", {
          success: false,
          error: "Non autorisé",
          message: "Seuls les control centers peuvent mettre à jour l'avancement des parties",
        });
        return;
      }

      try {
        const { gameId, advancement } = data;

        if (!gameId || advancement === undefined) {
          socket.emit("control_center_error", {
            success: false,
            error: "Données manquantes",
            message: "gameId et advancement sont requis",
          });
          return;
        }

        // Mettre à jour l'avancement et notifier tous les devices
        const success = updateGameAdvancement(gameId, advancement);

        if (success) {
          socket.emit("advancement_update_success", {
            success: true,
            message: `Avancement de la partie ${gameId} mis à jour avec succès`,
            gameId: gameId,
            advancement: advancement,
            timestamp: new Date().toISOString(),
          });

          // Notifier le control center de la mise à jour
          io.to("control_center").emit("game_advancement_updated", {
            gameId: gameId,
            advancement: advancement,
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit("advancement_update_error", {
            success: false,
            error: "Erreur lors de la mise à jour",
            message: `Impossible de mettre à jour l'avancement de la partie ${gameId}`,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'avancement:", error);
        socket.emit("control_center_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour récupérer toutes les demandes en attente
    socket.on("get_pending_requests", () => {
      if (!socket.isControlCenter) {
        socket.emit("control_center_error", {
          success: false,
          error: "Non autorisé",
          message: "Seuls les control centers peuvent récupérer les demandes en attente",
        });
        return;
      }

      const pendingRequests = pendingRequestsManager.getPendingRequests();
      const count = pendingRequestsManager.getPendingRequestsCount();
      socket.emit("pending_requests_list", {
        success: true,
        requests: pendingRequests,
        count: count,
        timestamp: new Date().toISOString(),
      });
    });

    // Événement pour ajouter un device par défaut à la liste globale
    socket.on("adddefaultdevice", (data) => {
      try {
        const { name, type, game_id } = data;

        // Validation des données
        if (!name || !type) {
          socket.emit("adddevice_error", {
            success: false,
            error: "Données manquantes",
            message: "name et type sont requis",
          });
          return;
        }

        // Vérifier si un device avec ce socketId existe déjà
        let existingDevice = devices.find((d) => d.socketId === socket.id);

        if (existingDevice) {
          socket.emit("adddevice_error", {
            success: false,
            error: "Device déjà existant",
            message: `Un device avec ce socketId existe déjà`,
          });
          return;
        }

        // Créer un nouveau device par défaut
        const newDevice = new Device();
        newDevice.name = name;
        newDevice.adresseIp = null; // Plus besoin de stocker l'IP
        newDevice.type = type;
        newDevice.game = null;
        newDevice.defaultDevice = true;
        newDevice.socketId = socket.id;

        // Stocker temporairement les infos du device dans la socket
        socket.pendingDevice = newDevice;
        socket.pendingGameId = game_id;

        // Créer la demande d'autorisation
        const authorizationRequest = {
          id: Date.now() + Math.random().toString(36).substr(2, 9), // ID unique
          type: "adddefaultdevice",
          device: newDevice,
          game_id: game_id,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
          status: "pending",
        };

        // Ajouter la demande à la liste d'attente
        const count = pendingRequestsManager.addPendingRequest(authorizationRequest);

        // Notifier le control center avec des détails
        if (globalIO) {
          // Notification du compteur
          pendingRequestsManager.notifyControlCenter(globalIO, count);

          // Notification détaillée de la nouvelle demande
          globalIO.to("control_center").emit("new_authorization_request", {
            type: "adddefaultdevice",
            device: newDevice,
            count: count,
            timestamp: new Date().toISOString(),
            message: `Nouvelle demande d'ajout de device: ${newDevice.name}`,
          });
        }

        // Informer le device que sa demande est en attente
        socket.emit("adddevice_pending", {
          success: true,
          message: "Demande d'ajout en attente d'autorisation du control center",
          device: newDevice,
          status: "pending",
        });

        console.log(
          `📱 Demande d'ajout de device par défaut "${name}" (socketId: ${socket.id}) envoyée au control center`
        );
      } catch (error) {
        console.error("Erreur lors de la demande d'ajout du device:", error);
        socket.emit("adddevice_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour connecter un device à une game
    socket.on("connect_to_game", (data) => {
      try {
        const { gameId, name, type } = data;

        // Validation des données
        if (!gameId || !name || !type) {
          socket.emit("connection_error", {
            success: false,
            error: "Données manquantes",
            message: "gameId, name et type sont requis",
          });
          return;
        }

        // Chercher la game
        const game = games.find((g) => g.id === parseInt(gameId));

        if (!game) {
          socket.emit("connection_error", {
            success: false,
            error: "Game introuvable",
            message: `Aucune game avec l'ID ${gameId} n'a été trouvée`,
          });
          return;
        }

        // Vérifier le statut de la game
        if (game.status !== "waiting") {
          socket.emit("connection_error", {
            success: false,
            error: "Statut invalide",
            message: `La game ${gameId} n'accepte plus de connexions. Statut: ${game.status}`,
          });
          return;
        }

        // Créer un nouveau device invité (pas dans la liste globale)
        const guestDevice = new Device();
        guestDevice.name = name;
        guestDevice.adresseIp = null; // Plus besoin de stocker l'IP
        guestDevice.type = type;
        guestDevice.game = parseInt(gameId);
        guestDevice.socketId = socket.id;
        guestDevice.defaultDevice = false;

        // Stocker temporairement les infos du device dans la socket
        socket.pendingDevice = guestDevice;
        socket.pendingGameId = parseInt(gameId);

        // Créer la demande d'autorisation
        const authorizationRequest = {
          id: Date.now() + Math.random().toString(36).substr(2, 9), // ID unique
          type: "connect_to_game",
          device: guestDevice,
          game: game,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
          status: "pending",
        };

        // Ajouter la demande à la liste d'attente
        const count = pendingRequestsManager.addPendingRequest(authorizationRequest);

        // Notifier le control center avec des détails
        if (globalIO) {
          // Notification du compteur
          pendingRequestsManager.notifyControlCenter(globalIO, count);

          // Notification détaillée de la nouvelle demande
          globalIO.to("control_center").emit("new_authorization_request", {
            type: "connect_to_game",
            device: guestDevice,
            game: game,
            count: count,
            timestamp: new Date().toISOString(),
            message: `Nouvelle demande de connexion: ${guestDevice.name} → Game ${gameId}`,
          });
        }

        // Informer le device que sa demande est en attente
        socket.emit("connection_pending", {
          success: true,
          message: "Demande de connexion en attente d'autorisation du control center",
          device: guestDevice,
          status: "pending",
        });

        console.log(
          `📱 Demande de connexion de device invité "${name}" (socketId: ${socket.id}) à la game ${gameId} envoyée au control center`
        );
      } catch (error) {
        console.error("Erreur lors de la demande de connexion à la game:", error);
        socket.emit("connection_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement de déconnexion du control-center
    socket.on("control_center_disconnect", () => {
      try {
        if (socket.isControlCenter) {
          console.log(`🔐 Control-center déconnecté`);

          // Quitter la room des control-center
          socket.leave("control_center");

          // Nettoyer les informations de la socket
          delete socket.isControlCenter;

          // Confirmer la déconnexion
          socket.emit("control_center_disconnected", {
            success: true,
            message: "Déconnecté du control-center avec succès",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la déconnexion du control-center:", error);
      }
    });

    // Événement pour gérer les réponses d'autorisation du control center
    socket.on("device_authorization_response", (data) => {
      try {
        const { requestId, authorized, reason } = data;

        // Trouver la demande dans la liste d'attente
        const pendingRequests = pendingRequestsManager.getPendingRequests();
        const requestIndex = pendingRequests.findIndex((req) => req.id === requestId);
        if (requestIndex === -1) {
          console.error(`❌ Demande ${requestId} non trouvée dans la liste d'attente`);
          return;
        }

        const request = pendingRequests[requestIndex];
        const deviceSocket = io.sockets.sockets.get(request.socketId);

        if (!deviceSocket) {
          console.error(`❌ Socket ${request.socketId} non trouvée pour la réponse d'autorisation`);
          // Supprimer la demande même si la socket n'existe plus
          const count = pendingRequestsManager.removePendingRequest(request.socketId);
          pendingRequestsManager.notifyControlCenter(globalIO, count);
          return;
        }

        // Récupérer les données en attente avant de traiter
        const pendingDevice = deviceSocket.pendingDevice;
        const pendingGameId = deviceSocket.pendingGameId;

        if (!pendingDevice) {
          console.error(`❌ Device en attente non trouvé pour la socket ${request.socketId}`);
          // Supprimer la demande
          const count = pendingRequestsManager.removePendingRequest(request.socketId);
          pendingRequestsManager.notifyControlCenter(globalIO, count);
          return;
        }

        if (authorized) {
          // Autorisation accordée - traiter la demande
          if (pendingDevice.defaultDevice) {
            // Traitement pour adddefaultdevice
            handleAuthorizedDefaultDevice(deviceSocket, pendingDevice, pendingGameId);
          } else {
            // Traitement pour connect_to_game
            handleAuthorizedGameConnection(deviceSocket, pendingDevice, pendingGameId);
          }
        } else {
          // Autorisation refusée
          if (pendingDevice.defaultDevice) {
            deviceSocket.emit("adddevice_error", {
              success: false,
              error: "Autorisation refusée",
              message: `Demande d'ajout refusée par le control center: ${reason || "Aucune raison spécifiée"}`,
            });
          } else {
            deviceSocket.emit("connection_error", {
              success: false,
              error: "Autorisation refusée",
              message: `Demande de connexion refusée par le control center: ${reason || "Aucune raison spécifiée"}`,
            });
          }
        }

        // Nettoyer les données temporaires et supprimer la demande de la liste
        delete deviceSocket.pendingDevice;
        delete deviceSocket.pendingGameId;
        const count = pendingRequestsManager.removePendingRequest(request.socketId);
        pendingRequestsManager.notifyControlCenter(globalIO, count);
      } catch (error) {
        console.error("Erreur lors du traitement de la réponse d'autorisation:", error);
      }
    });

    // Événement de déconnexion générale
    socket.on("disconnect", () => {
      console.log(`🔌 Déconnexion Socket.IO: ${socket.id}`);

      // Nettoyer les demandes en attente pour ce socket
      const count = pendingRequestsManager.removePendingRequest(socket.id);
      // Notifier le control center
      pendingRequestsManager.notifyControlCenter(globalIO, count);

      // Gestion de la déconnexion du control-center
      if (socket.isControlCenter) {
        console.log(`🔐 Control-center déconnecté`);
        socket.leave("control_center");
      }

      // Gestion de la déconnexion des devices
      if (socket.deviceInfo) {
        // Si le device était connecté à une game
        if (socket.gameId) {
          const roomName = `game_${socket.gameId}`;

          // Retirer le device de la game
          const game = games.find((g) => g.id === socket.gameId);
          if (game) {
            const gameDeviceIndex = game.devices.findIndex((d) => d.socketId === socket.id);
            if (gameDeviceIndex !== -1) {
              game.devices.splice(gameDeviceIndex, 1);
              console.log(`🏠 Device "${socket.deviceInfo.name}" retiré de la game ${socket.gameId}`);

              // Notifier les autres devices de la room
              socket.to(roomName).emit("device_left", {
                device: socket.deviceInfo,
                totalDevicesInGame: game.devices.length,
              });
            }
          }
        }

        // Retirer complètement le device de la liste globale
        const deviceIndex = devices.findIndex((d) => d.socketId === socket.id);
        if (deviceIndex !== -1) {
          const removedDevice = devices.splice(deviceIndex, 1)[0];
          console.log(
            `📱 Device "${removedDevice.name}" (socketId: ${removedDevice.socketId}) supprimé de la liste globale`
          );

          // Notifier le control center de la déconnexion du device
          io.to("control_center").emit("device_disconnected", {
            device: removedDevice,
            totalDevices: devices.length,
            timestamp: new Date().toISOString(),
          });
        }

        // Nettoyer les informations de la socket
        delete socket.deviceInfo;
        delete socket.gameId;
      }
    });

    // Événement pour recevoir la réponse humaine
    socket.on("human_response", async (data) => {
      try {
        if (!socket.gameId || !socket.deviceInfo) {
          socket.emit("response_error", {
            success: false,
            error: "Non connecté à une partie",
            message: "Vous devez être connecté à une partie pour envoyer une réponse",
          });
          return;
        }

        const { response } = data;

        if (!response || typeof response !== "string" || response.trim().length === 0) {
          socket.emit("response_error", {
            success: false,
            error: "Réponse invalide",
            message: "La réponse ne peut pas être vide",
          });
          return;
        }

        console.log(`👤 Réponse humaine reçue de ${socket.deviceInfo.name}: "${response}"`);

        // Transmettre la réponse au GameManager
        await gameManager.handleHumanResponse(socket.gameId, response.trim(), socket.deviceInfo);

        // Confirmer la réception
        socket.emit("response_received", {
          success: true,
          message: "Réponse reçue avec succès",
          response: response.trim(),
        });
      } catch (error) {
        console.error("Erreur lors du traitement de la réponse humaine:", error);
        socket.emit("response_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour recevoir la sélection du joueur (vote humain/IA)
    socket.on("player_selection", async (data) => {
      try {
        if (!socket.gameId || !socket.deviceInfo) {
          socket.emit("selection_error", {
            success: false,
            error: "Non connecté à une partie",
            message: "Vous devez être connecté à une partie pour voter",
          });
          return;
        }

        const { selection } = data;

        if (!selection || !["human", "ai"].includes(selection)) {
          socket.emit("selection_error", {
            success: false,
            error: "Sélection invalide",
            message: 'Vous devez choisir "human" ou "ai"',
          });
          return;
        }

        console.log(`🗳️ Vote reçu de ${socket.deviceInfo.name}: ${selection}`);

        // Transmettre le vote au GameManager
        await gameManager.handlePlayerSelection(socket.gameId, selection, socket.deviceInfo);

        // Confirmer la réception
        socket.emit("selection_received", {
          success: true,
          message: "Vote enregistré avec succès",
          selection: selection,
        });
      } catch (error) {
        console.error("Erreur lors du traitement de la sélection:", error);
        socket.emit("selection_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour obtenir les informations sur une partie en cours
    socket.on("get_game_info", (data) => {
      try {
        if (!socket.gameId) {
          socket.emit("game_info_error", {
            success: false,
            error: "Non connecté à une partie",
            message: "Vous devez être connecté à une partie",
          });
          return;
        }

        const gameInfo = gameManager.getGameInfo(socket.gameId);

        if (gameInfo) {
          socket.emit("game_info_response", {
            success: true,
            gameInfo: gameInfo,
          });
        } else {
          socket.emit("game_info_error", {
            success: false,
            error: "Partie non trouvée",
            message: "Aucune information disponible pour cette partie",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations de jeu:", error);
        socket.emit("game_info_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour demander le round suivant
    socket.on("next_round", async (data) => {
      try {
        if (!socket.gameId || !socket.deviceInfo) {
          socket.emit("next_round_error", {
            success: false,
            error: "Non connecté à une partie",
            message: "Vous devez être connecté à une partie pour demander le round suivant",
          });
          return;
        }

        console.log(`▶️ Demande de round suivant reçue de ${socket.deviceInfo.name}`);

        // Transmettre la demande au GameManager
        await gameManager.handleNextRound(socket.gameId, socket.deviceInfo);

        // Confirmer la réception
        socket.emit("next_round_received", {
          success: true,
          message: "Demande de round suivant traitée",
        });
      } catch (error) {
        console.error("Erreur lors du traitement de la demande de round suivant:", error);
        socket.emit("next_round_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événement pour vérifier le statut de connexion du control-center
    socket.on("control_center_status", () => {
      try {
        if (socket.isControlCenter) {
          socket.emit("control_center_status_response", {
            success: true,
            connected: true,
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit("control_center_status_response", {
            success: false,
            connected: false,
            message: "Non connecté au control-center",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut du control-center:", error);
        socket.emit("control_center_status_response", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });

    // Événements personnalisés pour le jeu (à étendre selon les besoins)
    socket.on("game_event", (data) => {
      if (socket.gameId) {
        const roomName = `game_${socket.gameId}`;
        socket.to(roomName).emit("game_event", {
          from: socket.deviceInfo,
          data: data,
        });
      }
    });

    // Événement pour supprimer un appareil d'une partie
    socket.on("remove_device_from_game", (data) => {
      try {
        const { gameId, deviceSocketId } = data;

        // Validation des données
        if (!gameId || !deviceSocketId) {
          socket.emit("remove_device_error", {
            success: false,
            error: "Données manquantes",
            message: "gameId et deviceSocketId sont requis",
          });
          return;
        }

        // Vérifier que la socket est un control-center
        if (!socket.isControlCenter) {
          socket.emit("remove_device_error", {
            success: false,
            error: "Non autorisé",
            message: "Seul le control-center peut supprimer des appareils",
          });
          return;
        }

        // Traiter la suppression
        handleDeviceRemoval(gameId, deviceSocketId, socket);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'appareil:", error);
        socket.emit("remove_device_error", {
          success: false,
          error: "Erreur serveur",
          message: error.message,
        });
      }
    });
  });

  // Fonctions helper pour traiter les demandes autorisées
  function handleAuthorizedDefaultDevice(deviceSocket, device, game_id) {
    try {
      // Ajouter à la liste globale des devices
      devices.push(device);

      console.log(`📱 Device par défaut autorisé ajouté: "${device.name}" (socketId: ${device.socketId})`);

      // Stocker les infos du device dans la socket
      deviceSocket.deviceInfo = device;

      // Si un game_id est fourni, joindre automatiquement la room
      if (game_id) {
        const gameId = parseInt(game_id);
        const game = games.find((g) => g.id === gameId);

        if (game) {
          // Assigner le device à la game
          device.game = gameId;

          // Ajouter le device à la game
          game.devices.push(device);

          // Joindre la room correspondante à la game
          const roomName = `game_${gameId}`;
          deviceSocket.join(roomName);

          // Mettre à jour les infos du device dans la socket
          deviceSocket.gameId = gameId;

          console.log(`🏠 Device "${device.name}" ajouté automatiquement à la room: ${roomName}`);

          // Confirmer l'ajout avec connexion à la game
          deviceSocket.emit("adddevice_success", {
            success: true,
            message: "Device ajouté avec succès et connecté à la game",
            device: device,
            game: game,
            room: roomName,
            totalDevices: devices.length,
          });

          // Envoyer l'avancement de la partie au device
          if (game.advancement) {
            deviceSocket.emit("game_advancement_update", {
              gameId: game.id,
              advancement: game.advancement,
              game: game,
              timestamp: new Date().toISOString(),
            });
            console.log(`📊 Avancement de la partie ${game.id} envoyé au device ${device.name}:`, game.advancement);
          }

          // Notifier tous les autres devices de la room
          deviceSocket.to(roomName).emit("device_joined", {
            device: device,
            totalDevicesInGame: game.devices.length,
          });

          // Notifier le control center de l'ajout du device
          io.to("control_center").emit("device_connected", {
            device: device,
            game: game,
            totalDevices: devices.length,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Game non trouvée ou pas en attente
          deviceSocket.emit("adddevice_success", {
            success: true,
            message: "Device ajouté mais impossible de rejoindre la game (non trouvée ou non disponible)",
            device: device,
            totalDevices: devices.length,
            warning: `Game ${game_id} non disponible pour connexion`,
          });
        }
      } else {
        // Pas de game_id fourni, simple ajout
        deviceSocket.emit("adddevice_success", {
          success: true,
          message: "Device ajouté avec succès à la liste globale",
          device: device,
          totalDevices: devices.length,
        });

        // Notifier le control center de l'ajout du device
        io.to("control_center").emit("device_connected", {
          device: device,
          game: null,
          totalDevices: devices.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la demande autorisée:", error);
      deviceSocket.emit("adddevice_error", {
        success: false,
        error: "Erreur serveur",
        message: error.message,
      });
    }
  }

  function handleAuthorizedGameConnection(deviceSocket, device, gameId) {
    try {
      // Ajouter le device invité à la game
      const game = games.find((g) => g.id === gameId);
      if (game) {
        game.devices.push(device);

        // Joindre la room correspondante à la game
        const roomName = `game_${gameId}`;
        deviceSocket.join(roomName);

        // Stocker les infos du device dans la socket
        deviceSocket.deviceInfo = device;
        deviceSocket.gameId = gameId;

        console.log(
          `📱 Device invité autorisé "${device.name}" (socketId: ${device.socketId}) connecté à la game ${gameId}`
        );
        console.log(`🏠 Device rejoint la room: ${roomName}`);

        // Confirmer la connexion au client
        deviceSocket.emit("connection_success", {
          success: true,
          message: "Connecté avec succès à la game en tant qu'invité",
          device: device,
          game: game,
          room: roomName,
        });

        // Envoyer l'avancement de la partie au device
        if (game.advancement) {
          deviceSocket.emit("game_advancement_update", {
            gameId: game.id,
            game: game,
            advancement: game.advancement,
            timestamp: new Date().toISOString(),
          });
          console.log(
            `📊 Avancement de la partie ${game.id} envoyé au device invité ${device.name}:`,
            game.advancement
          );
        }

        // Notifier tous les autres devices de la room
        deviceSocket.to(roomName).emit("device_joined", {
          device: device,
          totalDevicesInGame: game.devices.length,
        });

        // Notifier le control center de l'ajout du device
        io.to("control_center").emit("device_connected", {
          device: device,
          game: game,
          totalDevices: devices.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la connexion autorisée:", error);
      deviceSocket.emit("connection_error", {
        success: false,
        error: "Erreur serveur",
        message: error.message,
      });
    }
  }

  // Fonction helper pour mettre à jour l'avancement d'une partie et notifier tous les devices
  function updateGameAdvancement(gameId, newAdvancement) {
    try {
      const game = games.find((g) => g.id === parseInt(gameId));
      if (!game) {
        console.error(`❌ Partie ${gameId} non trouvée pour mise à jour de l'avancement`);
        return false;
      }

      // Mettre à jour l'avancement
      game.advancement = newAdvancement;
      console.log(`📊 Avancement de la partie ${gameId} mis à jour:`, newAdvancement);

      // Notifier tous les devices de la partie
      const roomName = `game_${gameId}`;
      if (globalIO) {
        globalIO.to(roomName).emit("game_advancement_update", {
          gameId: game.id,
          advancement: game.advancement,
          timestamp: new Date().toISOString(),
        });
        console.log(`📢 Avancement envoyé à tous les devices de la room ${roomName}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'avancement de la partie ${gameId}:`, error);
      return false;
    }
  }

  // Fonction helper pour supprimer un appareil d'une partie
  function handleDeviceRemoval(gameId, deviceSocketId, controlCenterSocket) {
    try {
      const gameIdNum = parseInt(gameId);

      // Trouver la partie
      const game = games.find((g) => g.id === gameIdNum);
      if (!game) {
        controlCenterSocket.emit("remove_device_error", {
          success: false,
          error: "Partie introuvable",
          message: `Partie ${gameId} non trouvée`,
        });
        return;
      }

      // Trouver l'appareil dans la partie
      const deviceIndex = game.devices.findIndex((d) => d.socketId === deviceSocketId);
      if (deviceIndex === -1) {
        controlCenterSocket.emit("remove_device_error", {
          success: false,
          error: "Appareil introuvable",
          message: `Appareil ${deviceSocketId} non trouvé dans la partie ${gameId}`,
        });
        return;
      }

      const device = game.devices[deviceIndex];
      console.log(`🗑️ Suppression de l'appareil ${device.name} (${device.socketId}) de la partie ${gameId}`);

      // Supprimer l'appareil de la partie
      game.devices.splice(deviceIndex, 1);

      // Si c'est un appareil par défaut, le retirer aussi de la liste globale
      if (device.defaultDevice) {
        const globalDeviceIndex = devices.findIndex((d) => d.socketId === deviceSocketId);
        if (globalDeviceIndex !== -1) {
          devices.splice(globalDeviceIndex, 1);
          console.log(`🗑️ Appareil par défaut ${device.name} supprimé de la liste globale`);
        }
      }

      // Notifier le control center du succès
      controlCenterSocket.emit("remove_device_success", {
        success: true,
        message: `Appareil ${device.name} supprimé avec succès de la partie ${gameId}`,
        data: {
          gameId: gameIdNum,
          deviceRemoved: {
            name: device.name,
            socketId: device.socketId,
            type: device.type,
          },
          remainingDevices: game.devices.length,
          gameStatus: game.status,
        },
      });

      // Notifier tous les autres devices de la room de la suppression
      const roomName = `game_${gameId}`;
      io.to(roomName).emit("device_removed", {
        device: device,
        remainingDevices: game.devices.length,
        gameStatus: game.status,
      });

      // Notifier le control center de la mise à jour
      io.to("control_center").emit("device_removed", {
        device: device,
        game: game,
        totalDevices: devices.length,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Appareil ${device.name} supprimé avec succès de la partie ${gameId}`);
      console.log(`📊 Partie ${gameId}: ${game.devices.length} appareil(s) restant(s)`);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'appareil:", error);
      controlCenterSocket.emit("remove_device_error", {
        success: false,
        error: "Erreur serveur",
        message: error.message,
      });
    }
  }
};
