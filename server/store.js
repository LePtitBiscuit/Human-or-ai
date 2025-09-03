/**
 * Store pour la gestion des données du jeu Human vs AI
 */

class Game {
  constructor() {
    this.id = null;
    this.rounds = 0;
    this.currentRound = 0;
    this.devices = [];
    this.score = [];
    this.status = null;
    this.advancement = "waiting_for_launch";
    this.currentQuestion = null;
    this.displayedResponse = null;
    this.roundResults = {};
    this.gameMode = null;
    this.players = [];
    // Données de fin de partie
    this.gameEnded = false;
    this.finalScore = null;
    this.finalRoundNumber = null;
    this.finalRoundResults = null;
    this.gameResult = null; // 'won' ou 'lost'
  }
}

class Player {
  constructor() {
    this.name = null;
    this.socketId = null;
    this.game = null;
    this.score = [];
  }
}

class Device {
  constructor() {
    this.name = null;
    this.adresseIp = null; // Optionnel, peut être null
    this.type = null;
    this.game = null;
    this.defaultDevice = null;
    this.socketId = null; // Identifiant unique principal
  }
}

// Liste pour stocker toutes les games
const games = [];

// Liste pour stocker tous les devices
const devices = [];

module.exports = { Game, Device, games, devices, Player };
