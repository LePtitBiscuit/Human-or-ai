<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <!-- Modal container -->
    <div
      class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] overflow-y-auto"
    >
      <!-- Header avec titre et bouton fermer -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800">Création partie</h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Contenu du formulaire -->
      <div class="p-6 space-y-6">
        <!-- Section Paramètres de la partie -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Paramètres de la partie</h3>

          <!-- Nombre de manches -->
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-medium text-gray-700">Nombre de manches</label>
            <div class="flex items-center bg-gray-100 rounded-lg">
              <button
                @click="decreaseRounds"
                :disabled="rounds <= 3"
                class="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  ></path>
                </svg>
              </button>
              <span class="px-3 py-1 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                {{ rounds }}
              </span>
              <button
                @click="increaseRounds"
                :disabled="rounds >= 10"
                class="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Toggle Solo/Multijoueur -->
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Mode de jeu</label>
            <div class="flex items-center">
              <span class="mr-2 text-xs font-medium text-gray-600">Solo</span>
              <button
                @click="toggleGameMode"
                class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                :class="gameMode === 'solo' ? 'bg-purple-600' : 'bg-gray-300'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out"
                  :class="gameMode === 'solo' ? 'translate-x-1' : 'translate-x-6'"
                ></span>
              </button>
              <span class="ml-2 text-xs font-medium text-gray-600">Multijoueurs</span>
            </div>
          </div>
        </div>

        <!-- Section Paramètres avancés -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Paramètres avancés</h3>
            <button
              @click="refreshDevices"
              :disabled="isLoadingDevices"
              class="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-300 hover:border-purple-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <!-- Appareil de présentation -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Appareil de présentation</label
            >
            <div class="relative">
              <select
                v-model="selectedPresentationDevice"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm"
              >
                <option
                  v-for="device in presentationDevices"
                  :key="device.id"
                  :value="device.id"
                  class="py-1"
                >
                  {{ device.name }}{{ device.socketId ? ' / SocketId: ' + device.socketId : '' }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- Message d'erreur -->
            <div
              v-if="devicesError"
              class="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2"
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
          </div>

          <!-- Appareil d'entrée des réponses -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Appareil d'entrée des réponses</label
            >
            <div class="relative">
              <select
                v-model="selectedResponseDevice"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm"
              >
                <option
                  v-for="device in responseDevices"
                  :key="device.id"
                  :value="device.id"
                  class="py-1"
                >
                  {{ device.name }}{{ device.socketId ? ' / SocketId: ' + device.socketId : '' }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer avec boutons -->
      <div
        class="flex justify-end gap-3 border-t border-gray-200 pt-4 pb-4 px-6 absolute bottom-0 right-0 w-full rounded-b-2xl"
      >
        <button
          @click="closeModal"
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Annuler
        </button>
        <button
          @click="createGame"
          class="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Créer la partie
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateGameModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    availableDevices: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      rounds: 4,
      gameMode: 'solo', // 'solo' ou 'multijoueur'
      selectedPresentationDevice: 1,
      selectedResponseDevice: 1,

      // Appareils récupérés depuis l'API
      presentationDevices: [{ id: 0, name: 'Aucun', socketId: null }],
      responseDevices: [{ id: 0, name: 'Aucun', socketId: null }],
      isLoadingDevices: false,
      devicesError: null,
    }
  },
  methods: {
    increaseRounds() {
      if (this.rounds < 10) {
        this.rounds++
      }
    },

    decreaseRounds() {
      if (this.rounds > 3) {
        this.rounds--
      }
    },

    toggleGameMode() {
      this.gameMode = this.gameMode === 'solo' ? 'multijoueur' : 'solo'
    },

    // Récupérer les appareils disponibles depuis l'API
    async fetchAvailableDevices() {
      try {
        this.isLoadingDevices = true
        this.devicesError = null
        console.log('🔄 Récupération des appareils disponibles...')

        const response = await fetch('http://localhost:3000/api/devices/available')

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          // Ajouter l'option "Aucun" et les appareils de présentation
          this.presentationDevices = [
            { id: 0, name: 'Aucun', socketId: null },
            ...data.data.default_presentation_devices.devices.map((device, index) => ({
              id: index + 1,
              name: device.name,
              socketId: device.socketId,
            })),
          ]

          // Ajouter l'option "Aucun" et les appareils de réponse
          this.responseDevices = [
            { id: 0, name: 'Aucun', socketId: null },
            ...data.data.default_response_devices.devices.map((device, index) => ({
              id: index + 1,
              name: device.name,
              socketId: device.socketId,
            })),
          ]

          console.log('✅ Appareils récupérés avec succès:', {
            presentation: this.presentationDevices.length - 1,
            response: this.responseDevices.length - 1,
          })
        } else {
          throw new Error(data.message || 'Erreur lors de la récupération des appareils')
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des appareils:', error)
        this.devicesError = error.message

        // En cas d'erreur, afficher un message à l'utilisateur
        alert(`Erreur lors de la récupération des appareils: ${error.message}`)
      } finally {
        this.isLoadingDevices = false
      }
    },

    // Mettre à jour les devices depuis les props
    updateDevicesFromProps(devicesData) {
      console.log('🔄 Mise à jour des devices depuis les props:', devicesData)

      try {
        // Ajouter l'option "Aucun" et les appareils de présentation
        this.presentationDevices = [
          { id: 0, name: 'Aucun', socketId: null },
          ...(devicesData.default_presentation_devices?.devices || []).map((device, index) => ({
            id: index + 1,
            name: device.name,
            socketId: device.socketId,
          })),
        ]

        // Ajouter l'option "Aucun" et les appareils de réponse
        this.responseDevices = [
          { id: 0, name: 'Aucun', socketId: null },
          ...(devicesData.default_response_devices?.devices || []).map((device, index) => ({
            id: index + 1,
            name: device.name,
            socketId: device.socketId,
          })),
        ]

        console.log('✅ Devices mis à jour depuis les props:', {
          presentation: this.presentationDevices.length - 1,
          response: this.responseDevices.length - 1,
        })

        // Réinitialiser les sélections
        this.selectedPresentationDevice = 0
        this.selectedResponseDevice = 0
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des devices depuis les props:', error)
      }
    },

    // Rafraîchir la liste des appareils
    async refreshDevices() {
      console.log('🔄 Rafraîchissement de la liste des appareils...')

      // Si on a des devices dans les props, les utiliser
      if (this.availableDevices) {
        this.updateDevicesFromProps(this.availableDevices)
      } else {
        // Sinon, faire la requête API
        await this.fetchAvailableDevices()
      }
    },

    async createGame() {
      try {
        // Récupérer les appareils sélectionnés
        const selectedPresentationDevice = this.presentationDevices.find(
          (d) => d.id === this.selectedPresentationDevice,
        )
        const selectedResponseDevice = this.responseDevices.find(
          (d) => d.id === this.selectedResponseDevice,
        )

        // Préparer les données au format attendu par le serveur
        const devicesData = []

        // Ajouter l'appareil de présentation seulement s'il est sélectionné
        if (selectedPresentationDevice.socketId) {
          devicesData.push({
            socketId: selectedPresentationDevice.socketId,
            role: 'presentation',
          })
        }

        // Ajouter l'appareil de réponse seulement s'il est sélectionné
        if (selectedResponseDevice.socketId) {
          devicesData.push({
            socketId: selectedResponseDevice.socketId,
            role: 'response',
          })
        }

        const serverData = {
          nombreManches: this.rounds,
          devicesData: devicesData,
        }

        console.log('Données envoyées au serveur:', serverData)

        // Envoyer les données au serveur
        const response = await fetch('http://localhost:3000/api/creategame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serverData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erreur lors de la création de la partie')
        }

        const result = await response.json()
        console.log('Partie créée avec succès:', result)

        // Émettre l'événement avec les données de la partie créée
        this.$emit('game-created', {
          ...serverData,
          gameId: result.game.id,
          status: result.game.status,
        })

        // Fermer le modal
        this.closeModal()
      } catch (error) {
        console.error('Erreur lors de la création de la partie:', error)
        // TODO: Afficher un message d'erreur à l'utilisateur
        alert(`Erreur: ${error.message}`)
      }
    },

    closeModal() {
      this.$emit('close')
    },
  },

  watch: {
    availableDevices: {
      handler(newDevices) {
        if (newDevices) {
          this.updateDevicesFromProps(newDevices)
        }
      },
      immediate: true,
    },
  },

  mounted() {
    // Initialiser avec "Aucun" par défaut
    this.selectedPresentationDevice = 0
    this.selectedResponseDevice = 0

    // Si on a déjà les devices disponibles, les utiliser
    if (this.availableDevices) {
      this.updateDevicesFromProps(this.availableDevices)
    } else {
      // Sinon, récupérer depuis l'API (fallback)
      this.fetchAvailableDevices()
    }
  },
}
</script>

<style scoped>
/* Animation pour le modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Styles pour les selects */
select:focus {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

/* Hover effects pour les boutons de manches */
button:not(:disabled):hover {
  background-color: rgba(147, 51, 234, 0.1);
  border-radius: 0.5rem;
}
</style>
