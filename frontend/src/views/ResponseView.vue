<template>
  <!-- Affichage de fin de partie pour le mode multijoueurs -->
  <div
    v-if="gameEnded && gameMode === 'multi'"
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-4 sm:p-6 lg:p-8"
  >
    <div class="w-full max-w-4xl px-4">
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
            Classement Final
          </h2>
        </div>

        <!-- Résultats détaillés -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
            🏆 Classement Final
          </h3>

          <!-- Podium des 3 premiers joueurs -->
          <div class="space-y-3 sm:space-y-4">
            <div
              v-for="(player, index) in rankedPlayers"
              :key="player.socketId || player.name"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/10 rounded-xl p-3 sm:p-4 gap-3 sm:gap-0"
              :class="{
                'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400':
                  index === 0,
                'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-2 border-gray-300':
                  index === 1,
                'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border-2 border-orange-400':
                  index === 2,
              }"
            >
              <!-- Position et médaille -->
              <div class="flex items-center gap-3 sm:gap-4">
                <div
                  class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                  :class="{
                    'bg-yellow-400 text-yellow-900': index === 0,
                    'bg-gray-300 text-gray-700': index === 1,
                    'bg-orange-400 text-orange-900': index === 2,
                  }"
                >
                  <span v-if="index === 0" class="text-lg sm:text-2xl">🥇</span>
                  <span v-else-if="index === 1" class="text-lg sm:text-2xl">🥈</span>
                  <span v-else-if="index === 2" class="text-lg sm:text-2xl">🥉</span>
                  <span v-else class="text-sm sm:text-xl font-bold">{{ index + 1 }}</span>
                </div>

                <!-- Nom du joueur -->
                <div>
                  <div class="text-lg sm:text-xl font-bold text-white">{{ player.name }}</div>
                  <div class="text-xs sm:text-sm text-white/70">
                    {{ player.correctAnswers }}/{{ player.totalAnswers }} bonnes réponses
                  </div>
                </div>
              </div>

              <!-- Score détaillé -->
              <div class="text-left sm:text-right">
                <div class="text-xl sm:text-2xl font-bold text-white">
                  {{ player.correctAnswers }}/{{ finalRoundNumber || totalRounds }}
                </div>
                <div class="text-xs sm:text-sm text-white/70">
                  {{
                    Math.round((player.correctAnswers / (finalRoundNumber || totalRounds)) * 100)
                  }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Message de félicitations -->
          <div class="text-center mt-4 sm:mt-6">
            <div class="text-sm sm:text-base lg:text-lg text-white/80">
              <span v-if="rankedPlayers.length > 0">
                🎉 Félicitations à
                <span class="font-bold text-yellow-300">{{ rankedPlayers[0].name }}</span> pour sa
                victoire !
              </span>
              <span v-else> 🎮 Partie terminée ! </span>
            </div>
          </div>
        </div>

        <!-- Message de félicitations -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="text-base sm:text-lg lg:text-xl text-white/90">
            <p class="mb-3 sm:mb-4">
              🎮 Merci à tous les joueurs d'avoir participé à cette partie !
            </p>
            <p class="text-sm sm:text-base lg:text-lg text-white/80">
              L'IA devient de plus en plus sophistiquée, mais l'intuition humaine reste précieuse !
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Affichage normal du jeu (quand la partie n'est pas terminée ou en mode solo) -->
  <div
    v-else
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 relative"
  >
    <!-- Titre principal -->
    <h1
      class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold m-8 sm:m-12 lg:m-16 mb-4 tracking-wider"
    >
      Humain ou IA ?
    </h1>

    <!-- Barre de progression des rounds -->
    <div class="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6">
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

    <!-- Container principal -->
    <div
      class="w-full h-[75vh] sm:h-[80vh] bg-white/30 backdrop-opacity-10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 pt-2 shadow-2xl overflow-hidden"
    >
      <!-- Question -->
      <div
        v-if="
          advancement === 'waiting_for_human_response' || advancement === 'waiting_for_ai_response'
        "
        class="text-center mb-6 sm:mb-8"
      >
        <h2
          class="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 pt-4 sm:pt-6 lg:pt-8 px-2"
        >
          {{ currentQuestion || 'Question en cours de génération...' }}
        </h2>
      </div>
      <div class="rounded-2xl h-full flex flex-col">
        <!-- Contenu principal -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div class="w-full h-full p-3 sm:p-4 lg:p-6 flex flex-col">
            <!-- Message d'attente pour la génération de question -->
            <div
              v-if="advancement === 'waiting_for_question_generation'"
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
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                Génération de la question en cours...
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <!-- Message d'attente après la fin du round -->
            <div v-else-if="isRoundEnded" class="w-full text-center pt-32 sm:pt-48 lg:pt-64">
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
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente du lancement de la prochaine manche
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <!-- Message d'attente pour la sélection du joueur -->
            <div
              v-else-if="advancement === 'waiting_for_player_selection'"
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
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente de la sélection du joueur
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <!-- Message d'attente pour la réponse de l'IA -->
            <div
              v-else-if="advancement === 'waiting_for_ai_response'"
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
                  ></path>
                </svg>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                En attente de la réponse de l'IA
              </h2>
              <p class="text-white/80 text-sm sm:text-base lg:text-lg">Veuillez patienter...</p>
            </div>

            <!-- Champ de saisie de réponse (affiché seulement pour waiting_for_human_response) -->
            <div
              v-else-if="advancement === 'waiting_for_human_response'"
              class="w-full max-w-[90vw] sm:max-w-[60vw] lg:max-w-[40vw] mx-auto"
            >
              <textarea
                v-model="currentResponse"
                class="w-full bg-white/80 p-3 sm:p-4 lg:p-6 border border-gray-300 rounded-xl text-sm sm:text-base lg:text-lg resize-none shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="4"
                placeholder="Entrez votre réponse ici..."
              ></textarea>

              <!-- Bouton d'envoi -->
              <div class="flex justify-center mt-4 sm:mt-6">
                <button
                  @click="submitResponse"
                  :disabled="!currentResponse.trim() || isSubmittingResponse"
                  :class="[
                    'px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 transform flex items-center gap-2',
                    currentResponse.trim() && !isSubmittingResponse
                      ? 'bg-gradient-to-br from-blue-400 to-purple-800 hover:from-blue-500 hover:to-purple-900 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                  ]"
                >
                  <svg
                    v-if="isSubmittingResponse"
                    class="w-5 h-5 animate-spin"
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
                  {{ isSubmittingResponse ? 'Envoi en cours...' : 'Envoyer ma réponse' }}
                </button>
              </div>
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
  name: 'ResponseView',
  props: {
    advancement: {
      type: String,
      default: null,
    },
    currentQuestion: {
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
    isSubmittingResponse: {
      type: Boolean,
      default: false,
    },
    responseError: {
      type: [String, Object],
      default: null,
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
    gameMode: {
      type: String,
      default: 'solo',
    },
    players: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentResponse: '',
    }
  },
  computed: {
    // Classement des joueurs triés par score puis par ordre alphabétique
    rankedPlayers() {
      if (!this.players || this.players.length === 0) {
        return []
      }

      return this.players
        .map((player) => {
          // Calculer le score du joueur
          const score = player.score ? player.score.filter((s) => s === true).length : 0
          return {
            ...player,
            correctAnswers: score,
            totalAnswers: player.score ? player.score.length : 0,
          }
        })
        .sort((a, b) => {
          // Tri par score décroissant
          if (b.correctAnswers !== a.correctAnswers) {
            return b.correctAnswers - a.correctAnswers
          }
          // En cas d'égalité, tri par ordre alphabétique
          return a.name.localeCompare(b.name)
        })
        .slice(0, 3) // Prendre seulement les 3 premiers
    },
  },
  methods: {
    async submitResponse() {
      if (!this.currentResponse.trim() || this.isSubmittingResponse) {
        return
      }

      try {
        console.log('📤 Envoi de la réponse humaine:', this.currentResponse.trim())

        // Émettre l'événement vers le composant parent
        this.$emit('submit-response', {
          response: this.currentResponse.trim(),
        })

        // Vider le champ après envoi
        this.currentResponse = ''

        console.log('✅ Réponse envoyée avec succès')
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la réponse:", error)
        alert("Erreur lors de l'envoi de la réponse. Veuillez réessayer.")
      }
    },
  },
  watch: {
    responseError(newError) {
      if (newError) {
        alert("Erreur lors de l'envoi de la réponse. Veuillez réessayer.")
      }
    },
  },
  mounted() {
    // Modifier le titre de la page
    document.title = 'Human or AI - Response'
  },
}
</script>
