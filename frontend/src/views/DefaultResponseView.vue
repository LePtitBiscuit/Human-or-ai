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

  <!-- Afficher la vue Presentation si connecté à une partie avec avancement -->
  <div
    v-else-if="isConnectedToGame && advancement"
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

    <!-- Barre de progression des scores -->
    <div class="flex items-center gap-2 mb-6">
      <div
        v-for="(score, roundKey) in currentScore"
        :key="roundKey"
        class="flex items-center justify-center w-8 h-8"
      >
        <!-- Check vert pour manche gagnée -->
        <svg
          v-if="score === true"
          class="w-6 h-6 text-green-600"
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
          class="w-6 h-6 text-red-600"
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
        <div v-else class="w-6 h-6 rounded-full bg-gray-300"></div>
      </div>
    </div>

    <!-- Container principal -->
    <div
      class="w-full h-[80vh] bg-white/50 backdrop-opacity-10 backdrop-blur-sm rounded-3xl p-8 pt-2 shadow-2xl overflow-hidden"
    >
      <!-- Question -->
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold text-gray-800 pt-8">
          {{ currentQuestion || 'Question en cours de génération...' }}
        </h2>
      </div>
      <div class="rounded-2xl h-full flex flex-col">
        <!-- Contenu principal -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div class="w-full h-full p-6 flex flex-col">
            <!-- Indicateurs de statut -->

            <!-- Interface de sélection du joueur -->
            <div v-if="isWaitingForSelection" class="w-full max-w-[40vw] mx-auto">
              <!-- Question de sélection -->
              <div class="text-center mb-8">
                <h3 class="text-3xl font-bold text-gray-800 mb-8">Humain ou IA ?</h3>

                <!-- Boutons de sélection -->
                <div class="flex justify-center gap-8">
                  <!-- Bouton Humain -->
                  <button
                    @click="selectPlayerChoice('human')"
                    class="bg-gradient-to-br from-blue-400 to-purple-800 hover:from-blue-500 hover:to-purple-900 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span>Humain</span>
                  </button>

                  <!-- Bouton IA -->
                  <button
                    @click="selectPlayerChoice('ai')"
                    class="bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span>IA</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Champ de saisie de réponse (affiché quand pas en attente de sélection) -->
            <div v-else class="w-full max-w-[40vw] mx-auto">
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

export default {
  name: 'PresentationView',
  components: {
    ConnectionForm,
    PageDeGarde,
    PageAttente,
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
    }
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
        data.game.rounds.forEach((round, index) => {
          this.currentScore[`round_${index + 1}`] = round
        })

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
        this.connectionStatus = 'disconnected'
        this.connectionMessage = "Vous avez été supprimé de la partie par l'administrateur"
        this.isConnectedToGame = false

        // Recharger la page pour effectuer la déconnexion
        window.location.reload()
      })

      // Écouter les mises à jour d'avancement de la partie
      deviceSocketService.on('game_advancement_update', (data) => {
        this.advancement = data.advancement
        if (data.game && typeof data.game.currentQuestion !== 'undefined') {
          this.currentQuestion = data.game.currentQuestion
        }

        if (data.advancement === 'waiting_for_player_selection') {
          this.isWaitingForSelection = true
        }

        console.log('📊 Avancement de la partie reçu:', data.advancement)
      })

      // Écouter la génération de question
      deviceSocketService.on('question_generated', (data) => {
        this.currentQuestion = data.question
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
