const { games } = require("../../store.js");
const GameManager = require("../../game/GameManager");

// Variable pour stocker l'instance Socket.IO (sera injectée)
let io = null;
let gameManager = null;

// Fonction pour injecter l'instance Socket.IO et GameManager
const setSocketIO = (socketIOInstance, gameManagerInstance) => {
  io = socketIOInstance;
  gameManager = gameManagerInstance;
};

/**
 * Route POST /api/launchgame/:id
 * Lance une game existante
 */
const launchGame = async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    // Validation des données reçues
    if (!gameId || isNaN(gameId)) {
      return res.status(400).json({
        success: false,
        error: "ID invalide",
        message: "Un ID de game valide est requis dans l'URL",
      });
    }

    // Chercher la game par son ID
    const game = games.find((g) => g.id === gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Game introuvable",
        message: `Aucune game avec l'ID ${gameId} n'a été trouvée`,
      });
    }

    // Vérifier le statut de la game
    if (game.status !== "waiting") {
      return res.status(400).json({
        success: false,
        error: "Statut invalide",
        message: `La game ${gameId} ne peut pas être lancée. Statut actuel: ${game.status}`,
      });
    }

    // Lancer la game
    game.status = "in_progress";

    console.log(`🚀 Game ${gameId} lancée avec succès`);

    // Démarrer la logique de jeu avec le GameManager
    if (gameManager) {
      try {
        await gameManager.startGame(game);

        res.status(200).json({
          success: true,
          message: "Game lancée avec succès et logique de jeu démarrée",
          game: game,
        });
      } catch (error) {
        console.error("Erreur lors du démarrage de la logique de jeu:", error);

        // Remettre le statut à waiting en cas d'erreur
        game.status = "waiting";

        res.status(500).json({
          success: false,
          error: "Erreur lors du démarrage de la logique de jeu",
          message: error.message,
        });
      }
    } else {
      // Fallback si GameManager n'est pas disponible
      res.status(500).json({
        success: false,
        error: "GameManager non initialisé",
        message: "Le gestionnaire de jeu n'est pas disponible",
      });
    }
  } catch (error) {
    console.error("Erreur lors du lancement de la game:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du lancement de la game",
      message: error.message,
    });
  }
};

module.exports = { launchGame, setSocketIO };
