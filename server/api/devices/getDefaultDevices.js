const { devices } = require("../../store.js");

/**
 * Route GET /api/devices/default
 * Récupère la liste des devices par défaut connectés
 */
const getDefaultDevices = (req, res) => {
  try {
    // Filtrer seulement les devices par défaut (defaultDevice = true)
    const defaultDevices = devices.filter((device) => device.defaultDevice === true);

    // Formater la réponse
    const response = {
      success: true,
      message: "Liste des devices par défaut récupérée avec succès",
      data: {
        totalDevices: defaultDevices.length,
        devices: defaultDevices.map((device) => ({
          id: device.socketId, // Utiliser socketId comme ID unique
          name: device.name,
          type: device.type,
          socketId: device.socketId,
          game: device.game,
          connected: true, // Si le device est dans la liste, il est connecté
          lastSeen: new Date().toISOString(), // Timestamp de la dernière activité
        })),
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`📱 Liste des devices par défaut récupérée: ${defaultDevices.length} devices`);

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des devices par défaut:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des devices par défaut",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { getDefaultDevices };
