const { games } = require('../../store.js')

// Variable pour stocker l'instance Socket.IO (sera injectée)
let io = null
let gameManager = null

// Fonction pour injecter l'instance Socket.IO et GameManager
const setSocketIO = (socketIOInstance, gameManagerInstance) => {
  io = socketIOInstance
  gameManager = gameManagerInstance
}

/**
 * Route POST /api/stopgame/:id
 * Arrête une game en cours
 */
const stopGame = (req, res) => {
  try {
    const gameId = parseInt(req.params.id)

    // Validation des données reçues
    if (!gameId || isNaN(gameId)) {
      return res.status(400).json({
        success: false,
        error: 'ID invalide',
        message: "Un ID de game valide est requis dans l'URL",
      })
    }

    // Chercher la game par son ID
    const game = games.find((g) => g.id === gameId)

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game introuvable',
        message: `Aucune game avec l'ID ${gameId} n'a été trouvée`,
      })
    }

    // Vérifier le statut de la game
    if (game.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide',
        message: `La game ${gameId} ne peut pas être arrêtée. Statut actuel: ${game.status}`,
      })
    }

    // Arrêter la game
    game.status = 'stopped'

    console.log(`⏹️ Game ${gameId} arrêtée`)

    // Fermer les sockets des devices non-default et nettoyer la logique de jeu
    if (io && gameManager) {
      try {
        // Notifier tous les devices que la partie est arrêtée
        const roomName = `game_${gameId}`
        io.to(roomName).emit('game_stopped', {
          success: true,
          message: 'La partie a été arrêtée',
          gameId: gameId,
          timestamp: Date.now(),
        })

        // Fermer les sockets des devices qui ne sont pas par défaut
        game.devices.forEach((device) => {
          if (!device.defaultDevice && device.socketId) {
            console.log(`🔌 Fermeture de la socket du device "${device.name}" (${device.socketId})`)

            // Obtenir la socket et la déconnecter
            const socket = io.sockets.sockets.get(device.socketId)
            if (socket) {
              socket.emit('game_ended', {
                message: 'La partie a été arrêtée, vous allez être déconnecté',
                gameId: gameId,
              })
              socket.disconnect(true)
            }
          } else if (device.defaultDevice) {
            // Réinitialiser les devices par défaut
            device.game = null
            device.socketId = null
            console.log(`🔄 Device par défaut "${device.name}" réinitialisé`)
          }
        })

        // Arrêter le GameManager pour cette partie
        gameManager.stopGame(gameId)

        // Vider la liste des devices de la game
        game.devices = []

        console.log(`📢 Notifications envoyées et sockets fermées pour la game ${gameId}`)
      } catch (error) {
        console.error('Erreur lors de la fermeture des sockets:', error)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Game arrêtée avec succès',
      game: game,
    })
  } catch (error) {
    console.error("Erreur lors de l'arrêt de la game:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'arrêt de la game",
      message: error.message,
    })
  }
}

module.exports = { stopGame, setSocketIO }
