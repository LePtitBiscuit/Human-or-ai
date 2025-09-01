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
        // Créer le mapping des scores par round
        const scoreMapping = {};
        game.rounds.forEach((round, index) => {
          scoreMapping[`round_${index + 1}`] = round;
        });

        // Séparer les appareils par type (defaultDevice)
        const defaultDevices = game.devices.filter((device) => device.defaultDevice === true);
        const nonDefaultDevices = game.devices.filter((device) => device.defaultDevice === false);

        return {
          id: game.id,
          status: game.status,
          score: scoreMapping,
          defaultDevices: defaultDevices,
          nonDefaultDevices: nonDefaultDevices,
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
