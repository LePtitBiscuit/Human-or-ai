const { generateQuestion, generateAnswer } = require("../geminiApi");

/**
 * RoundManager - Gestionnaire d'un round de jeu
 * Gère le cycle complet d'un round : question, réponses, sélection
 */
class RoundManager {
  constructor(io, gameStateManager, game) {
    this.io = io;
    this.gameStateManager = gameStateManager;
    this.game = game;
    this.roomName = `game_${game.id}`;

    // État du round actuel
    this.currentRound = {
      number: 1,
      question: null,
      humanResponse: null,
      aiResponse: null,
      displayedResponse: null, // La réponse affichée aux joueurs (humaine ou IA)
      isDisplayedResponseFromAI: null, // true si la réponse affichée vient de l'IA
      votes: new Map(), // Map<deviceId, vote> où vote = 'human' ou 'ai'
      status: "preparing",
    };
  }

  /**
   * Démarre un nouveau round
   */
  async startRound() {
    try {
      console.log(`🔄 Démarrage du round ${this.currentRound.number} pour la partie ${this.game.id}`);

      // Phase 1: Génération de la question
      await this.generateQuestionPhase();

      // Phase 2: Attente de la réponse humaine
      await this.waitForHumanResponsePhase();
    } catch (error) {
      console.error(`❌ Erreur pendant le round ${this.currentRound.number}:`, error);
      this.gameStateManager.emitGameError(this.roomName, "Erreur pendant le round", error.message);
    }
  }

  /**
   * Phase 1: Génération de la question
   */
  async generateQuestionPhase() {
    console.log(`📝 Phase de génération de question - Round ${this.currentRound.number}`);

    // Mettre à jour l'avancement "attente génération question"
    this.gameStateManager.updateGameAdvancement(this.roomName, "waiting_for_question_generation");

    try {
      // Générer la question avec Gemini
      const question = await generateQuestion();
      this.currentRound.question = question;
      this.game.currentQuestion = question;

      console.log(`✅ Question générée: "${question}"`);

      // Émettre la question aux devices avec les types demandés
      this.gameStateManager.emitToDevicesByType(
        this.game.devices,
        "question_generated",
        {
          question: question,
        },
        ["presentation", "response_input"]
      );

      console.log(`📤 Question envoyée à la room ${this.roomName}`);
    } catch (error) {
      console.error("❌ Erreur lors de la génération de la question:", error);
      throw error;
    }
  }

  /**
   * Phase 2: Attente de la réponse humaine
   */
  async waitForHumanResponsePhase() {
    console.log(`👤 Phase d'attente de la réponse humaine - Round ${this.currentRound.number}`);

    // Mettre à jour l'avancement "attente réponse humaine"
    this.gameStateManager.updateGameAdvancement(this.roomName, "waiting_for_human_response");

    // La suite se déroule quand on reçoit l'événement "human_response"
    // via handleHumanResponse()
  }

  /**
   * Traite la réponse humaine reçue
   */
  async handleHumanResponse(humanResponse, deviceInfo) {
    if (this.currentRound.status !== "preparing") {
      console.log(`⚠️ Réponse humaine reçue mais round pas dans le bon état: ${this.currentRound.status}`);
      return;
    }

    console.log(`👤 Réponse humaine reçue: "${humanResponse}" de ${deviceInfo.name}`);

    this.currentRound.humanResponse = humanResponse;
    this.game.humanresponse = humanResponse; // Stocker dans l'objet game

    // Phase 3: Génération de la réponse IA
    await this.generateAIResponsePhase();
  }

  /**
   * Phase 3: Génération de la réponse IA
   */
  async generateAIResponsePhase() {
    console.log(`🤖 Phase de génération de la réponse IA - Round ${this.currentRound.number}`);

    // Mettre à jour l'avancement "attente réponse IA"
    this.gameStateManager.updateGameAdvancement(this.roomName, "waiting_for_ai_response");

    try {
      // Générer la réponse IA avec Gemini
      const aiResponse = await generateAnswer(this.currentRound.question, this.currentRound.humanResponse);

      this.currentRound.aiResponse = aiResponse;
      this.game.ai_response = aiResponse; // Stocker dans l'objet game

      console.log(`✅ Réponse IA générée: "${aiResponse}"`);

      // Phase 4: Affichage d'une des deux réponses
      await this.displayResponsePhase();
    } catch (error) {
      console.error("❌ Erreur lors de la génération de la réponse IA:", error);
      throw error;
    }
  }

  /**
   * Phase 4: Affichage d'une des deux réponses (aléatoirement)
   */
  async displayResponsePhase() {
    console.log(`📺 Phase d'affichage de la réponse - Round ${this.currentRound.number}`);

    // Choisir aléatoirement quelle réponse afficher
    const showAIResponse = Math.random() < 0.5;
    this.currentRound.isDisplayedResponseFromAI = showAIResponse;
    this.currentRound.displayedResponse = showAIResponse
      ? this.currentRound.aiResponse
      : this.currentRound.humanResponse;

    const responseType = showAIResponse ? "IA" : "Humain";
    console.log(`🎲 Réponse ${responseType} choisie pour affichage: "${this.currentRound.displayedResponse}"`);

    this.game.displayedResponse = this.currentRound.displayedResponse;

    // Émettre la réponse aux devices avec le type "Presentation"
    this.gameStateManager.emitToDevicesByType(
      this.game.devices,
      "response_display",
      {
        response: this.currentRound.displayedResponse,
        question: this.currentRound.question,
        roundNumber: this.currentRound.number,
        type: "Presentation",
        gameId: this.game.id,
      },
      ["presentation"]
    );

    // Phase 5: Attente des votes
    await this.waitForPlayerSelectionPhase();
  }

  /**
   * Phase 5: Attente des votes des joueurs
   */
  async waitForPlayerSelectionPhase() {
    console.log(`🗳️ Phase d'attente des votes - Round ${this.currentRound.number}`);

    // Mettre à jour l'avancement "attente sélection joueur"
    this.gameStateManager.updateGameAdvancement(this.roomName, "waiting_for_player_selection");

    // Réinitialiser les votes
    this.currentRound.votes.clear();
    this.currentRound.status = "voting";

    // La suite se déroule quand on reçoit les événements "player_selection"
    // via handlePlayerSelection()
  }

  /**
   * Traite la sélection d'un joueur
   */
  async handlePlayerSelection(selection, deviceInfo) {
    if (this.currentRound.status !== "voting") {
      console.log(`⚠️ Vote reçu mais round pas dans le bon état: ${this.currentRound.status}`);
      return;
    }

    console.log(`🗳️ Vote reçu: "${selection}" de ${deviceInfo.name}`);

    // Enregistrer le vote
    this.currentRound.votes.set(deviceInfo.socketId, {
      selection: selection,
      deviceName: deviceInfo.name,
      timestamp: Date.now(),
    });

    // Notifier tous les devices qu'un vote a été reçu (jeu solo)
    this.io.to(this.roomName).emit("vote_received", {
      voterDevice: deviceInfo.name,
      selection: selection,
      gameId: this.game.id,
    });

    // En mode solo, un seul vote suffit (peut venir de n'importe quel device)
    // On conclut dès le premier vote reçu
    if (this.currentRound.votes.size >= 1) {
      await this.concludeRound();
    }
  }

  /**
   * Conclut le round actuel et affiche les résultats (solo)
   */
  async concludeRound() {
    console.log(`🏁 Conclusion du round ${this.currentRound.number}`);

    // Calculer le résultat du round
    const results = this.calculateResults();

    // Ajouter le booléen au score
    this.updateGameScore(results.isCorrect);

    const round_results = {
      roundNumber: this.currentRound.number,
      question: this.currentRound.question,
      humanResponse: this.currentRound.humanResponse,
      aiResponse: this.currentRound.aiResponse,
      displayedResponse: this.currentRound.displayedResponse,
      correctAnswer: results.correctAnswer,
      playerSelection: results.playerSelection,
      isCorrect: results.isCorrect,
      gameId: this.game.id,
    };

    this.game.roundResults = round_results;

    this.gameStateManager.updateGameAdvancement(this.roomName, "round_ended");

    // Envoyer le score de la partie (liste de booléens)
    this.io.to(this.roomName).emit("game_score_update", {
      gameId: this.game.id,
      totalRounds: this.currentRound.number,
      score: this.game.score, // Liste de booléens [true, false, true, ...]
      currentRoundResult: results.isCorrect,
    });

    console.log(`📊 Résultat du round ${this.currentRound.number}: ${results.isCorrect ? "CORRECT" : "INCORRECT"}`);
    console.log(`🎯 Score de la partie: [${this.game.score.join(", ")}]`);

    // Marquer le round comme terminé et attendre l'événement "next_round"
    this.currentRound.status = "completed";
    console.log(`⏳ En attente de l'événement "next_round" pour continuer...`);
  }

  /**
   * Calcule le résultat du round (solo)
   */
  calculateResults() {
    const correctAnswer = this.currentRound.isDisplayedResponseFromAI ? "ai" : "human";

    // En mode solo, on prend le premier (et seul) vote
    const firstVote = this.currentRound.votes.values().next().value;
    const isCorrect = firstVote.selection === correctAnswer;

    return {
      isCorrect: isCorrect,
      playerSelection: firstVote.selection,
      correctAnswer: correctAnswer,
    };
  }

  /**
   * Met à jour le score de la partie
   */
  updateGameScore(isCorrect) {
    // Initialiser le score si nécessaire
    if (!this.game.score) {
      this.game.score = [];
    }

    // Ajouter simplement le booléen au score
    this.game.score.push(isCorrect);
  }

  /**
   * Traite la demande de round suivant
   * @param {Object} deviceInfo - Informations sur le device qui a demandé le round suivant
   */
  async handleNextRound(deviceInfo) {
    if (this.currentRound.status !== "completed") {
      console.log(`⚠️ Demande de round suivant reçue mais round pas terminé. Statut: ${this.currentRound.status}`);
      return;
    }

    console.log(`▶️ Demande de round suivant reçue de ${deviceInfo.name}`);
    await this.prepareNextRound();
  }

  /**
   * Prépare le round suivant (appelé par l'événement "next_round")
   */
  async prepareNextRound() {
    console.log(`🚀 Préparation du round ${this.currentRound.number + 1}`);

    // Réinitialiser pour le nouveau round
    this.currentRound.number++;
    this.currentRound.status = "preparing";
    this.currentRound.question = null;
    this.currentRound.humanResponse = null;
    this.currentRound.aiResponse = null;
    this.currentRound.displayedResponse = null;
    this.currentRound.isDisplayedResponseFromAI = null;
    this.currentRound.votes.clear();

    // Démarrer immédiatement le nouveau round
    await this.startRound();
  }

  /**
   * Obtient les informations sur la partie solo
   */
  getGameInfo() {
    return {
      gameId: this.game.id,
      currentRound: this.currentRound.number,
      status: this.currentRound.status,
      question: this.currentRound.question,
      hasVoted: this.currentRound.votes.size > 0,
      totalDevices: this.game.devices.length,
      score: this.game.score, // Liste de booléens
    };
  }

  /**
   * Nettoie les ressources du round manager
   */
  cleanup() {
    this.currentRound.votes.clear();
    console.log(`🧹 RoundManager de la partie ${this.game.id} nettoyé`);
  }
}

module.exports = RoundManager;
