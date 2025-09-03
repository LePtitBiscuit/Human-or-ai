<template>
  <!-- Afficher le formulaire de connexion si non connecté à une partie -->
  <div
    v-if="!isConnectedToGame"
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-4 sm:p-6 lg:p-8"
  >
    <!-- Formulaire de connexion avec effet de réduction d'opacité -->
    <div
      v-if="connectionStatus === 'disconnected' || connectionStatus === 'error'"
      class="w-full max-w-md"
    >
      <div class="text-center mb-6 sm:mb-8">
        <h1 class="text-white text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider mb-4">
          Connexion à la partie {{ gameId }}
        </h1>
      </div>

      <div
        class="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
          <!-- Champ pseudo -->
          <div>
            <label
              for="pseudo"
              class="block text-gray-800 font-medium text-base sm:text-lg mb-1 text-left"
            >
              Pseudo
            </label>
            <input
              id="pseudo"
              v-model="pseudo"
              type="text"
              placeholder="Entrez votre pseudo..."
              class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/80 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              autocomplete="off"
              required
            />
            <!-- Message d'erreur pour nom déjà utilisé -->
            <p v-if="nameError" class="text-red-400 text-sm mt-1 text-left">
              {{ nameError }}
            </p>
          </div>

          <!-- Sélection du rôle -->
          <div>
            <label class="block text-gray-800 font-medium text-base sm:text-lg mb-1 text-left">
              Sur cet appareil vous voulez :
            </label>
            <div class="space-y-2 sm:space-y-3">
              <label class="flex items-start sm:items-center space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedRole"
                  value="response"
                  class="w-4 h-4 text-purple-600 bg-white border-white focus:ring-purple-500 mt-0.5 sm:mt-0 flex-shrink-0"
                />
                <span class="text-white font-medium text-sm sm:text-base"
                  >Répondre aux questions</span
                >
              </label>
              <label class="flex items-start sm:items-center space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedRole"
                  value="selection"
                  class="w-4 h-4 text-purple-600 bg-white border-white focus:ring-purple-500 mt-0.5 sm:mt-0 flex-shrink-0"
                />
                <span class="text-white font-medium text-sm sm:text-base"
                  >Sélectionner de qui vient la réponse entre l'IA ou l'Humain</span
                >
              </label>
            </div>
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            :disabled="!pseudo.trim() || !selectedRole"
            :class="[
              'w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 transform',
              pseudo.trim() && selectedRole
                ? 'bg-gradient-to-br from-blue-400 to-purple-800 hover:from-blue-500 hover:to-purple-900 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-white/30 text-white/50 border border-white/30 cursor-not-allowed',
            ]"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>

    <!-- Message d'attente avec effet de réduction d'opacité -->
    <div v-else-if="connectionStatus === 'pending'" class="w-full max-w-md text-center">
      <div
        class="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
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
        <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
          En attente de validation
        </h2>
        <p class="text-white/80 text-sm sm:text-base lg:text-lg">
          Votre demande de connexion a été envoyée et est en cours de validation par
          l'administrateur.
        </p>
      </div>
    </div>

    <!-- Message d'erreur avec effet de réduction d'opacité -->
    <div v-else-if="connectionStatus === 'error'" class="w-full max-w-md text-center">
      <div
        class="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
      >
        <div class="flex items-center justify-center mb-4">
          <svg
            class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Connexion refusée</h2>
        <p class="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
          Votre demande de connexion a été refusée par l'administrateur.
        </p>
        <button
          @click="resetConnectionStatus"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>

  <!-- Afficher la page d'attente si connecté avec avancement "waiting_for_launch" -->
  <PageAttente v-else-if="isConnectedToGame && advancement === 'waiting_for_launch'" />

  <!-- Afficher la page de fin de partie si la partie est terminée -->
  <PageFinDePartie
    v-else-if="
      isConnectedToGame &&
      advancement === 'game_ended' &&
      finalScore &&
      gameResult &&
      gameMode != 'multi'
    "
    :final-score="finalScore"
    :final-round-number="finalRoundNumber"
    :game-result="gameResult"
    @replay-game="handleReplayGame"
    @back-to-home="handleBackToHome"
  />

  <!-- Afficher la vue appropriée selon le rôle sélectionné pour les autres avancements -->
  <ResponseView
    ref="responseView"
    v-else-if="
      isConnectedToGame &&
      selectedRole === 'response' &&
      advancement &&
      advancement !== 'waiting_for_launch'
    "
    :advancement="advancement"
    :current-question="currentQuestion"
    :current-score="currentScore"
    :total-rounds="totalRounds"
    :current-round="currentRound"
    :is-round-ended="isRoundEnded"
    :is-submitting-response="isSubmittingResponse"
    :response-error="responseError"
    :game-ended="gameEnded"
    :final-score="finalScore"
    :final-round-number="finalRoundNumber"
    :game-result="gameResult"
    :game-mode="gameMode"
    :players="players"
    @submit-response="handleSubmitResponse"
  />
  <SelectionView
    v-else-if="
      isConnectedToGame &&
      selectedRole === 'selection' &&
      advancement &&
      advancement !== 'waiting_for_launch'
    "
    :advancement="advancement"
    :current-score="currentScore"
    :total-rounds="totalRounds"
    :current-round="currentRound"
    :is-round-ended="isRoundEnded"
    :has-voted="hasVoted"
    :players="players"
    :game-mode="gameMode"
    :device-info="deviceInfo"
    :game-ended="gameEnded"
    :final-score="finalScore"
    :final-round-number="finalRoundNumber"
    :game-result="gameResult"
    @player-selection="handlePlayerSelection"
    @replay-game="handleReplayGame"
    @back-to-home="handleBackToHome"
  />
</template>

<script>
import ResponseView from './ResponseView.vue'
import SelectionView from './SelectionView.vue'
import PageAttente from './Presentation/PageAttente.vue'
import PageFinDePartie from './Presentation/PageFinDePartie.vue'
import deviceSocketService from '@/services/deviceSocketService'

export default {
  name: 'RemoteDevicesView',
  components: {
    ResponseView,
    SelectionView,
    PageAttente,
    PageFinDePartie,
  },
  data() {
    return {
      pseudo: '',
      selectedRole: '',
      isConnectedToGame: false,
      socket: null,
      deviceInfo: null,
      connectionStatus: 'disconnected',
      connectionMessage: '',
      nameError: '', // Erreur spécifique pour nom déjà utilisé
      advancement: null,
      currentQuestion: null,
      currentScore: {},
      isRoundEnded: false,
      isSubmittingResponse: false,
      responseError: null,
      // Nouveaux indicateurs de round
      currentRound: 0,
      totalRounds: 0,
      // Données de fin de partie
      gameEnded: false,
      finalScore: null,
      finalRoundNumber: null,
      gameResult: null,
      // État du vote
      hasVoted: false,
      // Données des joueurs pour le mode multijoueurs
      players: [],
      gameMode: null,
    }
  },

  computed: {
    // Récupérer l'ID de la partie depuis l'URL
    gameId() {
      return this.$route.params.gameId
    },
  },
  methods: {
    async handleSubmit() {
      if (!this.pseudo.trim() || !this.selectedRole) {
        return
      }

      // Effacer l'erreur de nom précédente
      this.nameError = ''

      try {
        this.connectionStatus = 'connecting'
        this.connectionMessage = 'Connexion en cours...'

        // Établir la connexion Socket.IO
        this.socket = deviceSocketService.connect()

        // Attendre que la connexion soit établie
        await this.waitForSocketConnection()

        // Configurer les écouteurs AVANT d'envoyer la demande
        this.setupSocketListeners()

        // Déterminer le type de device selon le rôle sélectionné
        const deviceType = this.selectedRole === 'response' ? 'response_input' : 'selection'

        // Créer l'objet device
        this.deviceInfo = {
          name: this.pseudo.trim(),
          type: deviceType,
          game_id: this.gameId.trim() || null,
        }

        // Toujours utiliser connect_to_game puisque nous avons un ID de partie depuis l'URL
        this.socket.emit('connect_to_game', {
          gameId: this.gameId,
          name: this.pseudo.trim(),
          type: deviceType,
        })

        this.connectionStatus = 'pending'
        this.connectionMessage = 'Demande de connexion à la partie envoyée...'

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

      // Écouter la confirmation de connexion pour connect_to_game
      deviceSocketService.on('connection_success', (data) => {
        console.log('✅ Connexion à la game réussie:', data)
        this.connectionStatus = 'connected'
        this.connectionMessage = 'Connecté à la partie avec succès!'
        this.isConnectedToGame = true

        // La gestion des rooms est gérée côté serveur
      })

      // Écouter la confirmation d'ajout pour adddefaultdevice (maintenant inutilisé)
      // deviceSocketService.on('adddevice_success', (data) => {
      //   console.log('✅ Device ajouté avec succès:', data)
      //   this.connectionStatus = 'connected'
      //   this.connectionMessage = 'Connecté avec succès!'
      //   this.isConnectedToGame = true
      //   // La gestion des rooms est gérée côté serveur
      // })

      // Écouter les erreurs de connexion à la game
      deviceSocketService.on('connection_error', (error) => {
        console.error('❌ Erreur lors de la connexion à la game:', error)
        // Vérifier si c'est une erreur de nom déjà utilisé
        if (error.error === 'Name already taken') {
          this.nameError = 'Nom déjà utilisé'
          this.connectionStatus = 'disconnected'
          this.connectionMessage = ''
          this.isConnectedToGame = false
        } else {
          this.nameError = ''
          this.connectionStatus = 'error'
          this.connectionMessage = 'Connexion refusée: ' + (error.message || 'Erreur inconnue')
          this.isConnectedToGame = false
        }
      })

      // Écouter les erreurs d'ajout de device (maintenant inutilisé)
      // deviceSocketService.on('adddevice_error', (error) => {
      //   console.error("❌ Erreur lors de l'ajout du device:", error)
      //   this.connectionStatus = 'disconnected'
      //   this.connectionMessage = 'Erreur: ' + (error.message || 'Erreur inconnue')
      //   this.isConnectedToGame = false
      // })

      // Écouter le statut en attente pour connect_to_game
      deviceSocketService.on('connection_pending', (data) => {
        console.log("⏳ Demande de connexion à la game en attente d'autorisation:", data)
        this.connectionStatus = 'pending'
        this.connectionMessage = "En attente d'autorisation du control center..."
      })

      // Écouter le statut en attente pour adddefaultdevice (maintenant inutilisé)
      // deviceSocketService.on('adddevice_pending', (data) => {
      //   console.log("⏳ Demande d'ajout de device en attente d'autorisation:", data)
      //   this.connectionStatus = 'pending'
      //   this.connectionMessage = "En attente d'autorisation du control center..."
      // })

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
        this.connectionStatus = 'disconnected'
        this.connectionMessage = "Vous avez été supprimé de la partie par l'administrateur"
        this.isConnectedToGame = false

        // Recharger la page pour effectuer la déconnexion
        window.location.reload()
      })

      // Écouter les mises à jour d'avancement de la partie
      deviceSocketService.on('game_advancement_update', (data) => {
        this.advancement = data.advancement
        console.log(data, 'data')
        if (data.game && typeof data.game.currentQuestion !== 'undefined') {
          this.currentQuestion = data.game.currentQuestion
        }
        if (data.game && typeof data.game.score !== 'undefined') {
          this.currentScore = data.game.score
        }
        if (data.game && typeof data.game.rounds !== 'undefined') {
          this.totalRounds = data.game.rounds
        }
        if (data.game && typeof data.game.currentRound !== 'undefined') {
          this.currentRound = data.game.currentRound
        }
        if (data.game && typeof data.game.players !== 'undefined') {
          console.log('🎮 Players data received:', data.game.players)
          this.players = data.game.players
        }
        if (data.game && typeof data.game.gameMode !== 'undefined') {
          console.log('🎮 Game mode received:', data.game.gameMode)
          this.gameMode = data.game.gameMode
        }

        if (data.advancement === 'round_ended') {
          this.isRoundEnded = true
          console.log('🏁 Round terminé - En attente de la prochaine manche')
        }

        // Réinitialiser l'état du vote quand un nouveau round commence
        if (data.advancement === 'waiting_for_player_selection') {
          this.hasVoted = false
        }

        // Si l'avancement passe à game_ended, stocker les infos et afficher l'écran de fin
        if (data.advancement === 'game_ended' && data.game) {
          this.gameEnded = data.game.gameEnded || false
          this.finalScore = data.game.finalScore || []
          this.finalRoundNumber = data.game.finalRoundNumber || 0
          this.gameResult = data.game.gameResult || null
        }

        if (data.advancement === 'waiting_for_question_generation') {
          this.isRoundEnded = false
        }

        console.log('📊 Avancement de la partie reçu:', data.advancement)
      })

      // Écouter la génération de question
      deviceSocketService.on('question_generated', (data) => {
        this.currentQuestion = data.question
        this.isRoundEnded = false // Réinitialiser l'état de fin de round
        this.currentRound++
        console.log('❓ Question générée reçue:', data.question)
      })

      // // Écouter la mise à jour de score/round
      // deviceSocketService.on('game_score_update', (data) => {
      //   // data.totalRounds représente le numéro de round courant côté serveur
      //   if (typeof data.totalRounds !== 'undefined') {
      //     this.currentRound = data.totalRounds
      //   }
      //   if (Array.isArray(data.score)) {
      //     this.currentScore = data.score
      //   }
      // })

      // Écouter la confirmation de réception de la réponse
      deviceSocketService.on('response_received', (data) => {
        console.log('✅ Réponse reçue par le serveur:', data.message)
        this.isSubmittingResponse = false
        this.responseError = null
      })
      // Écouter la fin de partie explicite
      deviceSocketService.on('game_ended', (data) => {
        console.log('🎉 Partie terminée reçue:', data)
        if (data && data.game) {
          this.advancement = 'game_ended'
          this.gameEnded = data.game.gameEnded || false
          this.finalScore = data.game.finalScore || []
          this.finalRoundNumber = data.game.finalRoundNumber || 0
          this.gameResult = data.game.gameResult || null
        }
      })

      // Écouter les erreurs de réponse
      deviceSocketService.on('response_error', (error) => {
        console.error("❌ Erreur lors de l'envoi de la réponse:", error)
        this.isSubmittingResponse = false
        this.responseError = error
      })

      // Écouter la confirmation de vote
      deviceSocketService.on('vote_received', (data) => {
        console.log('🗳️ Vote confirmé:', data)
        this.hasVoted = true
      })
    },

    // Gérer l'envoi de réponse depuis ResponseView
    handleSubmitResponse(responseData) {
      if (this.socket) {
        this.isSubmittingResponse = true
        this.responseError = null
        this.socket.emit('human_response', responseData)
        console.log('📤 Réponse envoyée depuis RemoteDevicesView:', responseData)
      }
    },

    // Gérer la sélection depuis SelectionView
    handlePlayerSelection(selection) {
      if (this.socket) {
        this.hasVoted = false // Réinitialiser l'état du vote
        this.socket.emit('player_selection', { selection })
        console.log('🗳️ Sélection envoyée depuis RemoteDevicesView:', selection)
      }
    },

    // Gérer la reprise de partie depuis SelectionView
    handleReplayGame() {
      console.log('🔄 Replay game demandé depuis SelectionView')
      // Ici vous pouvez ajouter la logique pour relancer une partie
      // Pour l'instant, on recharge la page
      window.location.reload()
    },

    // Gérer le retour à l'accueil depuis SelectionView
    handleBackToHome() {
      console.log("🏠 Retour à l'accueil demandé depuis SelectionView")
      // Rediriger vers la page d'accueil
      this.$router.push('/')
    },

    // Réinitialiser le statut de connexion pour permettre une nouvelle tentative
    resetConnectionStatus() {
      this.connectionStatus = 'disconnected'
      this.connectionMessage = ''
      this.nameError = ''
      this.isConnectedToGame = false
      this.currentGameId = null
      this.deviceInfo = null
      console.log('🔄 Statut de connexion réinitialisé')
    },

    // Rejouer une partie depuis l'écran de fin
    handleReplayGame() {
      // Ici on se contente de réinitialiser les données locales liées à la fin de partie
      this.gameEnded = false
      this.finalScore = null
      this.finalRoundNumber = null
      this.gameResult = null
      this.advancement = null
      this.hasVoted = false
    },

    // Retour à l'accueil depuis l'écran de fin
    handleBackToHome() {
      // Déconnecter et revenir à l'état initial
      if (this.socket) {
        deviceSocketService.disconnect()
        this.socket = null
      }
      this.isConnectedToGame = false
      this.connectionStatus = 'disconnected'
      this.advancement = null
      this.hasVoted = false
    },
  },

  mounted() {
    // Le formulaire de connexion s'affiche automatiquement à chaque rechargement
    // car isConnectedToGame est initialement false

    // Modifier le titre de la page avec l'ID de la partie
    document.title = `Human or AI - Remote Devices - Partie ${this.gameId}`
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
