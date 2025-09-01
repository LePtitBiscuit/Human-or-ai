<template>
  <!-- Afficher le formulaire de connexion si non connecté à une partie -->
  <div
    v-if="!isConnectedToGame"
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-8"
  >
    <!-- Formulaire de connexion avec effet de réduction d'opacité -->
    <div
      v-if="connectionStatus === 'disconnected' || connectionStatus === 'error'"
      class="w-full max-w-md"
    >
      <div class="text-center mb-8">
        <h1 class="text-white text-4xl font-bold tracking-wider mb-4">
          Connexion à la partie {{ gameId }}
        </h1>
      </div>

      <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Champ pseudo -->
          <div>
            <label for="pseudo" class="block text-gray-800 font-medium text-lg mb-1 text-left">
              Pseudo
            </label>
            <input
              id="pseudo"
              v-model="pseudo"
              type="text"
              placeholder="Entrez votre pseudo..."
              class="w-full px-4 py-3 bg-white/80 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              autocomplete="off"
              required
            />
          </div>

          <!-- Sélection du rôle -->
          <div>
            <label class="block text-gray-800 font-medium text-lg mb-1 text-left">
              Sur cet appareil vous voulez :
            </label>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedRole"
                  value="response"
                  class="w-4 h-4 text-purple-600 bg-white border-white focus:ring-purple-500"
                />
                <span class="text-white font-medium">Répondre aux questions</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="selectedRole"
                  value="selection"
                  class="w-4 h-4 text-purple-600 bg-white border-white focus:ring-purple-500"
                />
                <span class="text-white font-medium"
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
              'w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform',
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
    <div v-else-if="connectionStatus === 'error'" class="w-full max-w-md text-center">
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

  <!-- Afficher la page d'attente si connecté avec avancement "waiting_for_launch" -->
  <PageAttente v-else-if="isConnectedToGame && advancement === 'waiting_for_launch'" />

  <!-- Afficher la vue appropriée selon le rôle sélectionné pour les autres avancements -->
  <ResponseView
    v-else-if="
      isConnectedToGame &&
      selectedRole === 'response' &&
      advancement &&
      advancement !== 'waiting_for_launch'
    "
  />
  <SelectionView
    v-else-if="
      isConnectedToGame &&
      selectedRole === 'selection' &&
      advancement &&
      advancement !== 'waiting_for_launch'
    "
  />
</template>

<script>
import ResponseView from './ResponseView.vue'
import SelectionView from './SelectionView.vue'
import PageAttente from './Presentation/PageAttente.vue'
import deviceSocketService from '@/services/deviceSocketService'

export default {
  name: 'RemoteDevicesView',
  components: {
    ResponseView,
    SelectionView,
    PageAttente,
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
      advancement: null,
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
        this.connectionStatus = 'error'
        this.connectionMessage = 'Connexion refusée: ' + (error.message || 'Erreur inconnue')
        this.isConnectedToGame = false
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
        console.log('📊 Avancement de la partie reçu:', data.advancement)
      })
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
