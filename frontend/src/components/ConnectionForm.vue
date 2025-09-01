<template>
  <!-- Container principal -->
  <div class="w-full max-w-md">
    <!-- Titre -->
    <div class="text-center mb-8">
      <h1 class="text-white text-4xl font-bold tracking-wider mb-4">Humain ou IA ?</h1>
      <p class="text-white/80 text-lg">Rejoignez une partie</p>
    </div>

    <!-- Formulaire de connexion -->
    <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Champ nom de l'appareil -->
        <div>
          <label for="deviceName" class="block text-white font-medium mb-3 text-center">
            Nom de l'appareil
          </label>
          <input
            id="deviceName"
            v-model="deviceName"
            type="text"
            placeholder="Entrez le nom de votre appareil..."
            class="w-full px-4 py-3 bg-white/80 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
            autocomplete="off"
            required
          />
        </div>

        <!-- Champ ID de la partie -->
        <div>
          <label for="gameId" class="block text-white font-medium mb-3 text-center">
            ID de la partie (optionnel)
          </label>
          <input
            id="gameId"
            v-model="gameId"
            type="text"
            placeholder="Entrez l'ID de la partie..."
            class="w-full px-4 py-3 bg-white/80 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
            autocomplete="off"
          />
        </div>

        <!-- Bouton de connexion -->
        <button
          type="submit"
          :disabled="!deviceName.trim()"
          :class="[
            'w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform',
            deviceName.trim()
              ? 'bg-gradient-to-br from-blue-400 to-purple-800 hover:from-blue-500 hover:to-purple-900 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-white/30 text-white/50 border border-white/30 cursor-not-allowed',
          ]"
        >
          {{ getButtonText() }}
        </button>
      </form>

      <!-- Informations supplémentaires -->
      <div class="mt-6 text-center">
        <p class="text-white/60 text-sm">
          Le nom de l'appareil est obligatoire. L'ID de la partie est optionnel.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectionForm',
  data() {
    return {
      deviceName: '',
      gameId: '',
    }
  },
  methods: {
    handleSubmit() {
      // Émettre l'événement avec le nom de l'appareil et l'ID de la partie
      this.$emit('connect', {
        deviceName: this.deviceName.trim(),
        gameId: this.gameId.trim() || null,
      })
    },

    getButtonText() {
      if (!this.deviceName.trim()) {
        return "Veuillez entrer le nom de l'appareil"
      }

      if (this.gameId.trim()) {
        return 'Se connecter à la partie'
      } else {
        return "Enregistrer l'appareil"
      }
    },
  },
}
</script>

<style scoped>
/* Styles spécifiques au composant si nécessaire */
</style>
