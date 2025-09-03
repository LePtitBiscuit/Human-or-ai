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

    // Vérifier si c'est un joueur ou un device
    let device = null;
    let isPlayer = false;

    // Chercher d'abord dans les joueurs
    const playerIndex = game.players.findIndex((p) => p.socketId === deviceSocketId);
    if (playerIndex !== -1) {
      device = game.players[playerIndex];
      isPlayer = true;
      console.log(`👤 Joueur trouvé: ${device.name} (${device.socketId})`);
    } else {
      // Chercher dans les devices
      const deviceIndex = game.devices.findIndex((d) => d.socketId === deviceSocketId);
      if (deviceIndex === -1) {
        return res.status(404).json({
          success: false,
          message: `Appareil ${deviceSocketId} non trouvé dans la partie ${gameId}`,
          timestamp: new Date().toISOString(),
        });
      }
      device = game.devices[deviceIndex];
      console.log(`📱 Appareil trouvé: ${device.name} (${device.socketId})`);
    }

    // Supprimer selon le type
    if (isPlayer) {
      // Supprimer le joueur de la liste des joueurs
      game.players.splice(playerIndex, 1);
      console.log(`✅ Joueur ${device.name} supprimé avec succès de la partie ${gameId}`);
      console.log(`📊 Partie ${gameId}: ${game.players.length} joueur(s) restant(s)`);
    } else {
      // Supprimer l'appareil de la partie
      game.devices.splice(
        game.devices.findIndex((d) => d.socketId === deviceSocketId),
        1
      );
      console.log(`✅ Appareil ${device.name} supprimé avec succès de la partie ${gameId}`);
      console.log(`📊 Partie ${gameId}: ${game.devices.length} appareil(s) restant(s)`);
    }

    // Si c'est un appareil par défaut (et pas un joueur), le retirer aussi de la liste globale
    if (!isPlayer && device.defaultDevice) {
      const globalDeviceIndex = devices.findIndex((d) => d.socketId === deviceSocketId);
      if (globalDeviceIndex !== -1) {
        device.game = null;
        console.log(`🗑️ Appareil par défaut ${device.name} supprimé de la partie`);
      }
    }

    // Mettre à jour le statut de la partie si nécessaire
    // if (game.devices.length === 0 && game.status === "in_progress") {
    //   game.status = "waiting";
    //   console.log(`🔄 Partie ${gameId} remise en attente (aucun appareil)`);
    // }

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
    const entityType = isPlayer ? "Joueur" : "Appareil";
    const remainingCount = isPlayer ? game.players.length : game.devices.length;

    res.json({
      success: true,
      message: `${entityType} ${device.name} supprimé avec succès de la partie ${gameId}`,
      data: {
        gameId: gameIdNum,
        deviceRemoved: {
          name: device.name,
          socketId: device.socketId,
          type: isPlayer ? "player" : device.type,
          isPlayer: isPlayer,
        },
        remainingDevices: game.devices.length,
        remainingPlayers: game.players.length,
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
