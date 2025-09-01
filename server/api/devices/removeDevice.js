/**
 * Route API pour supprimer un appareil d'une partie
 * DELETE /api/devices/:gameId/remove/:deviceSocketId
 */

const { games, devices } = require("../../store.js");

// Variable globale pour stocker la référence à Socket.IO
let io = null;

// Fonction pour initialiser Socket.IO
function setSocketIO(socketIO) {
  io = socketIO;
}

// Fonction principale de suppression
function removeDevice(req, res) {
  try {
    const { gameId, deviceSocketId } = req.params;

    console.log(`🗑️ Demande de suppression de l'appareil ${deviceSocketId} de la partie ${gameId}`);

    // Valider les paramètres
    if (!gameId || !deviceSocketId) {
      return res.status(400).json({
        success: false,
        message: "gameId et deviceSocketId sont requis",
        timestamp: new Date().toISOString(),
      });
    }

    // Convertir gameId en nombre
    const gameIdNum = parseInt(gameId);

    // Trouver la partie
    const game = games.find((g) => g.id === gameIdNum);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: `Partie ${gameId} non trouvée`,
        timestamp: new Date().toISOString(),
      });
    }

    // Trouver l'appareil dans la partie
    const deviceIndex = game.devices.findIndex((d) => d.socketId === deviceSocketId);
    if (deviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Appareil ${deviceSocketId} non trouvé dans la partie ${gameId}`,
        timestamp: new Date().toISOString(),
      });
    }

    const device = game.devices[deviceIndex];
    console.log(`📱 Appareil trouvé: ${device.name} (${device.socketId})`);

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

    // Mettre à jour le statut de la partie si nécessaire
    if (game.devices.length === 0 && game.status === "in_progress") {
      game.status = "waiting";
      console.log(`🔄 Partie ${gameId} remise en attente (aucun appareil)`);
    }

    console.log(`✅ Appareil ${device.name} supprimé avec succès de la partie ${gameId}`);
    console.log(`📊 Partie ${gameId}: ${game.devices.length} appareil(s) restant(s)`);

    // Notifier l'appareil supprimé via Socket.IO si disponible
    if (io) {
      try {
        // Trouver la socket de l'appareil supprimé et lui envoyer directement l'événement
        const deviceSocket = io.sockets.sockets.get(device.socketId);

        if (deviceSocket) {
          // Envoyer directement l'événement de suppression à l'appareil
          deviceSocket.emit("device_removed_by_admin", {
            success: false,
            message: "Vous avez été supprimé de la partie par l'administrateur",
            data: {
              gameId: gameIdNum,
              reason: "Supprimé par l'administrateur",
              timestamp: new Date().toISOString(),
            },
          });

          // Déconnecter l'appareil de la room de la partie
          const roomName = `game_${gameIdNum}`;
          deviceSocket.leave(roomName);

          // Nettoyer les informations de la socket
          delete deviceSocket.deviceInfo;
          delete deviceSocket.gameId;

          console.log(`🔔 Appareil ${device.socketId} notifié et déconnecté de la partie ${gameIdNum}`);
        } else {
          console.log(`⚠️ Socket de l'appareil ${device.socketId} non trouvée (déjà déconnecté)`);
        }
      } catch (socketError) {
        console.error("❌ Erreur lors de la notification Socket.IO:", socketError);
      }
    } else {
      console.log("⚠️ Socket.IO non disponible pour la notification");
    }

    // Réponse de succès
    res.json({
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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'appareil:", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de l'appareil",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { removeDevice, setSocketIO };
