<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 relative"
  >
    <!-- Titre principal -->
    <h1
      class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold m-8 sm:m-12 lg:m-16 mb-4 tracking-wider"
    >
      Humain ou IA ?
    </h1>

    <!-- Barre de progression des rounds -->
    <div class="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6" v-if="totalRounds > 0">
      <div
        v-for="roundNumber in totalRounds"
        :key="roundNumber"
        class="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8"
      >
        <!-- Rond bleu pour rounds en cours/terminés -->
        <div
          v-if="roundNumber <= currentRound"
          class="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center"
        >
          <span class="text-white text-xs font-bold">{{ roundNumber }}</span>
        </div>
        <!-- Rond gris pour rounds futurs -->
        <div
          v-else
          class="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-300 flex items-center justify-center"
        >
          <span class="text-gray-600 text-xs font-bold">{{ roundNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Affichage de fin de partie -->
    <div v-if="gameEnded" class="w-full max-w-4xl px-4">
      <!-- Container principal -->
      <div
        class="bg-white/20 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
      >
        <!-- Titre principal -->
        <div class="text-center mb-6 sm:mb-8">
          <h1
            class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-wider"
          >
            🏆 PARTIE TERMINÉE
          </h1>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-semibold text-white/90">
            Votre score personnel
          </h2>

          <!-- Classement du joueur -->
          <div v-if="playerScore.rank > 0" class="mt-4 sm:mt-6">
            <div
              class="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-white/20 inline-block"
            >
              <div class="flex items-center gap-3 sm:gap-4">
                <!-- Position et médaille -->
                <div
                  class="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex-shrink-0"
                  :class="{
                    'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900':
                      playerScore.rank === 1,
                    'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-700':
                      playerScore.rank === 2,
                    'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900':
                      playerScore.rank === 3,
                    'bg-gradient-to-r from-blue-400 to-blue-600 text-white': playerScore.rank > 3,
                  }"
                >
                  <span v-if="playerScore.rank === 1" class="text-xl sm:text-2xl lg:text-3xl"
                    >🥇</span
                  >
                  <span v-else-if="playerScore.rank === 2" class="text-xl sm:text-2xl lg:text-3xl"
                    >🥈</span
                  >
                  <span v-else-if="playerScore.rank === 3" class="text-xl sm:text-2xl lg:text-3xl"
                    >🥉</span
                  >
                  <span v-else class="text-lg sm:text-xl lg:text-2xl font-bold">{{
                    playerScore.rank
                  }}</span>
                </div>

                <!-- Informations du classement -->
                <div class="text-left">
                  <div class="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {{ playerScore.rank }}{{ getRankSuffix(playerScore.rank) }} place
                  </div>
                  <div class="text-xs sm:text-sm text-white/70">
                    sur {{ playerScore.totalPlayers }} joueur{{
                      playerScore.totalPlayers > 1 ? 's' : ''
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats personnels -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
            Vos résultats
          </h3>

          <!-- Score global -->
          <div class="text-center mb-4 sm:mb-6">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              {{ playerScore.correctAnswers }}/{{ finalRoundNumber || totalRounds }}
            </div>
            <div class="text-sm sm:text-base lg:text-lg text-white/80">
              Bonnes réponses sur {{ finalRoundNumber || totalRounds }} manches
            </div>
          </div>

          <!-- Barre de progression des scores -->
          <div
            v-if="playerScore.scoreArray.length > 0"
            class="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6"
          >
            <div
              v-for="(score, index) in playerScore.scoreArray"
              :key="index"
              class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
            >
              <!-- Check vert pour manche gagnée -->
              <svg
                v-if="score === true"
                class="w-6 h-6 sm:w-8 sm:h-8 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <!-- Check rouge pour manche perdue -->
              <svg
                v-else-if="score === false"
                class="w-6 h-6 sm:w-8 sm:h-8 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <!-- Rond gris pour manche non jouée -->
              <div v-else class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <!-- Performance -->
          <div class="text-center">
            <div class="text-sm sm:text-base lg:text-lg text-white/80 mb-2">
              <span v-if="playerScore.percentage >= 50">
                🎯 Excellent travail ! Vous avez bien su distinguer les réponses humaines de celles
                générées par l'IA.
              </span>
              <span v-else>
                🤖 Pas de panique ! L'IA devient de plus en plus sophistiquée. Continuez à vous
                entraîner pour améliorer votre détection !
              </span>
            </div>
          </div>
        </div>

        <!-- Message de félicitations -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="text-base sm:text-lg lg:text-xl text-white/90">
            <p class="mb-3 sm:mb-4">🎮 Merci d'avoir participé à cette partie !</p>
            <p class="text-sm sm:text-base lg:text-lg text-white/80">
              Votre score final : {{ playerScore.percentage }}% de réussite
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Affichage normal du jeu (quand la partie n'est pas terminée) -->

    <!-- Container principal -->
    <div
      v-else
      class="w-full h-[75vh] sm:h-[80vh] bg-white/30 backdrop-opacity-10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 pt-2 shadow-2xl overflow-hidden"
    >
      <div class="rounded-2xl h-full flex flex-col">
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div class="w-full h-full p-3 sm:p-4 lg:p-6 flex flex-col">
            <!-- Message d'attente pour réponses humain/IA -->
            <div
              v-if="advancement === 'waiting_for_human_response'"
              class="w-full text-center pt-32 sm:pt-48 lg:pt-64"
            >
              <div class="flex items-center justify-center mb-4">
                <svg
                  class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente de la réponse de l'humain
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <div
              v-if="advancement === 'waiting_for_ai_response'"
              class="w-full text-center pt-32 sm:pt-48 lg:pt-64"
            >
              <div class="flex items-center justify-center mb-4">
                <svg
                  class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente de la réponse de l'IA
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <!-- Interface de sélection (mêmes boutons que DefaultResponseView) -->
            <div
              v-if="advancement === 'waiting_for_player_selection'"
              class="w-full text-center pt-20 sm:pt-32 lg:pt-40"
            >
              <!-- Message d'attente si le joueur a déjà voté -->
              <div v-if="hasVoted" class="mb-8 sm:mb-12">
                <div
                  class="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/20"
                >
                  <div class="flex items-center justify-center mb-4">
                    <svg
                      class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-yellow-400 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
                    En attente des choix des autres joueurs
                  </h3>
                  <p class="text-white/80 text-sm sm:text-base">
                    Votre vote a été enregistré. Veuillez patienter...
                  </p>
                </div>
              </div>

              <!-- Boutons de sélection si le joueur n'a pas encore voté -->
              <div v-else>
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">
                  Humain ou IA ?
                </h2>
                <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8">
                  <button
                    @click="emitSelection('human')"
                    class="bg-white/90 hover:bg-white flex justify-center w-full sm:w-[160px] lg:w-[180px] text-gray-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 sm:gap-3"
                  >
                    <span class="text-xl sm:text-2xl">👤</span>
                    <span>Humain</span>
                  </button>
                  <button
                    @click="emitSelection('ai')"
                    class="bg-white/90 hover:bg-white flex justify-center w-full sm:w-[160px] lg:w-[180px] text-gray-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 sm:gap-3"
                  >
                    <span class="text-xl sm:text-2xl">🤖</span>
                    <span>IA</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Message d'attente après la fin du round (identique à ResponseView) -->
            <div v-if="isRoundEnded" class="w-full text-center pt-32 sm:pt-48 lg:pt-64">
              <div class="flex items-center justify-center mb-4">
                <svg
                  class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente du lancement de la prochaine manche
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Fermeture de la div v-else -->
</template>

<script>
export default {
  name: 'SelectionView',
  props: {
    advancement: {
      type: String,
      default: null,
    },
    currentScore: {
      type: Object,
      default: () => ({}),
    },
    totalRounds: {
      type: Number,
      default: 0,
    },
    currentRound: {
      type: Number,
      default: 0,
    },
    isRoundEnded: {
      type: Boolean,
      default: false,
    },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    players: {
      type: Array,
      default: () => [],
    },
    gameMode: {
      type: String,
      default: 'solo',
    },
    deviceInfo: {
      type: Object,
      default: () => ({}),
    },
    // Props pour la fin de partie
    gameEnded: {
      type: Boolean,
      default: false,
    },
    finalScore: {
      type: Array,
      default: () => [],
    },
    finalRoundNumber: {
      type: Number,
      default: 0,
    },
    gameResult: {
      type: String,
      default: null,
    },
  },
  computed: {
    // Récupérer les données du joueur actuel
    currentPlayer() {
      console.log('🔍 currentPlayer computed - deviceInfo:', this.deviceInfo)
      console.log('🔍 currentPlayer computed - players:', this.players)
      console.log('🔍 currentPlayer computed - gameMode:', this.gameMode)

      if (!this.deviceInfo || !this.deviceInfo.name || !this.players || this.players.length === 0) {
        console.log('❌ currentPlayer: conditions not met')
        return null
      }

      const foundPlayer = this.players.find((player) => player.name === this.deviceInfo.name)
      console.log('✅ currentPlayer found:', foundPlayer)
      return foundPlayer
    },

    // Calculer le score personnel du joueur
    playerScore() {
      console.log('🔍 playerScore computed - currentPlayer:', this.currentPlayer)

      if (!this.currentPlayer || !this.currentPlayer.score) {
        console.log('❌ playerScore: no currentPlayer or score')
        return {
          correctAnswers: 0,
          totalAnswers: 0,
          percentage: 0,
          scoreArray: [],
          rank: 0,
          totalPlayers: 0,
        }
      }

      const scoreArray = this.currentPlayer.score
      console.log('🔍 playerScore - scoreArray:', scoreArray)

      const correctAnswers = scoreArray.filter((score) => score === true).length
      const totalAnswers = scoreArray.length
      const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

      // Calculer le classement
      const rank = this.calculatePlayerRank()
      const totalPlayers = this.players ? this.players.length : 0

      const result = {
        correctAnswers,
        totalAnswers,
        percentage,
        scoreArray,
        rank,
        totalPlayers,
      }

      console.log('✅ playerScore result:', result)
      return result
    },
  },
  watch: {
    players: {
      handler(newPlayers, oldPlayers) {
        console.log('👀 players watcher - new:', newPlayers)
        console.log('👀 players watcher - old:', oldPlayers)
      },
      deep: true,
      immediate: true,
    },
    deviceInfo: {
      handler(newDeviceInfo, oldDeviceInfo) {
        console.log('👀 deviceInfo watcher - new:', newDeviceInfo)
        console.log('👀 deviceInfo watcher - old:', oldDeviceInfo)
      },
      deep: true,
      immediate: true,
    },
    gameMode: {
      handler(newGameMode, oldGameMode) {
        console.log('👀 gameMode watcher - new:', newGameMode)
        console.log('👀 gameMode watcher - old:', oldGameMode)
      },
      immediate: true,
    },
  },
  methods: {
    emitSelection(choice) {
      this.$emit('player-selection', choice)
    },
    handleReplayGame() {
      this.$emit('replay-game')
    },
    handleBackToHome() {
      this.$emit('back-to-home')
    },
    // Calculer le classement du joueur actuel
    calculatePlayerRank() {
      if (!this.players || this.players.length === 0 || !this.currentPlayer) {
        return 0
      }

      // Créer un tableau des joueurs avec leurs scores
      const playersWithScores = this.players.map((player) => {
        const score = player.score ? player.score.filter((s) => s === true).length : 0
        return {
          ...player,
          correctAnswers: score,
          totalAnswers: player.score ? player.score.length : 0,
        }
      })

      // Trier par score décroissant, puis par ordre alphabétique en cas d'égalité
      playersWithScores.sort((a, b) => {
        if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers
        }
        return a.name.localeCompare(b.name)
      })

      // Trouver la position du joueur actuel
      const rank =
        playersWithScores.findIndex((player) => player.name === this.currentPlayer.name) + 1

      console.log('🏆 Player rank calculated:', {
        playerName: this.currentPlayer.name,
        rank: rank,
        totalPlayers: this.players.length,
        playersWithScores: playersWithScores.map((p) => ({
          name: p.name,
          score: p.correctAnswers,
        })),
      })

      return rank
    },
    // Obtenir le suffixe pour la position (1er, 2ème, 3ème, etc.)
    getRankSuffix(rank) {
      if (rank === 1) return 'er'
      if (rank === 2) return 'ème'
      if (rank === 3) return 'ème'
      return 'ème'
    },
  },
  mounted() {
    document.title = 'Human or AI - Selection'
  },
}
</script>
