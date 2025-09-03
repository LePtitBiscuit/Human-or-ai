<template>
  <!-- Afficher le formulaire de connexion si non connecté à une partie -->
  <div
    v-if="!isConnectedToGame"
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-8"
  >
    <!-- Formulaire de connexion avec effet de réduction d'opacité -->
    <div
      v-if="connectionStatus === 'disconnected' || connectionStatus === 'error'"
      :class="[
        'w-full max-w-md transition-opacity duration-300',
        connectionStatus === 'error' ? 'opacity-100' : 'opacity-100',
      ]"
    >
      <ConnectionForm @connect="handleConnect" />
    </div>

    <!-- Message d'attente avec effet de réduction d'opacité -->
    <div
      v-else-if="connectionStatus === 'pending'"
      :class="[
        'w-full max-w-md text-center transition-opacity duration-300',
        connectionStatus === 'pending' ? 'opacity-100' : 'opacity-0',
      ]"
    >
      <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
        <div class="flex items-center justify-center mb-4">
          <svg
            class="w-12 h-12 text-yellow-400 animate-spin"
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
        <h2 class="text-2xl font-bold text-white mb-2">En attente de validation</h2>
        <p class="text-white/80">
          Votre demande de connexion a été envoyée et est en cours de validation par
          l'administrateur.
        </p>
      </div>
    </div>

    <!-- Message d'erreur avec effet de réduction d'opacité -->
    <div
      v-else-if="connectionStatus === 'refused'"
      :class="[
        'w-full max-w-md text-center transition-opacity duration-300',
        connectionStatus === 'refused' ? 'opacity-100' : 'opacity-0',
      ]"
    >
      <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Connexion refusée</h2>
        <p class="text-white/80 mb-6">
          Votre demande de connexion a été refusée par l'administrateur.
        </p>
        <button
          @click="resetConnectionStatus"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>

  <!-- Afficher la page de garde si connecté mais pas d'avancement -->
  <PageDeGarde v-else-if="isConnectedToGame && !advancement" />

  <!-- Afficher la page d'attente si connecté avec avancement "waiting_for_launch" -->
  <PageAttente v-else-if="isConnectedToGame && advancement === 'waiting_for_launch'" />

  <!-- Afficher la page de fin de partie si la partie est terminée (mode solo uniquement) -->
  <PageFinDePartie
    v-else-if="
      isConnectedToGame &&
      advancement === 'game_ended' &&
      finalScore &&
      gameResult &&
      gameMode !== 'multi'
    "
    :final-score="finalScore"
    :final-round-number="finalRoundNumber"
    :game-result="gameResult"
    @replay-game="handleReplayGame"
    @back-to-home="handleBackToHome"
  />

  <!-- Affichage de fin de partie pour le mode multijoueurs -->
  <div
    v-else-if="isConnectedToGame && advancement === 'game_ended' && gameMode === 'multi'"
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-8"
  >
    <div class="w-full max-w-4xl">
      <!-- Container principal -->
      <div class="bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <!-- Titre principal -->
        <div class="text-center mb-8">
          <h1 class="text-6xl font-bold text-white mb-4 tracking-wider">🏆 PARTIE TERMINÉE</h1>
          <h2 class="text-3xl font-semibold text-white/90">Classement Final</h2>
        </div>

        <!-- Résultats détaillés -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
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
                  {{ player.correctAnswers }}/{{ finalRoundNumber || totalRounds }}
                </div>
                <div class="text-sm text-white/70">
                  {{
                    Math.round((player.correctAnswers / (finalRoundNumber || totalRounds)) * 100)
                  }}%
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

        <!-- Message de félicitations -->
        <div class="text-center mb-8">
          <div class="text-xl text-white/90">
            <p class="mb-4">🎮 Merci à tous les joueurs d'avoir participé à cette partie !</p>
            <p class="text-lg text-white/80">
              L'IA devient de plus en plus sophistiquée, mais l'intuition humaine reste précieuse !
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Debug: Afficher les conditions d'affichage
  <div
    v-if="isConnectedToGame && advancement === 'game_ended'"
    class="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg z-50"
  >
    <h3 class="font-bold mb-2">Debug - Conditions d'affichage PageFinDePartie:</h3>
    <p>isConnectedToGame: {{ isConnectedToGame }}</p>
    <p>advancement: {{ advancement }}</p>
    <p>finalScore: {{ finalScore }}</p>
    <p>gameResult: {{ gameResult }}</p>
    <p>finalRoundNumber: {{ finalRoundNumber }}</p>
    <p>gameEnded: {{ gameEnded }}</p>
    <p>
      Condition complète:
      {{ isConnectedToGame && advancement === 'game_ended' && finalScore && gameResult }}
    </p>
  </div> -->

  <!-- Afficher la vue Presentation si connecté à une partie avec avancement -->
  <div
    v-else-if="
      isConnectedToGame &&
      advancement &&
      advancement !== 'waiting_for_launch' &&
      advancement !== 'game_ended'
    "
    class="h-full bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center px-8 pb-8 relative"
  >
    <!-- Bouton de déconnexion -->
    <div class="absolute top-8 right-8 z-10">
      <button
        @click="handleDisconnect"
        class="bg-white/30 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          ></path>
        </svg>
        <span class="">Quitter la partie</span>
      </button>
    </div>

    <!-- Titre principal -->
    <h1 class="text-white text-5xl font-bold m-16 mb-4 tracking-wider">Humain ou IA ?</h1>

    <!-- Barre de progression des rounds -->
    <div class="flex items-center gap-2 mb-6" v-if="totalRounds > 0">
      <div
        v-for="roundNumber in totalRounds"
        :key="roundNumber"
        class="flex items-center justify-center w-8 h-8"
      >
        <!-- Rond bleu pour rounds en cours/terminés -->
        <div
          v-if="roundNumber <= currentRound"
          class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
        >
          <span class="text-white text-xs font-bold">{{ roundNumber }}</span>
        </div>
        <!-- Rond gris pour rounds futurs -->
        <div v-else class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
          <span class="text-gray-600 text-xs font-bold">{{ roundNumber }}</span>
        </div>
      </div>
    </div>

    <!-- Container principal -->
    <div
      class="w-full h-[80vh] bg-white/30 backdrop-opacity-10 backdrop-blur-sm rounded-3xl p-8 pt-2 shadow-2xl overflow-hidden"
    >
      <!-- Question -->
      <div
        v-if="
          advancement === 'waiting_for_human_response' || advancement === 'waiting_for_ai_response'
        "
        class="text-center mb-8"
      >
        <h2 class="text-4xl font-bold text-gray-800 pt-12">
          {{ currentQuestion || 'Question en cours de génération...' }}
        </h2>
      </div>
      <div class="rounded-2xl h-full flex flex-col">
        <!-- Contenu principal -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div class="w-full h-full p-6 flex flex-col">
            <!-- Indicateurs de statut -->

            <!-- Message d'attente pour la génération de question -->
            <div
              v-if="advancement === 'waiting_for_question_generation'"
              class="w-full text-center pt-64"
            >
              <div class="flex items-center justify-center mb-4">
                <svg
                  class="w-12 h-12 text-white animate-spin"
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
              <h2 class="text-4xl font-bold text-white mb-4">
                Génération de la question en cours...
              </h2>
              <p class="text-white/80 text-lg">Veuillez patienter...</p>
            </div>

            <!-- Message d'attente après la fin du round -->
            <div v-else-if="isRoundEnded" class="w-full text-center pt-64">
              <div class="flex items-center justify-center mb-4">
                <svg
                  class="w-12 h-12 text-white animate-spin"
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
              <h2 class="text-4xl font-bold text-white mb-4">
                {{
                  currentRound === totalRounds
                    ? 'En attente des résultats de la partie'
                    : 'En attente du lancement de la prochaine manche'
                }}
              </h2>
              <p class="text-white/80 text-lg">Veuillez patienter...</p>
            </div>

            <!-- Interface de sélection du joueur -->
            <div
              v-else-if="advancement === 'waiting_for_player_selection'"
              class="w-full text-center pt-64"
            >
              <!-- Mode multijoueurs : affichage d'attente -->
              <div v-if="gameMode === 'multi'">
                <div class="flex items-center justify-center mb-4">
                  <svg
                    class="w-12 h-12 text-white animate-spin"
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
                <h2 class="text-4xl font-bold text-white mb-4">En attente des choix des joueurs</h2>
                <p class="text-white/80 text-lg">Veuillez patienter...</p>
              </div>

              <!-- Mode solo : interface de sélection -->
              <div v-else>
                <!-- Question de sélection -->
                <h2 class="text-4xl font-bold text-white mb-12">Humain ou IA ?</h2>

                <!-- Boutons de sélection -->
                <div class="flex justify-center gap-8">
                  <!-- Bouton Humain -->
                  <button
                    @click="selectPlayerChoice('human')"
                    class="bg-white/90 hover:bg-white flex justify-center w-[180px] text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <span class="text-2xl">👤</span>
                    <span>Humain</span>
                  </button>

                  <!-- Bouton IA -->
                  <button
                    @click="selectPlayerChoice('ai')"
                    class="bg-white/90 hover:bg-white flex justify-center w-[180px] text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <span class="text-2xl">🤖</span>
                    <span>IA</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Champ de saisie de réponse (affiché quand pas en attente de sélection et pas de round terminé) -->
            <div
              v-else-if="advancement !== 'waiting_for_player_selection' && !isRoundEnded"
              class="w-full max-w-[40vw] mx-auto"
            >
              <textarea
                v-model="currentResponse"
                class="w-full bg-white/80 p-6 border border-gray-300 rounded-xl text-lg resize-none shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows="6"
                placeholder="Entrez votre réponse ici..."
              ></textarea>

              <!-- Bouton d'envoi -->
              <div class="flex justify-center mt-6">
                <button
                  @click="submitResponse"
                  :disabled="
                    !currentResponse.trim() ||
                    connectionStatus !== 'connected' ||
                    isSubmittingResponse
                  "
                  :class="[
                    'px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform flex items-center gap-2',
                    currentResponse.trim() &&
                    connectionStatus === 'connected' &&
                    !isSubmittingResponse
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
                  {{
                    isSubmittingResponse
                      ? 'Envoi en cours...'
                      : connectionStatus === 'connected'
                        ? 'Envoyer ma réponse'
                        : 'En attente de connexion...'
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ConnectionForm from '@/components/ConnectionForm.vue'
import deviceSocketService from '@/services/deviceSocketService'
import PageDeGarde from '@/views/Presentation/PageDeGarde.vue'
import PageAttente from '@/views/Presentation/PageAttente.vue'
import PageFinDePartie from '@/views/Presentation/PageFinDePartie.vue'

export default {
  name: 'PresentationView',
  components: {
    ConnectionForm,
    PageDeGarde,
    PageAttente,
    PageFinDePartie,
  },
  data() {
    return {
      isConnectedToGame: false,
      currentResponse: '',
      currentGameId: null,
      socket: null,
      deviceInfo: null,
      connectionStatus: 'disconnected', // disconnected, connecting, connected, pending
      connectionMessage: '',
      advancement: null,
      currentQuestion: null,
      currentScore: {},
      isSubmittingResponse: false,
      isWaitingForSelection: false,
      // Nouveaux indicateurs de round
      currentRound: 0,
      totalRounds: 0,
      isRoundEnded: false,
      // Données pour la fin de partie
      gameEnded: false,
      finalScore: null,
      finalRoundNumber: null,
      gameResult: null, // 'won' ou 'lost'
      // État du vote
      hasVoted: false,
      // Mode de jeu
      gameMode: null, // 'solo' ou 'multi'
      // Données des joueurs pour le mode multijoueurs
      players: [],
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
    // Méthodes de connexion
    async handleConnect(connectionData) {
      try {
        const { deviceName, gameId } = connectionData

        this.connectionStatus = 'connecting'
        this.connectionMessage = 'Connexion en cours...'

        // Établir la connexion Socket.IO
        this.socket = deviceSocketService.connect()

        // Attendre que la connexion soit établie
        await this.waitForSocketConnection()

        // Configurer les écouteurs AVANT d'envoyer la demande
        this.setupSocketListeners()

        // Utiliser le nom fourni par l'utilisateur
        const deviceType = 'response_input'

        // Créer l'objet device
        this.deviceInfo = {
          name: deviceName,
          type: deviceType,
          game_id: gameId || null,
        }

        // Envoyer l'événement adddefaultdevice APRÈS avoir configuré les écouteurs
        this.socket.emit('adddefaultdevice', this.deviceInfo)

        this.currentGameId = gameId
        this.connectionStatus = 'pending'
        this.connectionMessage = "Demande d'autorisation envoyée au control center..."

        console.log('Demande de connexion envoyée:', this.deviceInfo)
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        this.connectionStatus = 'disconnected'
        this.connectionMessage = 'Erreur de connexion: ' + error.message
      }
    },

    // Attendre que la connexion Socket.IO soit établie
    waitForSocketConnection() {
      return new Promise((resolve, reject) => {
        const maxAttempts = 10
        let attempts = 0

        const checkConnection = () => {
          attempts++

          if (deviceSocketService.isConnected()) {
            resolve()
          } else if (attempts >= maxAttempts) {
            reject(new Error('Timeout de connexion Socket.IO'))
          } else {
            setTimeout(checkConnection, 500)
          }
        }

        checkConnection()
      })
    },

    // Configurer les écouteurs Socket.IO
    setupSocketListeners() {
      if (!this.socket) return

      // Écouter la confirmation d'ajout
      deviceSocketService.on('adddevice_success', (data) => {
        console.log('✅ Device ajouté avec succès:', data)
        this.connectionStatus = 'connected'
        this.connectionMessage = 'Connecté avec succès!'
        this.isConnectedToGame = true
        if (data.game) {
          this.currentScore = data.game.score
          this.totalRounds = data.game.rounds
        }

        // La gestion des rooms est gérée côté serveur
      })

      // Écouter les erreurs
      deviceSocketService.on('adddevice_error', (error) => {
        console.error("❌ Erreur lors de l'ajout du device:", error)
        if (
          (typeof error === 'string' && error.toLowerCase().includes('refusée')) ||
          (error && error.message && error.message.toLowerCase().includes('refusée'))
        ) {
          this.connectionStatus = 'refused'
        } else {
          this.connectionStatus = 'error'
        }
        this.connectionMessage =
          'Connexion refusée: ' + (error.message || error || 'Erreur inconnue')
        this.isConnectedToGame = false
      })

      // Écouter le statut en attente
      deviceSocketService.on('adddevice_pending', (data) => {
        console.log("⏳ Demande en attente d'autorisation:", data)
        this.connectionStatus = 'pending'
        this.connectionMessage = "En attente d'autorisation du control center..."
      })

      // Écouter la déconnexion
      deviceSocketService.on('disconnect', () => {
        console.log('🔌 Déconnecté du serveur')
        this.connectionStatus = 'disconnected'
        this.connectionMessage = 'Déconnecté du serveur'
        this.isConnectedToGame = false
      })

      // Écouter la suppression par l'administrateur
      deviceSocketService.on('device_removed_by_admin', (data) => {
        console.log("🚫 Appareil supprimé par l'administrateur:", data)

        // Réinitialiser toutes les données de la partie
        this.resetGameData()

        // Mettre à jour le statut de connexion
        // this.connectionStatus = 'disconnected'
        this.connectionMessage = "Vous avez été supprimé de la partie par l'administrateur"
      })

      // Écouter les mises à jour d'avancement de la partie
      deviceSocketService.on('game_advancement_update', (data) => {
        this.advancement = data.advancement
        if (data.game && typeof data.game.currentQuestion !== 'undefined') {
          this.currentQuestion = data.game.currentQuestion
        }
        if (data.game && typeof data.game.gameMode !== 'undefined') {
          this.gameMode = data.game.gameMode
        }
        if (data.game && typeof data.game.currentRound !== 'undefined') {
          this.currentRound = data.game.currentRound
        }
        if (data.game && typeof data.game.rounds !== 'undefined') {
          this.totalRounds = data.game.rounds
        }
        if (data.game && typeof data.game.players !== 'undefined') {
          this.players = data.game.players
        }

        if (data.advancement === 'waiting_for_player_selection') {
          this.isWaitingForSelection = true
        }

        if (data.advancement === 'round_ended') {
          this.isRoundEnded = true
          this.currentScore = data.game.score

          console.log('🏁 Round terminé - En attente de la prochaine manche')
        }

        if (data.advancement === 'game_ended') {
          console.log('handled game ended')
          this.handleGameEnded(data)
        }
        console.log('📊 Avancement de la partie reçu:', data.advancement)
      })

      // Écouter la génération de question
      deviceSocketService.on('question_generated', (data) => {
        this.currentQuestion = data.question
        this.isRoundEnded = false // Réinitialiser l'état de fin de round
        console.log('❓ Question générée reçue:', data.question)
      })

      // Écouter la confirmation de réception de la réponse
      deviceSocketService.on('response_received', (data) => {
        console.log('✅ Réponse reçue par le serveur:', data.message)
        this.isSubmittingResponse = false
        // Optionnel : Afficher une notification de succès
        // this.showNotification('Réponse envoyée avec succès!')
      })

      // Écouter les erreurs de réponse
      deviceSocketService.on('response_error', (error) => {
        console.error("❌ Erreur lors de l'envoi de la réponse:", error)
        this.isSubmittingResponse = false
        // Optionnel : Afficher une notification d'erreur
        // this.showNotification('Erreur lors de l\'envoi de la réponse: ' + error.message)
      })

      // Écouter l'attente de sélection du joueur
      deviceSocketService.on('waiting_for_player_selection', (data) => {
        console.log('🗳️ En attente de la sélection du joueur')
        this.isWaitingForSelection = true
      })

      // Écouter la fin de partie
      deviceSocketService.on('game_ended', (data) => {
        console.log('🎉 Partie terminée reçue:', data)
        console.log('🔍 Données reçues détaillées:', {
          game: data.game,
          hasGame: !!data.game,
          gameId: data.game ? data.game.id : null,
          gameEnded: data.game ? data.game.gameEnded : null,
          finalScore: data.game ? data.game.finalScore : null,
          finalRoundNumber: data.game ? data.game.finalRoundNumber : null,
          gameResult: data.game ? data.game.gameResult : null,
          timestamp: data.timestamp,
        })
        this.handleGameEnded(data)
      })
    },

    handleDisconnect() {
      // Déconnecter la socket si elle existe
      if (this.socket) {
        deviceSocketService.disconnect()
        this.socket = null
      }

      // Réinitialiser l'état
      this.isConnectedToGame = false
      this.currentGameId = null
      this.currentResponse = ''
      this.connectionStatus = 'disconnected'
      this.connectionMessage = ''
      this.deviceInfo = null
      this.isSubmittingResponse = false
      this.isWaitingForSelection = false

      console.log('Déconnexion de la partie')
    },

    // Réinitialiser le statut de connexion pour permettre une nouvelle tentative
    resetConnectionStatus() {
      this.connectionStatus = 'disconnected'
      this.connectionMessage = ''
      this.isConnectedToGame = false
      this.currentGameId = null
      this.deviceInfo = null
      console.log('🔄 Statut de connexion réinitialisé')
    },

    // Réinitialiser toutes les données de la partie
    resetGameData() {
      console.log('🔄 Réinitialisation des données de la partie')

      // Réinitialiser les données de la partie
      this.currentQuestion = null
      this.currentResponse = ''
      this.advancement = null
      this.currentScore = []
      this.isSubmittingResponse = false
      this.isWaitingForSelection = false
      this.isRoundEnded = false

      // Réinitialiser les données de connexion
      this.deviceInfo = null
      this.currentGameId = null

      console.log('✅ Données de la partie réinitialisées')
    },

    // Afficher la page de garde
    showPageDeGarde() {
      console.log('🛡️ Affichage de la page de garde')

      console.log('✅ Page de garde affichée')
    },

    // Gérer la fin de partie
    handleGameEnded(data) {
      console.log('🎉 Traitement de la fin de partie:', data)
      console.log('🔍 État avant traitement:', {
        advancement: this.advancement,
        gameEnded: this.gameEnded,
        finalScore: this.finalScore,
        finalRoundNumber: this.finalRoundNumber,
        gameResult: this.gameResult,
      })

      // Vérifier que l'objet game est présent
      if (!data.game) {
        console.error('❌ Aucun objet game reçu dans les données de fin de partie')
        return
      }

      // Sauvegarder les données finales depuis l'objet game
      this.finalScore = data.game.finalScore || []
      this.finalRoundNumber = data.game.finalRoundNumber || 0
      this.gameResult = data.game.gameResult || null
      this.gameEnded = data.game.gameEnded || false

      console.log("💾 Données sauvegardées depuis l'objet game:", {
        finalScore: this.finalScore,
        finalRoundNumber: this.finalRoundNumber,
        gameResult: this.gameResult,
        gameEnded: this.gameEnded,
      })

      // Marquer la partie comme terminée
      this.advancement = 'game_ended'

      console.log('🏁 État après traitement:', {
        advancement: this.advancement,
        gameEnded: this.gameEnded,
        finalScore: this.finalScore,
        finalRoundNumber: this.finalRoundNumber,
        gameResult: this.gameResult,
      })

      console.log(
        `🏆 Partie terminée: ${this.finalScore.filter((score) => score === true).length}/${this.finalRoundNumber} - ${this.gameResult === 'won' ? 'GAGNÉE' : 'PERDUE'}`,
      )
    },

    // Gérer le rejeu de la partie
    handleReplayGame() {
      console.log('🔄 Demande de rejeu de la partie')
      // Réinitialiser les données de fin de partie
      this.gameEnded = false
      this.finalScore = null
      this.finalRoundNumber = null
      this.gameResult = null
      this.advancement = null

      // Retourner à la page de garde
      this.showPageDeGarde()
    },

    // Gérer le retour à l'accueil
    handleBackToHome() {
      console.log("🏠 Retour à l'accueil")
      // Déconnecter de la partie
      this.handleDisconnect()
    },

    async submitResponse() {
      if (!this.currentResponse.trim() || this.isSubmittingResponse) {
        return
      }

      // Vérifier que l'utilisateur est connecté
      if (this.connectionStatus !== 'connected') {
        alert('Vous devez être connecté pour envoyer une réponse')
        return
      }

      try {
        this.isSubmittingResponse = true
        console.log('📤 Envoi de la réponse humaine:', this.currentResponse.trim())

        // Envoyer la réponse via Socket.IO
        this.socket.emit('human_response', {
          response: this.currentResponse.trim(),
        })

        // Vider le champ après envoi
        this.currentResponse = ''

        console.log('✅ Réponse envoyée avec succès')
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la réponse:", error)
        alert("Erreur lors de l'envoi de la réponse. Veuillez réessayer.")
      } finally {
        this.isSubmittingResponse = false
      }
    },

    async selectPlayerChoice(choice) {
      if (!this.isWaitingForSelection) {
        return
      }

      try {
        console.log('🗳️ Sélection du joueur:', choice)

        // Envoyer la sélection via Socket.IO
        this.socket.emit('player_selection', {
          selection: choice,
        })

        // Désactiver l'interface de sélection
        this.isWaitingForSelection = false

        console.log('✅ Sélection envoyée avec succès')
      } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la sélection:", error)
        alert("Erreur lors de l'envoi de la sélection. Veuillez réessayer.")
      }
    },
  },

  mounted() {
    // Le formulaire de connexion s'affiche automatiquement à chaque rechargement
    // car isConnectedToGame est initialement false

    // Modifier le titre de la page
    document.title = 'Human or AI - Default Response'
  },

  beforeUnmount() {
    // Nettoyer la connexion Socket.IO avant la destruction du composant
    if (this.socket) {
      deviceSocketService.disconnect()
      this.socket = null
    }
  },
}
</script>
