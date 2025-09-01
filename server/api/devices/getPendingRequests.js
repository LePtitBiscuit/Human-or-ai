/**
 * Route pour récupérer toutes les demandes d'autorisation en attente
 * GET /api/devices/pending-requests
 */
const pendingRequestsManager = require("../../modules/pendingRequestsManager.js");

const getPendingRequests = (req, res) => {
  try {
    console.log("🔍 Récupération des demandes en attente via le module...");

    // Utiliser le module de gestion des demandes
    const pendingRequests = pendingRequestsManager.getPendingRequests();
    const count = pendingRequestsManager.getPendingRequestsCount();

    console.log(`📋 Récupération des demandes en attente: ${count} demande(s)`);

    res.json({
      success: true,
      message: "Liste des demandes en attente récupérée avec succès",
      data: {
        count: count,
        requests: pendingRequests,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des demandes en attente:", error);

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des demandes en attente",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { getPendingRequests };
