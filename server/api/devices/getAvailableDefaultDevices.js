const { devices } = require("../../store.js");

/**
 * Route GET /api/devices/available
 * Récupère la liste des devices par défaut disponibles (sans game)
 * Séparés en deux catégories : devices de réponse et devices de présentation
 */
const getAvailableDefaultDevices = (req, res) => {
  try {
    // Filtrer seulement les devices par défaut disponibles (defaultDevice = true et game = null)
    const availableDefaultDevices = devices.filter((device) => device.defaultDevice === true && device.game === null);

    // Séparer les devices par type
    const defaultResponseDevices = availableDefaultDevices.filter(
      (device) => device.type === "reponse_input" || device.type === "response_input"
    );

    const defaultPresentationDevices = availableDefaultDevices.filter(
      (device) => device.type === "presentation" || device.type === "presentation_device"
    );

    // Formater la réponse
    const response = {
      success: true,
      message: "Liste des devices par défaut disponibles récupérée avec succès",
      data: {
        totalAvailableDevices: availableDefaultDevices.length,
        default_response_devices: {
          count: defaultResponseDevices.length,
          devices: defaultResponseDevices.map((device) => ({
            id: device.socketId,
            name: device.name,
            type: device.type,
            socketId: device.socketId,
            game: device.game,
            connected: true,
            lastSeen: new Date().toISOString(),
          })),
        },
        default_presentation_devices: {
          count: defaultPresentationDevices.length,
          devices: defaultPresentationDevices.map((device) => ({
            id: device.socketId,
            name: device.name,
            type: device.type,
            socketId: device.socketId,
            game: device.game,
            connected: true,
            lastSeen: new Date().toISOString(),
          })),
        },
      },
      timestamp: new Date().toISOString(),
    };

    console.log(
      `📱 Liste des devices par défaut disponibles récupérée: ${availableDefaultDevices.length} devices total (${defaultResponseDevices.length} réponse, ${defaultPresentationDevices.length} présentation)`
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des devices par défaut disponibles:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des devices par défaut disponibles",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { getAvailableDefaultDevices };
