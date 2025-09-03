const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { router: apiRoutes, initializeSocketIO } = require("./api/index.js");
const GameManager = require("./game/GameManager");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());

// Middleware de logging
app.use(morgan("combined"));

// Middleware CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware pour parser le JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Serveur Human vs AI en fonctionnement",
    timestamp: new Date().toISOString(),
  });
});

// Utiliser les routes d'API depuis le dossier api
app.use("/", apiRoutes);

// Route pour servir des fichiers statiques (optionnel)
app.use("/static", express.static("public"));

// Gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.originalUrl,
  });
});

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err.stack);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "development" ? err.message : "Une erreur est survenue",
  });
});

// Créer une instance GameManager
const gameManager = new GameManager(io);

// Configuration Socket.IO avec l'instance GameManager
require("./socket/socketHandler.js")(io, gameManager);

// Injecter Socket.IO et GameManager dans les routes API
initializeSocketIO(io, gameManager);

// Démarrage du serveur
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO activé`);
});

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", () => {
  console.log("🛑 Signal SIGTERM reçu, arrêt du serveur...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Signal SIGINT reçu, arrêt du serveur...");
  process.exit(0);
});
