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

  <!-- Afficher la page de fin de partie si la partie est terminée -->
  <PageFinDePartie
    v-else-if="isConnectedToGame && advancement === 'game_ended' && finalScore && gameResult"
    :final-score="finalScore"
    :final-round-number="finalRoundNumber"
    :game-result="gameResult"
    :game-mode="gameMode"
    :players="players"
    @replay-game="handleReplayGame"
    @back-to-home="handleBackToHome"
  />

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

  <!-- Afficher la vue Presentation si connecté à une partie avec un autre avancement -->
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
    <!-- <div class="absolute top-8 right-8 z-10">
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
    </div> -->

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
      <div v-if="!showRoundResults" class="text-center mb-8">
        <h2 class="text-4xl font-bold text-gray-800 pt-12">
          {{ currentQuestion || 'Question en cours de génération...' }}
        </h2>
      </div>
      <div class="rounded-2xl h-full flex flex-col">
        <!-- Contenu principal -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div class="w-full h-full p-6 flex flex-col">
            <!-- Indicateurs de statut -->

            <!-- Zone de présentation (sans zone de saisie) -->
            <div class="w-full max-w-[40vw] mx-auto h-full pt-8">
              <!-- Résultats de la manche -->
              <div
                v-if="showRoundResults && roundResults"
                class="w-full mb-8 flex flex-col items-center"
              >
                <!-- Affichage selon le mode de jeu -->
                <div class="text-center mb-8">
                  <!-- Mode solo : affichage avec résultat correct/incorrect -->
                  <div
                    v-if="gameMode === 'solo'"
                    class="flex items-center justify-center gap-4 mb-4"
                  >
                    <!-- Icône de résultat -->
                    <div v-if="roundResults.isCorrect" class="text-green-500">
                      <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div v-else class="text-red-500">
                      <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span class="text-white text-4xl font-bold">
                      {{ roundResults.isCorrect ? 'Oui !' : 'Non !' }}
                    </span>
                  </div>

                  <!-- Message explicatif -->
                  <div class="text-center">
                    <!-- Icône selon la source de la réponse -->
                    <div class="mb-4">
                      <span class="text-6xl">
                        {{ roundResults.correctAnswer === 'ai' ? '🤖' : '👤' }}
                      </span>
                    </div>
                    <p class="text-white text-2xl mb-4 font-medium">
                      Cette réponse avait été donnée par
                      {{ roundResults.correctAnswer === 'ai' ? 'une IA' : 'un humain' }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex flex-col gap-4 bg-white/20 rounded-2xl px-6 py-6 shadow-sm w-[30vw]"
                >
                  <!-- Question -->
                  <div class="text-center mb-8">
                    <h3 class="text-3xl font-bold">
                      {{ roundResults.question }}
                    </h3>
                  </div>

                  <!-- Réponses -->
                  <div class="mb-8">
                    <div class="text-center mb-6 flex items-center justify-start">
                      <span class="text-gray-700 text-xl font-semibold">Réponses :</span>
                    </div>

                    <div class="space-y-6 pl-8">
                      <!-- Réponse IA -->
                      <div
                        class="bg-white/50 rounded-xl px-6 py-4 shadow-sm flex items-center justify-center gap-4 relative"
                      >
                        <span class="text-2xl absolute left-4">🤖</span>
                        <span class="text-gray-800 text-lg font-medium">
                          {{
                            roundResults.correctAnswer === 'ai'
                              ? roundResults.displayedResponse
                              : roundResults.humanResponse || 'Réponse humaine non disponible'
                          }}
                        </span>
                      </div>

                      <!-- Réponse Humaine -->
                      <div
                        class="bg-white/50 rounded-xl px-6 py-4 shadow-sm flex items-center justify-center gap-4 relative"
                      >
                        <span class="text-2xl absolute left-4">👤</span>
                        <span class="text-gray-800 text-lg font-medium">
                          {{
                            roundResults.correctAnswer === 'human'
                              ? roundResults.displayedResponse
                              : roundResults.humanResponse || 'Réponse humaine non disponible'
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Affichage pour la sélection du joueur -->
              <div
                v-else-if="advancement === 'waiting_for_player_selection'"
                class="w-full text-center flex flex-col gap-12"
              >
                <!-- Affichage de la réponse -->
                <div class="mb-8">
                  <div class="flex flex-col items-start justify-center gap-4 mb-4">
                    <span class="text-gray-700 text-lg font-semibold">Réponse:</span>
                    <div
                      class="bg-white/80 flex items-center justify-center border border-gray-200 rounded-xl px-6 py-3 shadow-sm w-full h-[100px]"
                    >
                      <span class="text-gray-800 text-lg font-medium">
                        {{ displayedResponse || 'Réponse en cours...' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <!-- Question de sélection -->
                  <h2 class="text-4xl font-bold text-white mb-12">Humain ou IA ?</h2>

                  <!-- Boutons de sélection décoratifs -->
                  <div class="flex justify-center gap-8">
                    <!-- Bouton Humain -->
                    <div
                      class="bg-white/90 text-gray-800 px-8 py-4 flex justify-center w-[180px] rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3 cursor-default"
                    >
                      <span class="text-2xl">👤</span>
                      <span>Humain</span>
                    </div>

                    <!-- Bouton IA -->
                    <div
                      class="bg-white/90 text-gray-800 px-8 py-4 flex justify-center w-[180px] rounded-xl font-semibold text-lg shadow-lg flex items-center gap-3 cursor-default"
                    >
                      <span class="text-2xl">🤖</span>
                      <span>IA</span>
                    </div>
                  </div>

                  <!-- Message d'attente et avancement des votes en mode multijoueurs -->
                  <div v-if="gameMode === 'multi'" class="mt-12">
                    <div
                      class="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
                    >
                      <h3 class="text-2xl font-bold text-white mb-4">
                        En attente du choix des joueurs
                      </h3>

                      <!-- Barre de progression des votes -->
                      <div class="flex items-center justify-center gap-4 mb-4">
                        <span class="text-white/80 text-sm">Votes reçus:</span>
                        <span class="text-white font-semibold"
                          >{{ voteProgress.voted }}/{{ voteProgress.total }}</span
                        >
                      </div>

                      <!-- Barre de progression visuelle -->
                      <div class="w-full bg-white/20 rounded-full h-3 mb-2">
                        <div
                          class="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          :style="{ width: voteProgress.percentage + '%' }"
                        ></div>
                      </div>

                      <!-- Pourcentage -->
                      <div class="text-white/80 text-sm">
                        {{ voteProgress.percentage }}% des joueurs ont voté
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Affichage normal selon l'avancement -->
              <div
                v-else-if="advancement !== 'waiting_for_player_selection'"
                class="w-full text-center"
              >
                <!-- Affichage selon l'avancement -->
                <div v-if="advancement === 'waiting_for_question_generation'" class="text-center">
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
                  <p class="text-2xl font-semibold text-white">
                    Génération de la question en cours...
                  </p>
                </div>

                <div v-else-if="currentQuestion" class="flex text-center justify-center h-full">
                  <!-- Statut d'attente selon l'avancement -->
                  <div
                    v-if="
                      advancement === 'waiting_for_human_response' ||
                      advancement === 'waiting_for_ai_response'
                    "
                    class="text-gray-300 text-xl font-semibold"
                  >
                    {{
                      advancement === 'waiting_for_human_response'
                        ? "En attente de la réponse de l'humain"
                        : "En attente de la réponse de l'IA"
                    }}
                  </div>
                </div>

                <div v-else class="text-center">
                  <p class="text-white text-center">
                    Zone de présentation<br />
                    <span class="text-sm">Le contenu de la présentation sera affiché ici</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Overlay QR Code - Affiché au-dessus de tout -->
  <div
    v-if="showQRCode"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    @click="hideQRCode"
  >
    <div
      class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md mx-4"
      @click.stop
    >
      <h2 class="text-3xl font-bold text-gray-800 text-center mb-6">📱 Rejoignez la partie</h2>
      <div class="flex flex-col items-center">
        <div class="bg-white p-6 rounded-xl mb-6 shadow-lg">
          <div ref="qrCodeContainer" class="flex justify-center"></div>
        </div>
        <p class="text-gray-600 text-center text-lg mb-6">
          Scannez le QR code avec votre appareil mobile pour rejoindre la partie
        </p>
        <button
          @click="hideQRCode"
          class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Fermer
        </button>
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
      currentGameId: null,
      socket: null,
      deviceInfo: null,
      connectionStatus: 'disconnected', // disconnected, connecting, connected, pending
      connectionMessage: '',
      advancement: null,
      currentQuestion: null,
      currentAnswer: null,
      currentScore: [],
      displayedResponse: null,
      isResponseDisplayed: false,
      roundResults: null,
      showRoundResults: false,
      gameMode: null, // 'solo' ou 'multi'
      players: [], // Liste des joueurs pour le mode multijoueurs
      currentRound: 0, // Round actuel pour calculer l'avancement des votes
      totalRounds: 0, // Nombre total de rounds
      // Données pour la fin de partie
      gameEnded: false,
      finalScore: null,
      finalRoundNumber: null,
      gameResult: null, // 'won' ou 'lost'
      // Données pour le QR code
      showQRCode: false,
      qrCodeUrl: null,
    }
  },

  computed: {
    // Calculer l'avancement des votes en mode multijoueurs
    voteProgress() {
      if (this.gameMode !== 'multi' || !this.players.length || this.currentRound === 0) {
        return { voted: 0, total: 0, percentage: 0 }
      }

      const voted = this.players.filter((player) => {
        console.log('playerscore', player.score)
        console.log('currentRound', this.currentRound)
        console.log('player.score.length', player.score.length)
        console.log('player.score[this.currentRound - 1]', player.score[this.currentRound - 1])
        console.log(
          'player.score[this.currentRound - 1] !== null',
          player.score[this.currentRound - 1] !== null,
        )
        return (
          player.score &&
          player.score.length > this.currentRound - 1 &&
          player.score[this.currentRound - 1] !== null &&
          player.score[this.currentRound - 1] !== undefined
        )
      }).length

      console.log('players', this.players)
      const total = this.players.length
      const percentage = total > 0 ? Math.round((voted / total) * 100) : 0

      console.log('voteProgress', { voted, total, percentage })
      return { voted, total, percentage }
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
        const deviceType = 'presentation'

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
        if (data.game && typeof data.game.displayedResponse !== 'undefined') {
          this.displayedResponse = data.game.displayedResponse
        }
        if (data.game && typeof data.game.gameMode !== 'undefined') {
          this.gameMode = data.game.gameMode
        }
        if (data.game && typeof data.game.players !== 'undefined') {
          console.log('data updated players', data.game.players)
          this.players = data.game.players
        }
        if (data.game && typeof data.game.currentRound !== 'undefined') {
          this.currentRound = data.game.currentRound
        }
        if (data.game && typeof data.game.rounds !== 'undefined') {
          this.totalRounds = data.game.rounds
        }
        if (data.advancement === 'round_ended') {
          this.roundResults = data.game.roundResults
          this.currentScore = data.game.score
          console.log('🏁 Résultat du round:', this.roundResults)
          this.showRoundResults = true
        }

        if (data.advancement === 'game_ended') {
          console.log('handled game ended')
          this.handleGameEnded(data)
        }

        if (data.advancement === 'waiting_for_question_generation') {
          this.showRoundResults = false
        }

        console.log('📊 Avancement de la partie reçu:', data.advancement)
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

      // Écouter la génération de question
      deviceSocketService.on('question_generated', (data) => {
        this.currentQuestion = data.question
        console.log('❓ Question générée reçue:', data.question)
      })

      // Écouter l'attente de réponse humaine
      deviceSocketService.on('waiting_for_human_response', (data) => {
        console.log('👤 En attente de la réponse humaine')
        // L'avancement sera mis à jour via game_advancement_update
      })

      // Écouter l'attente de réponse IA
      deviceSocketService.on('waiting_for_ai_response', (data) => {
        console.log('🤖 En attente de la réponse IA')
        // L'avancement sera mis à jour via game_advancement_update
      })

      // Écouter l'affichage de la réponse
      deviceSocketService.on('response_display', (data) => {
        console.log('📺 Réponse à afficher reçue:', data)
        this.displayedResponse = data.response
        this.currentQuestion = data.question
      })

      // Écouter le toggle du QR code
      deviceSocketService.on('toggle_qr_code', (data) => {
        console.log('📱 Toggle du QR code reçu:', data)
        this.showQRCode = !this.showQRCode
        this.qrCodeUrl = data.qrCodeUrl
      })

      // // Écouter les mises à jour de score
      // deviceSocketService.on('game_score_update', (data) => {
      //   console.log('📊 Mise à jour de score reçue:', data)
      //   if (data.gameMode === 'multi' && data.playerScores) {
      //     // Mettre à jour les scores des joueurs
      //     this.players = data.playerScores
      //   } else if (data.gameMode === 'solo' && data.score) {
      //     // Mettre à jour le score global en mode solo
      //     this.currentScore = data.score
      //   }
      //   if (data.totalRounds) {
      //     this.currentRound = data.totalRounds
      //   }
      // })
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
      this.connectionStatus = 'disconnected'
      this.connectionMessage = ''
      this.deviceInfo = null
      this.advancement = null
      this.currentQuestion = null
      this.displayedResponse = null
      this.isResponseDisplayed = false

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
      this.game = null
      this.currentQuestion = null
      this.displayedResponse = null
      this.advancement = null
      this.currentScore = []
      this.roundResults = null
      this.showRoundResults = false
      this.gameMode = null
      this.players = []
      this.currentRound = 0
      this.totalRounds = 0

      // Réinitialiser les données de connexion
      this.deviceInfo = null
      this.gameId = null

      console.log('✅ Données de la partie réinitialisées')
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
    },

    // Gérer le retour à l'accueil
    handleBackToHome() {
      console.log("🏠 Retour à l'accueil")
      // Déconnecter de la partie
      this.handleDisconnect()
    },

    // Gérer l'affichage du QR code
    async generateQRCode() {
      if (!this.qrCodeUrl) return

      try {
        // Importer dynamiquement la bibliothèque QR code
        const QRCode = await import('qrcode')

        // Générer le QR code
        const canvas = document.createElement('canvas')
        await QRCode.toCanvas(canvas, this.qrCodeUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })

        // Afficher le QR code dans le container
        const container = this.$refs.qrCodeContainer
        if (container) {
          container.innerHTML = ''
          container.appendChild(canvas)
        }
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error)
      }
    },

    // Masquer le QR code
    hideQRCode() {
      this.showQRCode = false
      // Ne pas réinitialiser qrCodeUrl pour permettre le toggle
    },
  },

  watch: {
    // Générer le QR code quand l'URL change ou quand showQRCode devient true
    qrCodeUrl: {
      handler(newUrl) {
        if (newUrl && this.showQRCode) {
          this.$nextTick(() => {
            this.generateQRCode()
          })
        }
      },
      immediate: true,
    },
    // Générer le QR code quand showQRCode devient true
    showQRCode: {
      handler(newValue) {
        if (newValue && this.qrCodeUrl) {
          this.$nextTick(() => {
            this.generateQRCode()
          })
        }
      },
    },
  },

  mounted() {
    // Le formulaire de connexion s'affiche automatiquement à chaque rechargement
    // car isConnectedToGame est initialement false

    // Modifier le titre de la page
    document.title = 'Human or AI - Presentation'
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
