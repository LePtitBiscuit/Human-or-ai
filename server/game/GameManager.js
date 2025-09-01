const { generateQuestion, generateAnswer } = require("../geminiApi");
const RoundManager = require("./RoundManager");
const GameStateManager = require("./GameStateManager");

/**
 * GameManager - Gestionnaire principal de la logique de jeu
 * Orchestre le déroulement complet d'une partie
 */
class GameManager {
  constructor(io) {
    this.io = io;
    this.gameStateManager = new GameStateManager(io);
    this.activeGames = new Map(); // Map<gameId, RoundManager>
  }

  /**
   * Lance une nouvelle partie
   * @param {Object} game - L'objet game du store
   */
  async startGame(game) {
    try {
      console.log(`🎮 Démarrage de la partie ${game.id}`);

      // Créer un RoundManager pour cette partie
      const roundManager = new RoundManager(this.io, this.gameStateManager, game);
      this.activeGames.set(game.id, roundManager);

      // Émettre le signal de lancement à tous les devices de la room
      const roomName = `game_${game.id}`;
      this.io.to(roomName).emit("game_launched", {
        success: true,
        message: "La partie a été lancée !",
        gameId: game.id,
        status: "in_progress",
      });

      console.log(`📢 Signal game_launched envoyé à la room ${roomName}`);

      // Démarrer le premier round
      await roundManager.startRound();
    } catch (error) {
      console.error(`❌ Erreur lors du démarrage de la partie ${game.id}:`, error);

      // Émettre une erreur à tous les devices
      const roomName = `game_${game.id}`;
      this.io.to(roomName).emit("game_error", {
        success: false,
        error: "Erreur lors du démarrage de la partie",
        message: error.message,
      });

      // Nettoyer le RoundManager en cas d'erreur
      this.activeGames.delete(game.id);
    }
  }

  /**
   * Traite la réponse humaine reçue
   * @param {number} gameId - ID de la partie
   * @param {string} humanResponse - Réponse du joueur humain
   * @param {Object} deviceInfo - Informations sur le device qui a répondu
   */
  async handleHumanResponse(gameId, humanResponse, deviceInfo) {
    console.log(this.activeGames);
    const roundManager = this.activeGames.get(gameId);

    if (!roundManager) {
      console.error(`❌ Aucun RoundManager trouvé pour la partie ${gameId}`);
      return;
    }

    await roundManager.handleHumanResponse(humanResponse, deviceInfo);
  }

  /**
   * Traite la sélection du joueur (humain ou IA)
   * @param {number} gameId - ID de la partie
   * @param {string} selection - 'human' ou 'ai'
   * @param {Object} deviceInfo - Informations sur le device qui a voté
   */
  async handlePlayerSelection(gameId, selection, deviceInfo) {
    const roundManager = this.activeGames.get(gameId);

    if (!roundManager) {
      console.error(`❌ Aucun RoundManager trouvé pour la partie ${gameId}`);
      return;
    }

    await roundManager.handlePlayerSelection(selection, deviceInfo);
  }

  /**
   * Traite la demande de round suivant
   * @param {number} gameId - ID de la partie
   * @param {Object} deviceInfo - Informations sur le device qui a demandé le round suivant
   */
  async handleNextRound(gameId, deviceInfo) {
    const roundManager = this.activeGames.get(gameId);

    if (!roundManager) {
      console.error(`❌ Aucun RoundManager trouvé pour la partie ${gameId}`);
      return;
    }

    await roundManager.handleNextRound(deviceInfo);
  }

  /**
   * Arrête une partie et nettoie les ressources
   * @param {number} gameId - ID de la partie à arrêter
   */
  stopGame(gameId) {
    const roundManager = this.activeGames.get(gameId);

    if (roundManager) {
      roundManager.cleanup();
      this.activeGames.delete(gameId);
      console.log(`🛑 Partie ${gameId} arrêtée et nettoyée`);
    }
  }

  /**
   * Obtient les informations sur une partie active
   * @param {number} gameId - ID de la partie
   * @returns {Object|null} Informations sur la partie ou null si non trouvée
   */
  getGameInfo(gameId) {
    const roundManager = this.activeGames.get(gameId);
    return roundManager ? roundManager.getGameInfo() : null;
  }

  /**
   * Nettoie toutes les parties actives
   */
  cleanup() {
    for (const [gameId, roundManager] of this.activeGames) {
      roundManager.cleanup();
    }
    this.activeGames.clear();
    console.log("🧹 Toutes les parties actives ont été nettoyées");
  }
}

module.exports = GameManager;
