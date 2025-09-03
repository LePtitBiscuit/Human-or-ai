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
      this.game.currentRound++;
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
      // const question = "Ceci est une question Ceci est une question Ceci est une question";
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
      // const aiResponse = "testicule";

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

    console.log(`🗳️ Vote reçu: "${selection}" de ${deviceInfo.name} (mode: ${this.game.gameMode})`);

    // Enregistrer le vote
    this.currentRound.votes.set(deviceInfo.socketId, {
      selection: selection,
      deviceName: deviceInfo.name,
      timestamp: Date.now(),
    });

    // Notifier uniquement le joueur qui a voté
    this.io.to(deviceInfo.socketId).emit("vote_received", {
      voterDevice: deviceInfo.name,
      selection: selection,
      gameId: this.game.id,
    });

    // Gestion différente selon le mode de jeu
    if (this.game.gameMode === "solo") {
      // En mode solo, un seul vote suffit (peut venir de n'importe quel device)
      // On conclut dès le premier vote reçu
      if (this.currentRound.votes.size >= 1) {
        await this.concludeRound();
      }
    } else if (this.game.gameMode === "multi") {
      // En mode multijoueurs, on attend que tous les joueurs connectés aient voté
      const connectedPlayers = this.game.players.filter((player) => player.socketId !== null);
      console.log(`👥 Joueurs connectés: ${connectedPlayers.length}, Votes reçus: ${this.currentRound.votes.size}`);

      if (this.currentRound.votes.size >= connectedPlayers.length) {
        await this.concludeRound();
      } else {
        // Mettre à jour le score du joueur qui a voté
        const player = this.game.players.find((p) => p.socketId === deviceInfo.socketId);
        if (player) {
          // Initialiser le score si nécessaire
          if (!player.score) {
            player.score = Array(this.game.rounds).fill(null);
          }
          // Marquer que le joueur a voté (on ne stocke pas encore le résultat, juste qu'il a voté)
          player.score[this.currentRound.number - 1] = "voted";
        }

        // Envoyer uniquement aux devices de type "presentation"
        const gameId = this.game.id;
        this.gameStateManager.emitToDevicesByType(
          this.game.devices,
          "game_advancement_update",
          {
            gameId: gameId,
            advancement: "waiting_for_player_selection",
            game: this.game,
            timestamp: new Date().toISOString(),
          },
          ["presentation"]
        );
      }
    }
  }

  /**
   * Conclut le round actuel et affiche les résultats
   */
  async concludeRound() {
    console.log(`🏁 Conclusion du round ${this.currentRound.number} (mode: ${this.game.gameMode})`);

    // Calculer le résultat du round selon le mode
    const results = this.calculateResults();

    // Mettre à jour les scores selon le mode
    if (this.game.gameMode === "solo") {
      this.updateGameScore(results.isCorrect);
    } else if (this.game.gameMode === "multi") {
      this.updatePlayersScores(results);
    }

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
      gameMode: this.game.gameMode,
    };

    // En mode multijoueurs, ajouter les résultats individuels des joueurs
    if (this.game.gameMode === "multi") {
      round_results.playerResults = results.playerResults;
    }

    this.game.roundResults = round_results;
    console.log("this.game.roundResults", this.game.roundResults);

    this.gameStateManager.updateGameAdvancement(this.roomName, "round_ended");

    // Envoyer l'événement round_ended au control center
    console.log(`📤 Envoi de l'événement round_ended au control center pour la partie ${this.game.id}`);
    console.log(`🔍 Données envoyées:`, {
      gameId: this.game.id,
      roundNumber: this.currentRound.number,
      hasRoundResults: !!round_results,
      hasScore: !!this.game.score,
    });

    this.io.to("control_center").emit("round_ended", {
      gameId: this.game.id,
      roundNumber: this.currentRound.number,
      roundResults: round_results,
      score: this.game.score,
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Événement round_ended envoyé avec succès à la room control_center`);

    // Vérifier si c'est la dernière manche
    if (this.currentRound.number === this.game.rounds) {
      console.log(
        `🏁 Dernière manche terminée pour la partie ${this.game.id} (${this.currentRound.number}/${this.game.rounds})`
      );

      // Stocker les données de fin de partie dans l'objet Game
      this.game.gameEnded = true;
      this.game.finalScore = this.game.score;
      this.game.finalRoundNumber = this.currentRound.number;
      this.game.finalRoundResults = round_results;

      // Calculer le résultat de la partie
      const correctAnswers = this.game.score.filter((score) => score === true).length;
      const totalRounds = this.currentRound.number;
      const halfRounds = Math.ceil(totalRounds / 2);
      this.game.gameResult = correctAnswers >= halfRounds ? "won" : "lost";

      console.log(`🏆 Données de fin de partie stockées dans Game ${this.game.id}:`, {
        gameEnded: this.game.gameEnded,
        finalScore: this.game.finalScore,
        finalRoundNumber: this.game.finalRoundNumber,
        gameResult: this.game.gameResult,
        correctAnswers,
        totalRounds,
        halfRounds,
      });

      // Envoyer l'événement game_ended au control center immédiatement
      this.io.to("control_center").emit("game_ended", {
        game: this.game,
        timestamp: new Date().toISOString(),
      });
      console.log(`📤 Événement game_ended envoyé au control center pour la partie ${this.game.id}`);

      // Envoyer l'événement game_ended aux devices de la partie après 5 secondes
      setTimeout(() => {
        this.gameStateManager.updateGameAdvancement(this.roomName, "game_ended");

        // Envoyer l'événement game_ended aux devices connectés à la partie
        this.io.to(this.roomName).emit("game_ended", {
          game: this.game,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Événement game_ended envoyé aux devices de la partie ${this.game.id}`);
      }, 5000);
    }

    // Envoyer le score de la partie selon le mode
    if (this.game.gameMode === "solo") {
      // En mode solo, envoyer le score global
      this.io.to(this.roomName).emit("game_score_update", {
        gameId: this.game.id,
        totalRounds: this.currentRound.number,
        score: this.game.score, // Liste de booléens [true, false, true, ...]
        currentRoundResult: results.isCorrect,
        gameMode: this.game.gameMode,
      });
    } else if (this.game.gameMode === "multi") {
      // En mode multijoueurs, envoyer uniquement les scores des joueurs
      this.io.to(this.roomName).emit("game_score_update", {
        gameId: this.game.id,
        totalRounds: this.currentRound.number,
        gameMode: this.game.gameMode,
        playerScores: this.game.players.map((player) => ({
          name: player.name,
          socketId: player.socketId,
          score: player.score,
        })),
        playerResults: results.playerResults,
      });
    }

    if (this.game.gameMode === "solo") {
      console.log(`📊 Résultat du round ${this.currentRound.number}: ${results.isCorrect ? "CORRECT" : "INCORRECT"}`);
      console.log(`🎯 Score de la partie: [${this.game.score.join(", ")}]`);
    } else if (this.game.gameMode === "multi") {
      console.log(`📊 Round ${this.currentRound.number} terminé - Scores individuels des joueurs mis à jour`);
    }

    // Marquer le round comme terminé et attendre l'événement "next_round"
    this.currentRound.status = "completed";
    console.log(`⏳ En attente de l'événement "next_round" pour continuer...`);
  }

  /**
   * Calcule le résultat du round selon le mode de jeu
   */
  calculateResults() {
    const correctAnswer = this.currentRound.isDisplayedResponseFromAI ? "ai" : "human";

    if (this.game.gameMode === "solo") {
      // En mode solo, on prend le premier (et seul) vote
      const firstVote = this.currentRound.votes.values().next().value;
      const isCorrect = firstVote.selection === correctAnswer;

      return {
        isCorrect: isCorrect,
        playerSelection: firstVote.selection,
        correctAnswer: correctAnswer,
      };
    } else if (this.game.gameMode === "multi") {
      // En mode multijoueurs, calculer les résultats pour chaque joueur
      const playerResults = [];

      for (const [socketId, vote] of this.currentRound.votes) {
        const player = this.game.players.find((p) => p.socketId === socketId);
        if (player) {
          const isCorrect = vote.selection === correctAnswer;
          playerResults.push({
            playerName: player.name,
            socketId: socketId,
            selection: vote.selection,
            isCorrect: isCorrect,
          });
        }
      }

      return {
        isCorrect: null, // Pas de résultat global en multijoueurs
        playerSelection: null, // Pas de sélection unique en multijoueurs
        correctAnswer: correctAnswer,
        playerResults: playerResults,
      };
    }
  }

  /**
   * Met à jour le score de la partie (mode solo)
   */
  updateGameScore(isCorrect) {
    // Initialiser le score si nécessaire
    if (!this.game.score) {
      this.game.score = [];
    }

    // Ajouter simplement le booléen au score
    this.game.score[this.currentRound.number - 1] = isCorrect;
  }

  /**
   * Met à jour les scores des joueurs (mode multijoueurs)
   */
  updatePlayersScores(results) {
    console.log(`📊 Mise à jour des scores des joueurs pour le round ${this.currentRound.number}`);

    // Mettre à jour le score de chaque joueur
    for (const playerResult of results.playerResults) {
      const player = this.game.players.find((p) => p.socketId === playerResult.socketId);
      if (player) {
        // Initialiser le score si nécessaire
        if (!player.score) {
          player.score = Array(this.game.rounds).fill(null);
        }

        // Mettre à jour le score pour ce round
        player.score[this.currentRound.number - 1] = playerResult.isCorrect;

        console.log(`👤 ${player.name}: ${playerResult.isCorrect ? "✅" : "❌"} (Round ${this.currentRound.number})`);
      }
    }
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

    // Vérifier si on est déjà au dernier round
    if (this.currentRound.number >= this.game.rounds) {
      console.log(`🏁 Partie terminée - Round ${this.currentRound.number} est le dernier round (${this.game.rounds})`);

      // Si on est en mode multijoueurs et que le round actuel n'est pas terminé,
      // conclure le round actuel en marquant les joueurs non-répondants comme "false"
      if (this.game.gameMode === "multi" && this.currentRound.status === "waiting_for_player_selection") {
        console.log(`⚠️ Round ${this.currentRound.number} forcé à la conclusion - marquage des joueurs non-répondants`);

        // Marquer les joueurs qui n'ont pas voté comme "false"
        const connectedPlayers = this.game.players.filter((player) => player.socketId !== null);
        const playersWhoVoted = Array.from(this.currentRound.votes.keys());

        for (const player of connectedPlayers) {
          if (!playersWhoVoted.includes(player.socketId)) {
            // Initialiser le score si nécessaire
            if (!player.score) {
              player.score = Array(this.game.rounds).fill(null);
            }
            // Marquer le joueur comme n'ayant pas répondu (false)
            player.score[this.currentRound.number - 1] = false;
            console.log(`❌ Joueur ${player.name} marqué comme non-répondant (false)`);
          }
        }

        // Conclure le round actuel
        await this.concludeRound();
      }

      // Terminer la partie en concluant le round actuel
      await this.concludeRound();
      return;
    }

    // Si on est en mode multijoueurs et que le round actuel n'est pas terminé,
    // conclure le round actuel en marquant les joueurs non-répondants comme "false"
    if (this.game.gameMode === "multi" && this.currentRound.status === "waiting_for_player_selection") {
      console.log(`⚠️ Round ${this.currentRound.number} forcé à la conclusion - marquage des joueurs non-répondants`);

      // Marquer les joueurs qui n'ont pas voté comme "false"
      const connectedPlayers = this.game.players.filter((player) => player.socketId !== null);
      const playersWhoVoted = Array.from(this.currentRound.votes.keys());

      for (const player of connectedPlayers) {
        if (!playersWhoVoted.includes(player.socketId)) {
          // Initialiser le score si nécessaire
          if (!player.score) {
            player.score = Array(this.game.rounds).fill(null);
          }
          // Marquer le joueur comme n'ayant pas répondu (false)
          player.score[this.currentRound.number - 1] = false;
          console.log(`❌ Joueur ${player.name} marqué comme non-répondant (false)`);
        }
      }

      // Conclure le round actuel
      await this.concludeRound();
    }

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
