/**
 * Module de gestion des demandes d'autorisation en attente
 * Accessible depuis l'API et le socket handler
 */

// Liste des demandes d'autorisation en attente
const pendingRequests = [];

// Fonction pour ajouter une demande à la liste
function addPendingRequest(request) {
  pendingRequests.push(request);
  console.log(`📝 Demande ajoutée à la liste d'attente. Total: ${pendingRequests.length}`);
  return pendingRequests.length;
}

// Fonction pour supprimer une demande de la liste
function removePendingRequest(socketId) {
  const index = pendingRequests.findIndex((req) => req.socketId === socketId);
  if (index !== -1) {
    pendingRequests.splice(index, 1);
    console.log(`🗑️ Demande supprimée de la liste d'attente. Total: ${pendingRequests.length}`);
    return pendingRequests.length;
  }
  return pendingRequests.length;
}

// Fonction pour récupérer toutes les demandes en attente
function getPendingRequests() {
  return [...pendingRequests]; // Retourner une copie pour éviter la modification externe
}

// Fonction pour récupérer le nombre de demandes en attente
function getPendingRequestsCount() {
  return pendingRequests.length;
}

// Fonction pour notifier le control center (nécessite l'instance io)
function notifyControlCenter(io, count) {
  if (io) {
    // Notification du compteur uniquement (pas de notification visuelle)
    io.to("control_center").emit("pending_requests_count", {
      count: count,
      timestamp: new Date().toISOString(),
    });
  }
}

// Fonction pour envoyer une notification toast au control center
function sendToastNotification(io, message, type = "info") {
  if (io) {
    io.to("control_center").emit("toast_notification", {
      message: message,
      type: type, // "info", "success", "warning", "error"
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random().toString(36).substr(2, 9),
    });
  }
}

module.exports = {
  addPendingRequest,
  removePendingRequest,
  getPendingRequests,
  getPendingRequestsCount,
  notifyControlCenter,
  sendToastNotification,
};
