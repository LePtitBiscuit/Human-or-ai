/**
 * Store pour la gestion des données du jeu Human vs AI
 */

class Game {
  constructor() {
    this.id = null;
    this.rounds = [];
    this.devices = [];
    this.score = [];
    this.status = null;
    this.advancement = "waiting_for_launch";
    this.currentQuestion = null;
    this.displayedResponse = null;
    this.roundResults = {};
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

module.exports = { Game, Device, games, devices };
