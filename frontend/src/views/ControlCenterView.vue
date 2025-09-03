<template>
  <!-- Afficher le formulaire de login si non authentifié -->
  <LoginForm v-if="!isAuthenticated" @login-success="handleLoginSuccess" />

  <!-- Afficher le Control Center si authentifié -->
  <div
    v-else
    class="h-full bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center px-8 pb-8 relative"
  >
    <!-- Bouton de déconnexion -->
    <div class="absolute top-8 right-8 z-10">
      <button
        @click="handleLogout"
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
        <span class="">Déconnexion</span>
      </button>
    </div>

    <!-- Titre principal -->
    <h1 class="text-white text-5xl font-bold m-16 tracking-wider">Humain ou IA ?</h1>

    <!-- Container principal avec les onglets -->
    <div
      class="w-full h-[80vh] bg-white/30 backdrop-opacity-10 backdrop-blur-sm rounded-3xl p-8 pt-2 shadow-2xl overflow-hidden"
    >
      <div class="rounded-2xl h-full flex flex-col">
        <!-- Navigation des onglets -->
        <div class="flex relative flex-shrink-0">
          <button
            @click="switchToTab('parties')"
            :class="[
              'flex-1 py-4 px-6 text-lg font-semibold transition-all duration-300 relative z-10',
              currentTab === 'parties' ? 'text-white' : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Parties
          </button>
          <div class="border-l border-2 border-gray-200"></div>
          <button
            @click="switchToTab('devices')"
            :class="[
              'flex-1 py-4 px-6 text-lg font-semibold transition-all duration-300 relative z-10',
              currentTab === 'devices' ? 'text-white' : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Appareils par défaut
          </button>
          <div class="border-l border-2 border-gray-200"></div>
          <button
            @click="switchToTab('authorizations')"
            :class="[
              'flex-1 py-4 px-6 text-lg font-semibold transition-all duration-300 relative z-10',
              currentTab === 'authorizations' ? 'text-white' : 'text-gray-500 hover:text-gray-700',
            ]"
          >
            Demandes d'autorisation
            <span
              v-if="pendingRequestsCount > 0"
              class="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse"
            >
              {{ pendingRequestsCount }}
            </span>
          </button>
        </div>

        <!-- Contenu des onglets avec défilement -->
        <div class="relative flex-1 min-h-0 overflow-hidden">
          <div
            :class="[
              'flex w-full h-full transition-transform duration-300 ease-in-out',
              currentTab === 'parties'
                ? 'transform translate-x-0'
                : currentTab === 'devices'
                  ? 'transform -translate-x-full'
                  : currentTab === 'authorizations'
                    ? 'transform -translate-x-[200%]'
                    : 'transform translate-x-0',
            ]"
          >
            <!-- Onglet Parties -->
            <div class="w-full h-full flex-shrink-0 p-6 flex flex-col">
              <!-- Header avec boutons -->
              <div class="mb-6 flex items-center justify-between flex-shrink-0">
                <!-- Bouton Créer une partie au centre -->
                <div class="flex-1"></div>
                <button
                  @click="createGame"
                  class="bg-gradient-to-br from-blue-400 to-purple-800 hover:from-blue-500 hover:to-purple-900 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Créer une partie
                </button>
                <div class="flex-1 flex justify-end">
                  <button
                    @click="loadGames"
                    :disabled="isLoadingGames"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Rafraîchir la liste des parties"
                  >
                    <svg
                      v-if="isLoadingGames"
                      class="w-4 h-4 animate-spin"
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
                    <svg
                      v-else
                      class="w-4 h-4"
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
                    {{ isLoadingGames ? 'Chargement...' : 'Actualiser' }}
                  </button>
                </div>
              </div>

              <!-- Message d'erreur -->
              <div
                v-if="gamesError"
                class="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Erreur: {{ gamesError }}
                </div>
              </div>

              <!-- Liste des parties avec gestion d'overflow -->
              <div class="flex-1 min-h-0 overflow-hidden">
                <!-- Indicateur de chargement -->
                <div v-if="isLoadingGames" class="h-full flex items-center justify-center">
                  <div class="flex items-center gap-3 text-gray-500">
                    <svg
                      class="w-6 h-6 animate-spin"
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
                    <span class="text-lg">Chargement des parties...</span>
                  </div>
                </div>

                <!-- Aucune partie -->
                <div v-else-if="games.length === 0" class="h-full flex items-center justify-center">
                  <p class="text-gray-400 text-xl font-medium">Aucune partie</p>
                </div>

                <!-- Liste des parties -->
                <div v-else class="h-full overflow-y-auto pr-2">
                  <div class="flex flex-wrap gap-4 p-4 justify-center">
                    <GameCard
                      v-for="game in games"
                      :key="game.id"
                      :game="game"
                      @stop-game="stopGame"
                      @remove-device="handleRemoveDeviceOrPlayer"
                      @game-launched="handleGameLaunched"
                      @next-round-triggered="handleNextRoundTriggered"
                      @show-qr-code="handleShowQRCode"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Appareils par défaut -->
            <div class="w-full h-full flex-shrink-0 p-6 flex flex-col">
              <!-- Header avec bouton de rafraîchissement -->
              <div class="mb-6 flex justify-end flex-shrink-0">
                <button
                  @click="loadDefaultDevices"
                  :disabled="isLoadingDevices"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Rafraîchir la liste des appareils"
                >
                  <svg
                    v-if="isLoadingDevices"
                    class="w-4 h-4 animate-spin"
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
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  {{ isLoadingDevices ? 'Chargement...' : 'Actualiser' }}
                </button>
              </div>

              <!-- Message d'erreur -->
              <div
                v-if="devicesError"
                class="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Erreur: {{ devicesError }}
                </div>
              </div>

              <!-- Liste des appareils -->
              <div class="flex-1 min-h-0 overflow-hidden">
                <!-- Indicateur de chargement -->
                <div v-if="isLoadingDevices" class="h-full flex items-center justify-center">
                  <div class="flex items-center gap-3 text-gray-500">
                    <svg
                      class="w-6 h-6 animate-spin"
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
                    <span class="text-lg">Chargement des appareils...</span>
                  </div>
                </div>

                <!-- Aucun appareil -->
                <div
                  v-else-if="defaultDevices.length === 0"
                  class="h-full flex items-center justify-center"
                >
                  <p class="text-gray-400 text-xl font-medium">Aucun appareil par défaut</p>
                </div>

                <!-- Liste des appareils -->
                <div v-else class="h-full overflow-y-auto pr-2">
                  <div class="space-y-4 p-4">
                    <div
                      v-for="device in defaultDevices"
                      :key="device.id"
                      class="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-white border-opacity-20"
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <h3 class="font-semibold text-gray-800">{{ device.name }}</h3>
                            <span
                              :class="[
                                'px-2 py-1 text-xs font-medium rounded-full',
                                device.status === 'Connecté'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800',
                              ]"
                            >
                              {{ device.status }}
                            </span>
                          </div>
                          <div class="space-y-1 text-sm text-gray-600">
                            <p><span class="font-medium">Type:</span> {{ device.type }}</p>
                            <p><span class="font-medium">SocketId:</span> {{ device.socketId }}</p>
                            <p v-if="device.game" class="text-blue-600">
                              <span class="font-medium">Partie:</span> {{ device.game }}
                            </p>
                            <p v-if="device.lastSeen" class="text-gray-500">
                              <span class="font-medium">Dernière activité:</span>
                              {{ formatTimestamp(device.lastSeen) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Demandes d'autorisation -->
            <div class="w-full h-full flex-shrink-0 p-6 flex flex-col">
              <!-- Header avec bouton de rafraîchissement -->
              <div class="mb-6 flex justify-end flex-shrink-0">
                <button
                  @click="loadPendingRequests"
                  :disabled="isLoadingAuthorizations"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Rafraîchir la liste des demandes"
                >
                  <svg
                    v-if="isLoadingAuthorizations"
                    class="w-4 h-4 animate-spin"
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
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  {{ isLoadingAuthorizations ? 'Chargement...' : 'Actualiser' }}
                </button>
              </div>

              <!-- Message d'erreur -->
              <div
                v-if="authorizationsError"
                class="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Erreur: {{ authorizationsError }}
                </div>
              </div>

              <!-- Liste des demandes d'autorisation -->
              <div class="flex-1 min-h-0 overflow-hidden">
                <!-- Indicateur de chargement -->
                <div v-if="isLoadingAuthorizations" class="h-full flex items-center justify-center">
                  <div class="flex items-center gap-3 text-gray-500">
                    <svg
                      class="w-6 h-6 animate-spin"
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
                    <span class="text-lg">Chargement des demandes...</span>
                  </div>
                </div>

                <!-- Aucune demande -->
                <div
                  v-else-if="pendingAuthorizations.length === 0"
                  class="h-full flex items-center justify-center"
                >
                  <p class="text-gray-400 text-xl font-medium">
                    Aucune demande d'autorisation en attente
                  </p>
                </div>
                <div v-else class="h-full overflow-y-auto pr-2">
                  <div class="space-y-4 p-4">
                    <div
                      v-for="auth in pendingAuthorizations"
                      :key="auth.id"
                      class="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-white border-opacity-20"
                    >
                      <div class="space-y-3">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold text-gray-800">
                            {{
                              auth.type === 'adddefaultdevice'
                                ? "Ajout d'appareil par défaut"
                                : 'Connexion à une partie'
                            }}
                          </h3>
                          <span class="text-xs text-gray-500">{{
                            formatTimestamp(auth.timestamp)
                          }}</span>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-3">
                          <p class="font-medium text-gray-700">{{ auth.device.name }}</p>
                          <p class="text-sm text-gray-600">
                            {{ auth.device.type }} - SocketId: {{ auth.device.socketId }}
                          </p>
                          <p v-if="auth.game_id || auth.game" class="text-sm text-blue-600">
                            Partie: {{ auth.game_id || auth.game.id }}
                          </p>
                        </div>

                        <div class="flex space-x-3">
                          <button
                            @click="approveAuthorization(auth)"
                            class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                          >
                            ✅ Approuver
                          </button>
                          <button
                            @click="rejectAuthorization(auth)"
                            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création de partie -->
    <CreateGameModal
      :is-visible="showCreateGameModal"
      :available-devices="availableDevices"
      @close="closeCreateGameModal"
      @game-created="handleGameCreated"
    />
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'
import CreateGameModal from '@/components/CreateGameModal.vue'
import GameCard from '@/components/GameCard.vue'
import authService from '@/services/authService'
import socketService from '@/services/socketService'

export default {
  name: 'ControlCenterView',
  components: {
    LoginForm,
    CreateGameModal,
    GameCard,
  },
  data() {
    return {
      isAuthenticated: false,
      currentTab: 'parties',
      showCreateGameModal: false,
      socket: null,
      pendingAuthorizations: [],
      games: [
        // Exemples de données - remplacer par des vraies données d'API
        // { id: 1, name: 'Partie 1', status: 'En attente', createdAt: new Date() },
        // { id: 2, name: 'Partie 2', status: 'En cours', createdAt: new Date() },
      ],
      defaultDevices: [
        // Exemples de données - remplacer par des vraies données d'API
        // { id: 1, name: 'iPhone 14', type: 'Mobile', status: 'Connecté', socketId: 'socket_123' },
        // { id: 2, name: 'MacBook Pro', type: 'Ordinateur', status: 'Déconnecté', socketId: 'socket_456' },
      ],
      isLoadingDevices: false,
      devicesError: null,
      isLoadingGames: false,
      gamesError: null,
      availableDevices: null,
      isLoadingAuthorizations: false,
      authorizationsError: null,
      toastNotifications: [],
      pendingRequestsCount: 0,
    }
  },
  methods: {
    // Méthodes d'authentification
    async checkAuthentication() {
      try {
        // Vérifier si un token JWT existe
        const token = authService.getToken()
        if (!token) {
          this.isAuthenticated = false
          return
        }

        // Vérifier la validité du token auprès du serveur
        const response = await fetch(
          'https://https://human-or-ai.vizyondijital.fr/api/api/auth/verify',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        if (response.ok) {
          this.isAuthenticated = true
          // Établir la connexion Socket.IO après authentification réussie
          this.connectToSocket(token)
          // Charger les données
          this.loadGames()
          this.loadDefaultDevices()
        } else {
          // Token invalide, déconnecter l'utilisateur
          authService.logout()
          this.isAuthenticated = false
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error)
        // En cas d'erreur, déconnecter l'utilisateur
        authService.logout()
        this.isAuthenticated = false
      }
    },

    // Connexion Socket.IO
    connectToSocket(token) {
      try {
        // Utiliser le service Socket.IO
        this.socket = socketService.connect(token)

        // Écouter les erreurs d'authentification
        socketService.on('auth_error', (error) => {
          console.error("❌ Erreur d'authentification Socket.IO:", error)
          // En cas d'erreur, déconnecter et rediriger vers le login
          this.handleLogout()
        })

        // Écouter les notifications de nombre de demandes en attente
        socketService.on('pending_requests_count', (data) => {
          console.log(`📊 Nombre de demandes en attente: ${data.count}`)
          this.pendingRequestsCount = data.count

          // Pas de notification toast pour les mises à jour de compteur
          // Seules les nouvelles demandes déclenchent des notifications
        })

        // Écouter les nouvelles demandes d'autorisation
        socketService.on('new_authorization_request', (data) => {
          console.log("🆕 Nouvelle demande d'autorisation:", data)

          // Son de notification
          this.playNotificationSound()

          // Recharger la liste des demandes si on est sur l'onglet approprié
          if (this.currentTab === 'authorizations') {
            this.loadPendingRequests()
          }
        })

        // Écouter les notifications d'autorisation (désactivé pour éviter le spam)
        // socketService.on('authorization_notification', (data) => {
        //   console.log("🔔 Notification d'autorisation:", data)
        // })

        // Écouter les mises à jour d'avancement des parties
        socketService.on('game_advancement_updated', (data) => {
          console.log("📊 Mise à jour d'avancement de partie:", data)

          // Recharger les données si nécessaire
          if (this.currentTab === 'parties') {
            this.loadGames()
          }
        })

        // Écouter l'événement round_ended
        socketService.on('round_ended', (data) => {
          console.log('🏁 Round terminé reçu par le control center:', data)
          console.log('🔍 Données reçues détaillées:', {
            gameId: data.gameId,
            roundNumber: data.roundNumber,
            hasRoundResults: !!data.roundResults,
            hasScore: !!data.score,
            timestamp: data.timestamp,
          })

          // Mettre à jour l'état local pour afficher le bouton "Manche suivante"
          this.updateGameRoundEnded(data.gameId, data.roundNumber, data.roundResults, data.score)

          // NE PAS recharger les données car cela écrase l'état roundEnded
          // if (this.currentTab === 'parties') {
          //   this.loadGames()
          // }
        })

        // Écouter l'événement game_ended
        socketService.on('game_ended', (data) => {
          console.log('🎉 Partie terminée reçue par le control center:', data)
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

          // Mettre à jour l'état local pour marquer la partie comme terminée
          this.updateGameEnded(data.game)
        })
      } catch (error) {
        console.error('Erreur lors de la connexion Socket.IO:', error)
      }
    },

    // Charger les demandes d'autorisation depuis l'API
    async loadPendingRequests() {
      try {
        this.isLoadingAuthorizations = true
        this.authorizationsError = null

        const response = await fetch(
          'https://https://human-or-ai.vizyondijital.fr/api/api/devices/pending-requests',
        )
        const data = await response.json()

        if (data.success) {
          this.pendingAuthorizations = data.data.requests
          console.log(`📋 ${data.data.count} demande(s) d'autorisation chargée(s)`)
        } else {
          this.authorizationsError = data.message || 'Erreur lors du chargement des demandes'
          console.error('❌ Erreur API:', data.message)
        }
      } catch (error) {
        this.authorizationsError = 'Erreur de connexion au serveur'
        console.error('❌ Erreur lors du chargement des demandes:', error)
      } finally {
        this.isLoadingAuthorizations = false
      }
    },

    // Gestion des demandes d'autorisation
    addPendingAuthorization(request) {
      // Générer un ID unique pour la demande
      request.id = Date.now() + Math.random()
      this.pendingAuthorizations.push(request)
    },

    approveAuthorization(auth) {
      try {
        // Envoyer la réponse d'autorisation au serveur
        socketService.emit('device_authorization_response', {
          requestId: auth.id,
          authorized: true,
          reason: null,
        })

        // Retirer la demande de la liste
        this.removePendingAuthorization(auth.id)

        console.log('✅ Autorisation accordée pour:', auth.device.name)
      } catch (error) {
        console.error("Erreur lors de l'approbation:", error)
      }
    },

    rejectAuthorization(auth) {
      try {
        // Envoyer la réponse d'autorisation au serveur
        socketService.emit('device_authorization_response', {
          requestId: auth.id,
          authorized: false,
          reason: "Refusé par l'administrateur",
        })

        // Retirer la demande de la liste
        this.removePendingAuthorization(auth.id)

        console.log('❌ Autorisation refusée pour:', auth.device.name)
      } catch (error) {
        console.error('Erreur lors du refus:', error)
      }
    },

    removePendingAuthorization(id) {
      const index = this.pendingAuthorizations.findIndex((auth) => auth.id === id)
      if (index !== -1) {
        this.pendingAuthorizations.splice(index, 1)
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    },

    handleLoginSuccess() {
      this.isAuthenticated = true
      // Charger les données après authentification
      this.loadGames()
      this.loadDefaultDevices()
    },

    handleLogout() {
      // Déconnecter la socket via le service
      socketService.disconnect()
      this.socket = null

      authService.logout()
      this.isAuthenticated = false
      // Optionnel: rediriger vers l'accueil
      // this.$router.push('/')
    },

    // Méthodes existantes
    switchToTab(tab) {
      this.currentTab = tab

      // Charger les données appropriées selon l'onglet sélectionné
      if (tab === 'parties') {
        this.loadGames()
      } else if (tab === 'devices') {
        this.loadDefaultDevices()
      } else if (tab === 'authorizations') {
        this.loadPendingRequests()
      }
    },
    async createGame() {
      try {
        // Charger les appareils disponibles avant d'ouvrir le modal
        console.log('🔄 Chargement des appareils disponibles pour la création de partie...')

        const response = await fetch(
          'https://https://human-or-ai.vizyondijital.fr/api/api/devices/available',
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          console.log('✅ Appareils disponibles chargés pour la création de partie')
          // Stocker les devices disponibles pour les passer au modal
          this.availableDevices = data.data
        } else {
          throw new Error(data.message || 'Erreur lors du chargement des appareils disponibles')
        }

        // Ouvrir le modal de création de partie
        this.showCreateGameModal = true
      } catch (error) {
        console.error('❌ Erreur lors du chargement des appareils disponibles:', error)
        alert(`Erreur lors du chargement des appareils: ${error.message}`)
      }
    },

    async handleGameCreated(gameData) {
      console.log('Nouvelle partie créée:', gameData)

      // Fermer le modal
      this.showCreateGameModal = false

      // Recharger la liste des parties pour inclure la nouvelle partie
      await this.loadGames()

      // Basculer vers l'onglet des parties pour montrer la nouvelle partie
      this.currentTab = 'parties'

      console.log('✅ Liste des parties mise à jour après création')
    },

    closeCreateGameModal() {
      this.showCreateGameModal = false
    },

    stopGame(gameId) {
      console.log('Arrêt de la partie:', gameId)
      // TODO: Appeler l'API pour arrêter la partie
      // this.$emit('stop-game', gameId)
    },

    // Gérer la suppression d'un device ou d'un joueur selon le type
    handleRemoveDeviceOrPlayer(data) {
      const { deviceType } = data
      if (deviceType === 'player') {
        this.removePlayerFromGame(data)
      } else {
        this.removeDeviceFromGame(data)
      }
    },

    async removeDeviceFromGame(data) {
      try {
        const { gameId, device, deviceType } = data
        console.log(
          `🗑️ Suppression de l'appareil ${device.name} (${deviceType}) de la partie ${gameId}`,
        )

        // Appeler l'API pour supprimer l'appareil de la partie
        const response = await fetch(
          `https://https://human-or-ai.vizyondijital.fr/api/api/devices/${gameId}/remove/${device.socketId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          console.log('✅ Appareil supprimé avec succès de la partie')

          // Mettre à jour l'état local au lieu de recharger
          this.updateGameAfterDeviceRemoval(gameId, device.socketId, deviceType)
        } else {
          throw new Error(result.message || "Erreur lors de la suppression de l'appareil")
        }
      } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'appareil:", error)
      }
    },

    async removePlayerFromGame(data) {
      try {
        const { gameId, player, deviceType } = data
        console.log(
          `🗑️ Suppression du joueur ${player.name} (${deviceType}) de la partie ${gameId}`,
        )

        // Appeler l'API pour supprimer le joueur de la partie
        const response = await fetch(
          `https://https://human-or-ai.vizyondijital.fr/api/api/devices/${gameId}/remove/${player.socketId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const result = await response.json()

        if (result.success) {
          console.log('✅ Joueur supprimé avec succès de la partie')

          // Mettre à jour l'état local au lieu de recharger
          this.updateGameAfterPlayerRemoval(gameId, player.socketId, deviceType)
        } else {
          throw new Error(result.message || 'Erreur lors de la suppression du joueur')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du joueur:', error)
      }
    },

    // Mettre à jour l'état local après suppression d'un joueur
    updateGameAfterPlayerRemoval(gameId, playerSocketId, deviceType) {
      try {
        // Trouver la partie dans la liste
        const gameIndex = this.games.findIndex((g) => g.id === parseInt(gameId))

        if (gameIndex !== -1) {
          const game = this.games[gameIndex]
          console.log('🔍 Partie trouvée:', game)
          console.log('👥 Structure des joueurs:', {
            players: game.players,
          })

          // Supprimer le joueur de la liste des joueurs
          if (game.players && Array.isArray(game.players)) {
            const playerIndex = game.players.findIndex((p) => p.socketId === playerSocketId)
            if (playerIndex !== -1) {
              console.log('🗑️ Joueur trouvé, ajout de la classe removing')
              // Ajouter une classe pour l'animation de sortie
              game.players[playerIndex].removing = true

              // Supprimer le joueur après l'animation
              setTimeout(() => {
                game.players.splice(playerIndex, 1)
                console.log('✅ Joueur supprimé de la liste')

                // Mettre à jour le statut de la partie si nécessaire
                if (
                  game.players.length === 0 &&
                  game.defaultDevices.length === 0 &&
                  game.nonDefaultDevices.length === 0 &&
                  game.status === 'in_progress'
                ) {
                  game.status = 'waiting'
                  console.log('🔄 Partie remise en attente (aucun joueur/appareil)')
                }

                // Forcer la mise à jour de l'interface
                this.$forceUpdate()
              }, 150) // Durée de l'animation réduite
            } else {
              console.log('⚠️ Joueur non trouvé dans la liste')
            }
          } else {
            console.log("⚠️ game.players n'existe pas ou n'est pas un tableau")
          }
        } else {
          console.log('⚠️ Partie non trouvée dans la liste')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour après suppression du joueur:', error)
      }
    },

    // Mettre à jour l'état local après suppression d'un appareil
    updateGameAfterDeviceRemoval(gameId, deviceSocketId, deviceType) {
      try {
        // Trouver la partie dans la liste
        const gameIndex = this.games.findIndex((g) => g.id === parseInt(gameId))

        if (gameIndex !== -1) {
          const game = this.games[gameIndex]
          console.log('🔍 Partie trouvée:', game)
          console.log('📱 Structure des appareils:', {
            defaultDevices: game.defaultDevices,
            nonDefaultDevices: game.nonDefaultDevices,
            devices: game.devices,
          })

          // Supprimer l'appareil de la liste appropriée selon le type
          if (deviceType === 'default') {
            // Vérifier que defaultDevices existe
            if (game.defaultDevices && Array.isArray(game.defaultDevices)) {
              const deviceIndex = game.defaultDevices.findIndex(
                (d) => d.socketId === deviceSocketId,
              )
              if (deviceIndex !== -1) {
                console.log('🗑️ Appareil par défaut trouvé, ajout de la classe removing')
                // Ajouter une classe pour l'animation de sortie
                game.defaultDevices[deviceIndex].removing = true

                // Supprimer l'appareil après l'animation
                setTimeout(() => {
                  game.defaultDevices.splice(deviceIndex, 1)
                  console.log('✅ Appareil par défaut supprimé de la liste')

                  // Mettre à jour le statut de la partie si nécessaire
                  if (
                    game.defaultDevices.length === 0 &&
                    game.nonDefaultDevices.length === 0 &&
                    game.status === 'in_progress'
                  ) {
                    game.status = 'waiting'
                    console.log('🔄 Partie remise en attente (aucun appareil)')
                  }

                  // Forcer la mise à jour de l'interface
                  this.$forceUpdate()
                }, 150) // Durée de l'animation réduite
              } else {
                console.log('⚠️ Appareil par défaut non trouvé dans la liste')
              }
            } else {
              console.log("⚠️ game.defaultDevices n'existe pas ou n'est pas un tableau")
            }
          } else if (deviceType === 'invited') {
            // Vérifier que nonDefaultDevices existe
            if (game.nonDefaultDevices && Array.isArray(game.nonDefaultDevices)) {
              const deviceIndex = game.nonDefaultDevices.findIndex(
                (d) => d.socketId === deviceSocketId,
              )
              if (deviceIndex !== -1) {
                console.log('🗑️ Appareil invité trouvé, ajout de la classe removing')
                // Ajouter une classe pour l'animation de sortie
                game.nonDefaultDevices[deviceIndex].removing = true

                // Supprimer l'appareil après l'animation
                setTimeout(() => {
                  game.nonDefaultDevices.splice(deviceIndex, 1)
                  console.log('✅ Appareil invité supprimé de la liste')

                  // Mettre à jour le statut de la partie si nécessaire
                  if (
                    game.defaultDevices.length === 0 &&
                    game.nonDefaultDevices.length === 0 &&
                    game.status === 'in_progress'
                  ) {
                    game.status = 'waiting'
                    console.log('🔄 Partie remise en attente (aucun appareil)')
                  }

                  // Forcer la mise à jour de l'interface
                  this.$forceUpdate()
                }, 150) // Durée de l'animation réduite
              } else {
                console.log('⚠️ Appareil invité non trouvé dans la liste')
              }
            } else {
              console.log("⚠️ game.nonDefaultDevices n'existe pas ou n'est pas un tableau")
            }
          }
        } else {
          console.log('⚠️ Partie non trouvée dans la liste')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour locale:', error)
        console.error('Stack:', error.stack)
      }
    },

    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    },
    async loadGames() {
      try {
        this.isLoadingGames = true
        this.gamesError = null
        console.log('🔄 Chargement des parties...')

        const response = await fetch(
          'https://https://human-or-ai.vizyondijital.fr/api/api/getgames',
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Préserver l'état roundEnded des parties existantes
          const existingGames = this.games || []
          const newGames = data.games || []

          // Créer un map des parties existantes avec leur état advancement
          // On ne préserve que les propriétés qui ne sont pas persistées côté serveur
          const existingGamesMap = new Map()
          existingGames.forEach((game) => {
            if (game.advancement !== undefined) {
              existingGamesMap.set(game.id, {
                advancement: game.advancement,
                currentRoundNumber: game.currentRoundNumber,
                lastRoundResults: game.lastRoundResults,
                finalRoundNumber: game.finalRoundNumber,
                finalScore: game.finalScore,
                finalRoundResults: game.finalRoundResults,
                gameEnded: game.gameEnded,
                gameResult: game.gameResult,
                // Préserver le statut si la partie est terminée
                status: game.status === 'finished' ? 'finished' : undefined,
                // NE PAS préserver currentRound et rounds - ils viennent du serveur
              })
              console.log(
                `🔍 État préservé pour la partie ${game.id}: advancement=${game.advancement}, status=${game.status}, gameEnded=${game.gameEnded}`,
              )
            }
          })

          // Appliquer l'état préservé aux nouvelles données
          this.games = newGames.map((game) => {
            console.log('New Game', game)
            const existingState = existingGamesMap.get(game.id)
            if (existingState) {
              console.log(
                `🔄 Application de l'état préservé à la partie ${game.id}: advancement=${existingState.advancement}, status=${existingState.status}, gameEnded=${existingState.gameEnded}`,
              )
              // Créer un nouvel objet pour éviter les références partagées
              const updatedGame = { ...game }
              // Appliquer seulement les propriétés qui ne sont pas persistées côté serveur
              updatedGame.advancement = existingState.advancement
              updatedGame.currentRoundNumber = existingState.currentRoundNumber
              updatedGame.lastRoundResults = existingState.lastRoundResults
              updatedGame.finalRoundNumber = existingState.finalRoundNumber
              updatedGame.finalScore = existingState.finalScore
              updatedGame.finalRoundResults = existingState.finalRoundResults
              updatedGame.gameEnded = existingState.gameEnded
              updatedGame.gameResult = existingState.gameResult
              // currentRound et rounds viennent du serveur, ne pas les écraser
              // Appliquer le statut si la partie est terminée
              if (existingState.status === 'finished') {
                updatedGame.status = 'finished'
              }
              return updatedGame
            }
            return game
          })

          console.log('✅ Parties chargées:', this.games.length)
        } else {
          throw new Error(data.message || 'Erreur lors du chargement des parties')
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des parties:', error)
        this.gamesError = error.message
        this.games = []

        // En cas d'erreur, afficher un message à l'utilisateur
        // Vous pouvez ajouter un toast ou une notification ici
      } finally {
        this.isLoadingGames = false
      }
    },
    async loadDefaultDevices() {
      try {
        this.isLoadingDevices = true
        this.devicesError = null
        console.log('🔄 Chargement des appareils par défaut...')

        const response = await fetch(
          'https://https://human-or-ai.vizyondijital.fr/api/api/devices/default',
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Mettre à jour la liste des appareils par défaut
          this.defaultDevices = data.data.devices.map((device) => ({
            id: device.socketId,
            name: device.name,
            type: device.type,
            status: device.connected ? 'Connecté' : 'Déconnecté',
            socketId: device.socketId,
            game: device.game,
            lastSeen: device.lastSeen,
          }))

          console.log('✅ Appareils par défaut chargés:', this.defaultDevices.length)
        } else {
          throw new Error(data.message || 'Erreur lors du chargement des appareils')
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des appareils par défaut:', error)
        this.devicesError = error.message

        // En cas d'erreur, afficher un message à l'utilisateur
        // Vous pouvez ajouter un toast ou une notification ici
      } finally {
        this.isLoadingDevices = false
      }
    },

    // Formater un timestamp en format lisible
    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'

      try {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "À l'instant"
        if (diffMins < 60) return `Il y a ${diffMins} min`
        if (diffHours < 24) return `Il y a ${diffHours}h`
        if (diffDays < 7) return `Il y a ${diffDays}j`

        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch (error) {
        return 'Format invalide'
      }
    },

    // Jouer un son de notification
    playNotificationSound() {
      try {
        // Créer un contexte audio simple pour la notification
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (error) {
        console.log('Impossible de jouer le son de notification:', error)
      }
    },

    // Gérer le lancement d'une partie
    handleGameLaunched(gameId) {
      console.log(`🎮 Partie ${gameId} lancée avec succès`)

      // Recharger la liste des parties pour afficher le nouveau statut
      this.loadGames()
    },

    // Gérer le déclenchement d'une manche suivante
    handleNextRoundTriggered(gameId) {
      console.log(`▶️ Manche suivante déclenchée pour la partie ${gameId}`)

      // Recharger la liste des parties pour afficher le nouveau statut
      this.loadGames()
    },

    handleShowQRCode(gameId) {
      console.log(`📱 Toggle du QR code pour la partie ${gameId}`)

      // Émettre un événement socket pour toggle le QR code sur l'écran de présentation
      socketService.emit('toggle_qr_code', { gameId })
    },

    // Mettre à jour l'état local quand un round se termine
    updateGameRoundEnded(gameId, roundNumber, roundResults, score) {
      try {
        console.log(
          `🔄 Mise à jour du round terminé - gameId: ${gameId}, roundNumber: ${roundNumber}`,
        )

        // Trouver la partie dans la liste
        const gameIndex = this.games.findIndex((g) => g.id === parseInt(gameId))
        console.log(`🔍 Index de la partie trouvé: ${gameIndex}`)

        if (gameIndex !== -1) {
          const game = this.games[gameIndex]
          console.log(`🎮 Partie trouvée:`, game)

          // Marquer que le round est terminé et qu'on peut passer au suivant
          // Dans Vue 3, on peut directement assigner les propriétés
          game.advancement = 'round_ended'
          game.currentRoundNumber = roundNumber
          game.lastRoundResults = roundResults
          game.score = score

          console.log(`🏁 Round ${roundNumber} terminé pour la partie ${gameId}`)
          console.log('📊 Résultats du round:', roundResults)
          console.log(`✅ État de la partie mis à jour - advancement: ${game.advancement}`)
        } else {
          console.log('⚠️ Partie non trouvée pour la mise à jour du round terminé')
          console.log(
            '📋 Parties disponibles:',
            this.games.map((g) => ({ id: g.id, status: g.status })),
          )
        }
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du round terminé:', error)
      }
    },

    // Mettre à jour l'état local quand une partie se termine
    updateGameEnded(gameData) {
      try {
        console.log(`🎉 Mise à jour de la partie terminée - gameId: ${gameData.id}`)

        // Trouver la partie dans la liste
        const gameIndex = this.games.findIndex((g) => g.id === parseInt(gameData.id))
        console.log(`🔍 Index de la partie trouvé: ${gameIndex}`)

        if (gameIndex !== -1) {
          const game = this.games[gameIndex]
          console.log(`🎮 Partie trouvée:`, game)

          // Mettre à jour la partie avec toutes les données de fin de partie
          game.advancement = 'game_ended'
          game.status = 'finished'
          game.gameEnded = gameData.gameEnded
          game.finalScore = gameData.finalScore
          game.finalRoundNumber = gameData.finalRoundNumber
          game.finalRoundResults = gameData.finalRoundResults
          game.gameResult = gameData.gameResult

          console.log(
            `🏆 Partie ${gameData.id} terminée après ${gameData.finalRoundNumber} manches`,
          )
          console.log('📊 Score final:', gameData.finalScore)
          console.log('🏆 Résultat:', gameData.gameResult)
          console.log(
            `✅ État de la partie mis à jour - advancement: ${game.advancement}, status: ${game.status}`,
          )
        } else {
          console.log('⚠️ Partie non trouvée pour la mise à jour de la partie terminée')
          console.log(
            '📋 Parties disponibles:',
            this.games.map((g) => ({ id: g.id, status: g.status })),
          )
        }
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la partie terminée:', error)
      }
    },
  },
  mounted() {
    // Vérifier l'authentification au montage du composant
    this.checkAuthentication()

    // Modifier le titre de la page
    document.title = 'Human or AI - Control Center'
  },

  beforeUnmount() {
    // Nettoyer la connexion Socket.IO avant la destruction du composant
    socketService.disconnect()
    this.socket = null
  },
}
</script>

<style scoped>
/* Animation pour le défilement fluide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Scrollbar personnalisée pour tous les conteneurs avec défilement */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.8);
}

/* Styles pour Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 51, 234, 0.6) rgba(255, 255, 255, 0.1);
}

/* Assurer que les conteneurs flex ont une hauteur appropriée */
.flex-1.min-h-0 {
  min-height: 0;
  flex: 1 1 0%;
}

/* Animation de transition pour les changements d'onglets */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
