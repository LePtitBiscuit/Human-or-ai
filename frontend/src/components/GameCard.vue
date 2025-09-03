<template>
  <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg w-[500px]">
    <!-- Header avec titre et statut -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-xl font-bold text-gray-800">Partie {{ game.id }}</h3>
        <!-- Indicateur de statut coloré -->
        <div
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-green-500': game.status === 'in_progress',
            'bg-red-500': game.status === 'stopped',
            'bg-orange-500': game.status === 'waiting',
          }"
        ></div>
      </div>
    </div>

    <!-- Affichage conditionnel : Score (solo) ou Avancement des rounds (multi) -->
    <div v-if="game.gameMode === 'solo'" class="mb-6">
      <!-- Barre de progression des scores pour mode solo -->
      <div class="flex items-center gap-2">
        <div
          v-for="(score, roundKey) in game.score"
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
    </div>

    <div v-else-if="game.gameMode === 'multi'" class="mb-6">
      <!-- Avancement des rounds pour mode multi -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            ></path>
          </svg>
          <span class="text-sm font-medium text-gray-700">Avancement :</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold text-blue-600">{{ game.currentRound || 0 }}</span>
          <span class="text-gray-500">/</span>
          <span class="text-lg font-bold text-gray-600">{{ game.rounds || 0 }}</span>
        </div>
        <div class="flex-1 bg-gray-200 rounded-full h-2 ml-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{
              width: game.rounds > 0 ? `${((game.currentRound || 0) / game.rounds) * 100}%` : '0%',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Séparateur -->
    <div class="border-t border-gray-300 mb-4"></div>

    <!-- Appareils par défauts -->
    <div class="mb-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Appareils par défauts</h4>
      <div v-if="game.defaultDevices && game.defaultDevices.length > 0" class="space-y-2">
        <div
          v-for="device in game.defaultDevices"
          :key="device.id"
          :class="[
            'flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3 transition-opacity duration-150',
            device.removing ? 'opacity-0' : 'opacity-100',
          ]"
        >
          <div class="flex items-center gap-3">
            <!-- Icône d'ordinateur -->
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-800">
                {{ device.name }} / SocketId: {{ device.socketId }}
              </p>
              <p class="text-xs text-gray-600">{{ getDeviceType(device) }}</p>
            </div>
          </div>
          <!-- Icône poubelle -->
          <button
            @click="removeDevice(device, 'default')"
            class="text-gray-400 hover:text-red-500 transition-colors duration-200"
            :title="`Retirer ${device.name} de la partie`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="text-gray-500 text-sm italic">Aucun</div>
    </div>

    <!-- Appareils invités -->
    <div class="mb-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Appareils invités</h4>
      <div v-if="game.nonDefaultDevices && game.nonDefaultDevices.length > 0" class="space-y-2">
        <div
          v-for="device in game.nonDefaultDevices"
          :key="device.id"
          :class="[
            'flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3 transition-opacity duration-150',
            device.removing ? 'opacity-0' : 'opacity-100',
          ]"
        >
          <div class="flex items-center gap-3">
            <!-- Icône d'ordinateur -->
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-800">
                {{ device.name }} / SocketId: {{ device.socketId }}
              </p>
              <p class="text-xs text-gray-600">{{ getDeviceType(device) }}</p>
            </div>
          </div>
          <!-- Icône poubelle -->
          <button
            @click="removeDevice(device, 'invited')"
            class="text-gray-400 hover:text-red-500 transition-colors duration-200"
            :title="`Retirer ${device.name} de la partie`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="text-gray-500 text-sm italic">Aucun</div>
    </div>

    <!-- Joueurs (uniquement en mode multijoueurs) -->
    <div v-if="game.gameMode === 'multi'" class="mb-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Joueurs</h4>
      <div v-if="game.players && game.players.length > 0" class="space-y-2">
        <div
          v-for="player in game.players"
          :key="player.socketId"
          :class="[
            'flex items-center justify-between bg-white bg-opacity-60 rounded-lg p-3 transition-opacity duration-150',
            player.removing ? 'opacity-0' : 'opacity-100',
          ]"
        >
          <div class="flex items-center gap-3">
            <!-- Icône de joueur -->
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-800">
                {{ player.name }}
              </p>
              <p class="text-xs text-gray-600">Joueur</p>
            </div>
          </div>
          <!-- Score du joueur et bouton de suppression -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Score:</span>
              <span class="text-sm font-medium text-blue-600">{{ getPlayerScore(player) }}</span>
            </div>
            <!-- Icône poubelle -->
            <button
              @click="removePlayer(player)"
              class="text-gray-400 hover:text-red-500 transition-colors duration-200"
              :title="`Retirer ${player.name} de la partie`"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 text-sm italic">Aucun joueur connecté</div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col items-start justify-between pt-4 border-t border-gray-300">
      <div class="mb-4">
        <button
          @click="showQRCode"
          class="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
            ></path>
          </svg>
          <span class="text-sm font-medium">Afficher le QR code</span>
        </button>
      </div>
      <div class="flex items-center justify-end w-full">
        <!-- Bouton conditionnel selon le statut de la partie -->
        <button
          v-if="game.status === 'waiting'"
          @click="launchGame"
          :disabled="isLaunching"
          :class="[
            'px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2',
            isLaunching
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white',
          ]"
        >
          <svg
            v-if="isLaunching"
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
          {{ isLaunching ? 'Lancement...' : 'Lancer la partie' }}
        </button>
        <div v-else-if="game.status === 'in_progress'" class="flex gap-2">
          <!-- Bouton Manche suivante / Terminer la partie -->
          <button
            v-if="shouldShowNextRoundButton"
            @click="nextRound"
            :disabled="isNextRoundLoading"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2',
              isNextRoundLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : isLastRound
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white',
            ]"
          >
            <svg
              v-if="isNextRoundLoading"
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              ></path>
            </svg>
            {{ getNextRoundButtonText }}
          </button>

          <!-- Bouton Arrêter la partie -->
          <button
            @click="stopGame"
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Arrêter la partie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socketService from '@/services/socketService'

export default {
  name: 'GameCard',
  props: {
    game: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLaunching: false,
      isNextRoundLoading: false,
    }
  },

  computed: {
    // Détermine si le bouton "Manche suivante" doit être affiché
    shouldShowNextRoundButton() {
      // Ne pas afficher si la partie est terminée
      if (this.game.advancement === 'game_ended') {
        return false
      }

      // En mode multijoueurs : afficher constamment
      if (this.game.gameMode === 'multi') {
        return true
      }

      // En mode solo : afficher seulement quand le round est terminé
      if (this.game.gameMode === 'solo') {
        return this.game.advancement === 'round_ended'
      }

      return false
    },

    // Détermine si on est à la dernière manche
    isLastRound() {
      return this.game.currentRound >= this.game.rounds
    },

    // Texte du bouton selon le contexte
    getNextRoundButtonText() {
      if (this.isNextRoundLoading) {
        return 'Chargement...'
      }

      if (this.isLastRound) {
        return 'Terminer la partie'
      }

      return 'Manche suivante'
    },
  },

  methods: {
    getDeviceType(device) {
      // Déterminer le type d'appareil basé sur son rôle dans la partie
      if (device.type === 'presentation') {
        return 'Appareil de présentation'
      } else if (device.type === 'response_input') {
        return "Appareil d'entrée des réponses"
      } else if (device.type === 'selection') {
        return 'Appareil de sélection des réponses'
      } else {
        return 'Appareil connecté'
      }
    },

    getPlayerScore(player) {
      // Calculer le score du joueur basé sur son tableau de scores
      if (!player.score || !Array.isArray(player.score)) {
        return '0/0'
      }

      const totalRounds = player.score.length
      const wonRounds = player.score.filter((score) => score === true).length

      return `${wonRounds}/${totalRounds}`
    },

    stopGame() {
      this.$emit('stop-game', this.game.id)
    },

    async launchGame() {
      try {
        console.log(`🚀 Lancement de la partie ${this.game.id}...`)

        // Désactiver le bouton pendant la requête
        this.isLaunching = true

        // Appel à l'API pour lancer la partie
        const response = await fetch(
          `https://human-or-ai.vizyondijital.fr/api/launchgame/${this.game.id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const result = await response.json()

        if (result.success) {
          console.log('✅ Partie lancée avec succès:', result.message)

          // Émettre un événement pour informer le parent de la mise à jour
          this.$emit('game-launched', this.game.id)

          // Optionnel : Afficher une notification de succès
          this.$emit('show-notification', {
            type: 'success',
            title: 'Partie lancée',
            message: 'La partie a été lancée avec succès !',
          })
        } else {
          console.error('❌ Erreur lors du lancement:', result.error)
          throw new Error(result.message || 'Erreur lors du lancement de la partie')
        }
      } catch (error) {
        console.error('❌ Erreur lors du lancement de la partie:', error)

        // Émettre un événement pour informer le parent de l'erreur
        this.$emit('show-notification', {
          type: 'error',
          title: 'Erreur de lancement',
          message: error.message || 'Erreur lors du lancement de la partie',
        })
      } finally {
        // Réactiver le bouton
        this.isLaunching = false
      }
    },

    removeDevice(device, deviceType) {
      // Émettre un événement pour informer le parent de la suppression
      this.$emit('remove-device', {
        gameId: this.game.id,
        device: device,
        deviceType: deviceType,
      })
    },

    removePlayer(player) {
      // Émettre un événement pour informer le parent de la suppression du joueur
      this.$emit('remove-device', {
        gameId: this.game.id,
        device: player,
        deviceType: 'player',
      })
    },

    nextRound() {
      console.log(`▶️ Demande de manche suivante pour la partie ${this.game.id}`)

      // Désactiver le bouton pendant la requête
      this.isNextRoundLoading = true

      // Ne pas incrémenter currentRound si c'est le dernier round (pour terminer la partie)
      if (!this.isLastRound) {
        this.game.currentRound++
      }

      // Émettre l'événement socket pour déclencher le round suivant
      socketService.emit('next_round', {
        gameId: this.game.id,
      })

      // Écouter la réponse de succès
      const handleSuccess = (data) => {
        if (data.gameId === this.game.id) {
          console.log('✅ Round suivant déclenché avec succès:', data.message)

          // Réinitialiser l'état du round terminé
          this.game.advancement = null

          // Réactiver le bouton
          this.isNextRoundLoading = false

          // Nettoyer le listener
          socketService.off('control_center_next_round_success', handleSuccess)
        }
      }

      // Ajouter le listener
      socketService.on('control_center_next_round_success', handleSuccess)

      // Timeout de sécurité
      setTimeout(() => {
        if (this.isNextRoundLoading) {
          console.warn('⏰ Timeout lors du déclenchement du round suivant')
          this.isNextRoundLoading = false
          socketService.off('control_center_next_round_success', handleSuccess)
        }
      }, 5000)
    },

    showQRCode() {
      // Émettre un événement pour afficher le QR code sur l'écran de présentation
      this.$emit('show-qr-code', this.game.id)
    },
  },
}
</script>

<style scoped>
/* Animation de sortie pour les appareils supprimés */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-150 {
  transition-duration: 150ms;
}

/* États d'opacité */
.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}
/* Styles spécifiques au composant si nécessaire */
</style>
