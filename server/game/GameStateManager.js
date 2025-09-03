/**
 * GameStateManager - Gestionnaire des états et notifications du jeu
 * Centralise l'émission des événements Socket.IO et la gestion des états
 */

const { Device, games, devices } = require("../store.js");

class GameStateManager {
  constructor(io) {
    this.io = io;
  }

  /**
   * Émet une mise à jour de statut à tous les devices d'une room
   * @param {string} roomName - Nom de la room
   * @param {string} status - Statut actuel
   * @param {Object} additionalData - Données supplémentaires (optionnel)
   */
  emitStatusUpdate(roomName, status, additionalData = {}) {
    const payload = {
      status: status,
      timestamp: Date.now(),
      ...additionalData,
    };

    this.io.to(roomName).emit("game_status_update", payload);
    console.log(`📡 Statut envoyé à ${roomName}: ${status}`);
  }

  /**
   * Émet une erreur de jeu
   * @param {string} roomName - Nom de la room
   * @param {string} errorTitle - Titre de l'erreur
   * @param {string} errorMessage - Message d'erreur détaillé
   */
  emitGameError(roomName, errorTitle, errorMessage) {
    const payload = {
      success: false,
      error: errorTitle,
      message: errorMessage,
      timestamp: Date.now(),
    };

    this.io.to(roomName).emit("game_error", payload);
    console.log(`❌ Erreur envoyée à ${roomName}: ${errorTitle}`);
  }

  /**
   * Émet des informations générales sur la partie
   * @param {string} roomName - Nom de la room
   * @param {Object} gameInfo - Informations sur la partie
   */
  emitGameInfo(roomName, gameInfo) {
    this.io.to(roomName).emit("game_info", {
      ...gameInfo,
      timestamp: Date.now(),
    });
    console.log(`ℹ️ Informations de jeu envoyées à ${roomName}`);
  }

  /**
   * Émet un message de debug (seulement en mode développement)
   * @param {string} roomName - Nom de la room
   * @param {string} message - Message de debug
   * @param {Object} data - Données de debug
   */
  emitDebugMessage(roomName, message, data = {}) {
    if (process.env.NODE_ENV === "development") {
      this.io.to(roomName).emit("debug_message", {
        message: message,
        data: data,
        timestamp: Date.now(),
      });
      console.log(`🐛 Debug envoyé à ${roomName}: ${message}`);
    }
  }

  /**
   * Valide si un statut est valide
   * @param {string} status - Statut à valider
   * @returns {boolean} True si le statut est valide
   */
  isValidStatus(status) {
    const validStatuses = [
      "waiting",
      "in_progress",
      "waiting_for_question_generation",
      "waiting_for_human_response",
      "waiting_for_ai_response",
      "waiting_for_player_selection",
      "round_concluded",
      "game_finished",
      "paused",
      "error",
    ];

    return validStatuses.includes(status);
  }

  /**
   * Obtient une description lisible d'un statut
   * @param {string} status - Statut
   * @returns {string} Description du statut
   */
  getStatusDescription(status) {
    const descriptions = {
      waiting: "En attente de joueurs",
      in_progress: "Partie en cours",
      waiting_for_question_generation: "Génération de la question en cours...",
      waiting_for_human_response: "En attente de la réponse du joueur humain",
      waiting_for_ai_response: "Génération de la réponse IA en cours...",
      waiting_for_player_selection: "En attente des votes des joueurs",
      round_concluded: "Round terminé",
      game_finished: "Partie terminée",
      paused: "Partie en pause",
      error: "Erreur de jeu",
    };

    return descriptions[status] || "Statut inconnu";
  }

  /**
   * Émet un countdown pour un événement
   * @param {string} roomName - Nom de la room
   * @param {number} seconds - Nombre de secondes
   * @param {string} message - Message du countdown
   */
  emitCountdown(roomName, seconds, message) {
    let timeLeft = seconds;

    const countdownInterval = setInterval(() => {
      this.io.to(roomName).emit("countdown", {
        timeLeft: timeLeft,
        message: message,
        timestamp: Date.now(),
      });

      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(countdownInterval);
        this.io.to(roomName).emit("countdown_finished", {
          message: "Temps écoulé !",
          timestamp: Date.now(),
        });
      }
    }, 1000);

    return countdownInterval;
  }

  /**
   * Émet des statistiques en temps réel
   * @param {string} roomName - Nom de la room
   * @param {Object} stats - Statistiques
   */
  emitRealTimeStats(roomName, stats) {
    this.io.to(roomName).emit("realtime_stats", {
      ...stats,
      timestamp: Date.now(),
    });
  }

  /**
   * Émet une notification système
   * @param {string} roomName - Nom de la room
   * @param {string} type - Type de notification ('info', 'warning', 'success', 'error')
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   */
  emitNotification(roomName, type, title, message) {
    const validTypes = ["info", "warning", "success", "error"];
    if (!validTypes.includes(type)) {
      type = "info";
    }

    this.io.to(roomName).emit("notification", {
      type: type,
      title: title,
      message: message,
      timestamp: Date.now(),
    });

    console.log(`🔔 Notification ${type} envoyée à ${roomName}: ${title}`);
  }

  /**
   * Émet l'état de connexion des joueurs
   * @param {string} roomName - Nom de la room
   * @param {Array} devices - Liste des devices connectés
   */
  emitPlayersStatus(roomName, devices) {
    const playersStatus = devices.map((device) => ({
      name: device.name,
      type: device.type,
      isConnected: device.socketId !== null,
      lastSeen: Date.now(),
    }));

    this.io.to(roomName).emit("players_status", {
      players: playersStatus,
      totalPlayers: devices.length,
      connectedPlayers: playersStatus.filter((p) => p.isConnected).length,
      timestamp: Date.now(),
    });
  }

  /**
   * Émet un événement uniquement aux devices ayant un des types spécifiés
   * @param {Array} devices - Liste des devices de la game
   * @param {string} eventName - Nom de l'événement
   * @param {Object} data - Données à envoyer
   * @param {Array<string>} allowedTypes - Types de devices autorisés à recevoir l'événement
   */
  emitToDevicesByType(devices, eventName, data, allowedTypes) {
    let sentCount = 0;

    // Parcourir tous les devices de la game
    devices.forEach((device) => {
      // Vérifier si le device a un type autorisé et est connecté
      if (allowedTypes.includes(device.type) && device.socketId) {
        // Émettre à ce device spécifique
        this.io.to(device.socketId).emit(eventName, data);
        sentCount++;
      }
    });

    console.log(`📤 Événement "${eventName}" envoyé à ${sentCount} devices de types: ${allowedTypes.join(", ")}`);
  }

  /**
   * Met à jour l'avancement de la partie et émet la mise à jour à tous les devices
   * @param {string} roomName - Nom de la room (format: "game_X")
   * @param {string} newAdvancement - Nouvel avancement
   */
  updateGameAdvancement(roomName, newAdvancement) {
    try {
      // Extraire l'ID de la partie depuis le nom de la room
      const gameId = roomName.replace("game_", "");
      const game = games.find((g) => g.id === parseInt(gameId));

      // Mettre à jour l'avancement dans la partie
      if (game && game.advancement !== undefined) {
        game.advancement = newAdvancement;
        console.log(`📊 Avancement de la partie ${gameId} mis à jour:`, newAdvancement);
      }

      // Émettre la mise à jour à tous les devices de la room
      this.io.to(roomName).emit("game_advancement_update", {
        gameId: parseInt(gameId),
        advancement: newAdvancement,
        game: game,
        timestamp: new Date().toISOString(),
      });

      console.log(`📢 Avancement envoyé à tous les devices de la room ${roomName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'avancement de la partie ${roomName}:`, error);
      return false;
    }
  }
}

module.exports = GameStateManager;
