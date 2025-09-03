const { Game, Device, games, devices } = require("../../store.js");

// Variable pour stocker l'instance Socket.IO (sera injectée)
let io = null;

// Fonction pour injecter l'instance Socket.IO
const setSocketIO = (socketIOInstance) => {
  io = socketIOInstance;
};

/**
 * Route POST /api/creategame
 * Crée une nouvelle game et l'ajoute à la liste des games
 */
const createGame = (req, res) => {
  try {
    const { nombreManches, devicesData, gameMode } = req.body;
    console.log(req.body);

    // Validation des données reçues
    if (!nombreManches || !devicesData || !Array.isArray(devicesData)) {
      return res.status(400).json({
        success: false,
        error: "Données manquantes",
        message: "nombreManches et devicesData (tableau) sont requis",
      });
    }

    // Générer un ID basé sur le nombre d'éléments dans games + 1
    const gameId = games.length + 1;

    // Créer une nouvelle instance de Game
    const newGame = new Game();
    newGame.id = gameId;
    newGame.status = "waiting";
    newGame.gameMode = gameMode || "solo";

    // Initialiser les rounds basés sur le nombre de manches
    newGame.rounds = nombreManches;
    newGame.score = Array(nombreManches).fill(null);

    // Traiter les devices reçus
    const gameDevices = [];

    for (const deviceData of devicesData) {
      if (!deviceData.socketId) {
        return res.status(400).json({
          success: false,
          error: "SocketId manquant",
          message: "Chaque device doit avoir un socketId",
        });
      }

      // Chercher si le device existe déjà dans la liste globale
      let existingDevice = devices.find((d) => d.socketId === deviceData.socketId);

      if (!existingDevice) {
        return res.status(404).json({
          success: false,
          error: "Appareil introuvable",
          message: `Aucun appareil avec le socketId ${deviceData.socketId} n'a été trouvé dans la liste globale des devices`,
        });
      }

      // Ajouter le device à la game
      gameDevices.push(existingDevice);
    }

    newGame.devices = gameDevices;

    // Ajouter la game à la liste
    games.push(newGame);

    // Ajouter les devices sélectionnés à la room de la game (si Socket.IO est disponible)
    if (io) {
      const roomName = `game_${gameId}`;

      gameDevices.forEach((device) => {
        if (device.socketId) {
          // Récupérer la socket du device
          const deviceSocket = io.sockets.sockets.get(device.socketId);
          if (deviceSocket) {
            // Ajouter la socket à la room de la game
            deviceSocket.join(roomName);

            // Mettre à jour les infos du device dans la socket
            device.game = gameId;
            deviceSocket.gameId = gameId;
            deviceSocket.deviceInfo = device;

            // Notifier le device qu'il a été ajouté à une game
            deviceSocket.emit("added_to_game", {
              success: true,
              message: "Vous avez été ajouté à une nouvelle game",
              game: newGame,
              room: roomName,
            });

            // Envoyer l'avancement initial de la game au device
            deviceSocket.emit("game_advancement_update", {
              gameId: gameId,
              advancement: newGame.advancement,
              game: newGame,
              timestamp: new Date().toISOString(),
            });

            console.log(`🏠 Device "${device.name}" (${device.socketId}) ajouté à la room: ${roomName}`);
            console.log(`📊 Avancement initial envoyé au device "${device.name}": ${newGame.advancement}`);
          }
        }
      });

      // Notifier tous les devices de la room qu'une nouvelle game a été créée
      io.to(roomName).emit("game_created", {
        game: newGame,
        totalDevices: gameDevices.length,
      });
    }

    console.log(`🎮 Nouvelle game créée avec l'ID: ${gameId}`);
    console.log(`🎯 Nombre de manches: ${nombreManches}`);
    console.log(`📱 Devices connectés: ${gameDevices.length}`);
    console.log(`📊 Avancement initial: ${newGame.advancement}`);

    res.status(201).json({
      success: true,
      message: "Game créée avec succès",
      game: newGame,
      totalGames: games.length,
      totalDevices: devices.length,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la game:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la game",
      message: error.message,
    });
  }
};

module.exports = { createGame, setSocketIO };
