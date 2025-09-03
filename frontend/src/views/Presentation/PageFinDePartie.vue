<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-8"
  >
    <div class="w-full max-w-4xl">
      <!-- Container principal -->
      <div class="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <!-- Titre principal -->
        <div class="text-center mb-8">
          <h1 class="text-6xl font-bold text-white mb-4 tracking-wider">
            <span v-if="gameMode === 'solo'">
              {{ gameResult === 'won' ? '🎉 FÉLICITATIONS !' : '😔 PARTIE TERMINÉE' }}
            </span>
            <span v-else> 🏆 PARTIE TERMINÉE </span>
          </h1>
          <h2 class="text-3xl font-semibold text-white/90">
            <span v-if="gameMode === 'solo'">
              {{ gameResult === 'won' ? 'Vous avez gagné !' : 'Vous avez perdu' }}
            </span>
            <span v-else> Classement final des joueurs </span>
          </h2>
        </div>

        <!-- Résultats détaillés -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <!-- Mode Solo -->
          <div v-if="gameMode === 'solo'">
            <h3 class="text-2xl font-bold text-white text-center mb-6">Résultats de la partie</h3>

            <!-- Score global -->
            <div class="text-center mb-6">
              <div class="text-4xl font-bold text-white mb-2">
                {{ correctAnswers }}/{{ totalRounds }}
              </div>
              <div class="text-lg text-white/80">Bonnes réponses sur {{ totalRounds }} manches</div>
            </div>

            <!-- Barre de progression des scores -->
            <div
              v-if="finalScore && finalScore.length > 0"
              class="flex items-center justify-center gap-2 mb-6"
            >
              <div
                v-for="(score, index) in finalScore"
                :key="index"
                class="flex items-center justify-center w-10 h-10"
              >
                <!-- Check vert pour manche gagnée -->
                <svg
                  v-if="score === true"
                  class="w-8 h-8 text-green-400"
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
                  class="w-8 h-8 text-red-400"
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
                <div v-else class="w-8 h-8 rounded-full bg-gray-300"></div>
              </div>
            </div>

            <!-- Critère de victoire -->
            <div class="text-center">
              <div class="text-lg text-white/80 mb-2">
                <span v-if="gameResult === 'won'">
                  ✅ Vous avez réussi à identifier correctement au moins
                  <span class="font-bold text-green-300">{{ Math.ceil(totalRounds / 2) }}</span>
                  réponses sur {{ totalRounds }} !
                </span>
                <span v-else>
                  ❌ Il fallait identifier au moins
                  <span class="font-bold text-red-300">{{ Math.ceil(totalRounds / 2) }}</span>
                  bonnes réponses sur {{ totalRounds }} pour gagner.
                </span>
              </div>
            </div>
          </div>

          <!-- Mode Multijoueurs -->
          <div v-else-if="gameMode === 'multi'">
            <h3 class="text-2xl font-bold text-white text-center mb-6">🏆 Classement Final</h3>

            <!-- Podium des 3 premiers joueurs -->
            <div class="space-y-4">
              <div
                v-for="(player, index) in rankedPlayers"
                :key="player.socketId || player.name"
                class="flex items-center justify-between bg-white/10 rounded-xl p-4"
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
                <div class="flex items-center gap-4">
                  <div
                    class="flex items-center justify-center w-12 h-12 rounded-full"
                    :class="{
                      'bg-yellow-400 text-yellow-900': index === 0,
                      'bg-gray-300 text-gray-700': index === 1,
                      'bg-orange-400 text-orange-900': index === 2,
                    }"
                  >
                    <span v-if="index === 0" class="text-2xl">🥇</span>
                    <span v-else-if="index === 1" class="text-2xl">🥈</span>
                    <span v-else-if="index === 2" class="text-2xl">🥉</span>
                    <span v-else class="text-xl font-bold">{{ index + 1 }}</span>
                  </div>

                  <!-- Nom du joueur -->
                  <div>
                    <div class="text-xl font-bold text-white">{{ player.name }}</div>
                    <div class="text-sm text-white/70">
                      {{ player.correctAnswers }}/{{ player.totalAnswers }} bonnes réponses
                    </div>
                  </div>
                </div>

                <!-- Score détaillé -->
                <div class="text-right">
                  <div class="text-2xl font-bold text-white">
                    {{ player.correctAnswers }}/{{ totalRounds }}
                  </div>
                  <div class="text-sm text-white/70">
                    {{ Math.round((player.correctAnswers / totalRounds) * 100) }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Message de félicitations -->
            <div class="text-center mt-6">
              <div class="text-lg text-white/80">
                <span v-if="rankedPlayers.length > 0">
                  🎉 Félicitations à
                  <span class="font-bold text-yellow-300">{{ rankedPlayers[0].name }}</span> pour sa
                  victoire !
                </span>
                <span v-else> 🎮 Partie terminée ! </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message de félicitations ou d'encouragement -->
        <div class="text-center mb-8">
          <!-- Mode Solo -->
          <div v-if="gameMode === 'solo'">
            <div v-if="gameResult === 'won'" class="text-xl text-white/90">
              <p class="mb-4">
                🎯 Excellent travail ! Vous avez bien su distinguer les réponses humaines de celles
                générées par l'IA.
              </p>
              <p class="text-lg text-white/80">
                Votre intuition et votre analyse ont fait la différence !
              </p>
            </div>
            <div v-else class="text-xl text-white/90">
              <p class="mb-4">🤖 Pas de panique ! L'IA devient de plus en plus sophistiquée.</p>
              <p class="text-lg text-white/80">
                Continuez à vous entraîner pour améliorer votre détection !
              </p>
            </div>
          </div>

          <!-- Mode Multijoueurs -->
          <div v-else class="text-xl text-white/90">
            <p class="mb-4">🎮 Merci à tous les joueurs d'avoir participé à cette partie !</p>
            <p class="text-lg text-white/80">
              L'IA devient de plus en plus sophistiquée, mais l'intuition humaine reste précieuse !
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageFinDePartie',
  props: {
    finalScore: {
      type: Array,
      required: true,
    },
    finalRoundNumber: {
      type: Number,
      required: true,
    },
    gameResult: {
      type: String,
      required: true,
      validator: (value) => ['won', 'lost'].includes(value),
    },
    gameMode: {
      type: String,
      default: 'solo',
      validator: (value) => ['solo', 'multi'].includes(value),
    },
    players: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    correctAnswers() {
      console.log('🔍 PageFinDePartie - correctAnswers computed:', {
        finalScore: this.finalScore,
        isArray: Array.isArray(this.finalScore),
        length: this.finalScore ? this.finalScore.length : 0,
      })
      if (!this.finalScore || !Array.isArray(this.finalScore)) {
        return 0
      }
      return this.finalScore.filter((score) => score === true).length
    },
    totalRounds() {
      console.log('🔍 PageFinDePartie - totalRounds computed:', {
        finalRoundNumber: this.finalRoundNumber,
      })
      return this.finalRoundNumber || 0
    },
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
  mounted() {
    console.log('🎮 PageFinDePartie monté avec les props:', {
      finalScore: this.finalScore,
      finalRoundNumber: this.finalRoundNumber,
      gameResult: this.gameResult,
    })
  },
  methods: {
    replayGame() {
      // Émettre un événement pour rejouer
      this.$emit('replay-game')
    },
    backToHome() {
      // Émettre un événement pour retourner à l'accueil
      this.$emit('back-to-home')
    },
  },
}
</script>
