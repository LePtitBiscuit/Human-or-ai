const { games, devices } = require("../../store.js");

/**
 * Route GET /api/getgames
 * Récupère toutes les parties avec leurs informations détaillées
 */
const getGames = (req, res) => {
  try {
    // Transformer chaque game pour inclure toutes les informations demandées
    const gamesWithDetails = games
      .slice()
      .reverse()
      .map((game) => {
        // Séparer les appareils par type (defaultDevice)
        const defaultDevices = game.devices.filter((device) => device.defaultDevice === true);
        const nonDefaultDevices = game.devices.filter((device) => device.defaultDevice === false);

        return {
          id: game.id,
          status: game.status,
          score: game.score,
          advancement: game.advancement,
          defaultDevices: defaultDevices,
          nonDefaultDevices: nonDefaultDevices,
          // Données de fin de partie
          gameEnded: game.gameEnded,
          finalScore: game.finalScore,
          finalRoundNumber: game.finalRoundNumber,
          finalRoundResults: game.finalRoundResults,
          gameResult: game.gameResult,
          currentRound: game.currentRound,
          rounds: game.rounds,
          gameMode: game.gameMode,
          players: game.players,
        };
      });

    console.log(`🎮 Récupération de ${gamesWithDetails.length} parties`);

    res.status(200).json({
      success: true,
      message: "Parties récupérées avec succès",
      totalGames: games.length,
      games: gamesWithDetails,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des parties:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des parties",
      message: error.message,
    });
  }
};

module.exports = { getGames };
