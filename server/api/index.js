const express = require("express");
const { createGame, setSocketIO: setCreateGameSocketIO } = require("./games/createGame.js");
const { launchGame, setSocketIO: setLaunchGameSocketIO } = require("./games/launchGame.js");
const { stopGame, setSocketIO: setStopGameSocketIO } = require("./games/stopGame.js");
const { getGames } = require("./games/getGames.js");

const { authenticate, verifyToken, verifyTokenRoute, getAuthInfo } = require("./auth.js");
const {
  getDefaultDevices,
  getAvailableDefaultDevices,
  removeDevice,
  setRemoveDeviceSocketIO,
} = require("./devices/index.js");
const { getPendingRequests } = require("./devices/getPendingRequests.js");

const router = express.Router();

/**
 * Centralisation de toutes les routes d'API
 * Chaque route est définie dans un fichier séparé
 */

// Route de test pour vérifier que l'API fonctionne
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "API fonctionnelle",
    version: "1.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Route de debug pour lister toutes les routes disponibles
router.get("/debug/routes", (req, res) => {
  res.json({
    success: true,
    message: "Routes API disponibles",
    routes: [
      "GET /api/test - Test de l'API",
      "GET /api/debug/routes - Liste des routes API",
      "POST /api/auth - Authentification avec code PIN",
      "GET /api/auth/verify - Vérification du token JWT",
      "GET /api/auth/info - Informations sur l'authentification",
      "GET /api/getgames - Récupérer toutes les parties",
      "POST /api/creategame - Créer une nouvelle partie",
      "POST /api/launchgame/:id - Lancer une partie",
      "POST /api/stopgame/:id - Arrêter une partie",
      "DELETE /api/devices/:gameId/remove/:deviceSocketId - Supprimer un appareil d'une partie",
      "GET /api/devices/default - Récupérer la liste des devices par défaut",
      "GET /api/devices/available - Récupérer la liste des devices par défaut disponibles",
      "GET /api/devices/pending-requests - Récupérer la liste des demandes d'autorisation en attente",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Routes d'authentification
router.post("/auth", authenticate);
router.get("/auth/verify", verifyToken, verifyTokenRoute);
router.get("/auth/info", getAuthInfo);

// Routes pour les games
router.get("/getgames", getGames);
router.post("/creategame", createGame);
router.post("/launchgame/:id", launchGame);
router.post("/stopgame/:id", stopGame);
router.delete("/devices/:gameId/remove/:deviceSocketId", removeDevice);

// Routes pour les devices
router.get("/devices/default", getDefaultDevices);
router.get("/devices/available", getAvailableDefaultDevices);
router.get("/devices/pending-requests", getPendingRequests);

// Ici vous pourrez ajouter d'autres routes :
// router.get('/getgame/:id', getGame)
// router.put('/updategame/:id', updateGame)
// router.delete('/deletegame/:id', deleteGame)
// router.get('/listgames', listGames)

// Routes pour d'autres fonctionnalités :
// router.post('/joindevice', joinDevice)
// router.get('/getstatus/:gameId', getStatus)

// Fonction pour injecter Socket.IO dans les routes qui en ont besoin
const initializeSocketIO = (io, gameManager) => {
  setCreateGameSocketIO(io);
  setLaunchGameSocketIO(io, gameManager);
  setStopGameSocketIO(io, gameManager);
  setRemoveDeviceSocketIO(io);
};

module.exports = { router, initializeSocketIO };
