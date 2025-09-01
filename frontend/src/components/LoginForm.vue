<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center justify-center px-8"
  >
    <!-- Titre principal -->
    <h1 class="text-white text-5xl font-bold mb-8 tracking-wider">Humain ou IA ?</h1>

    <!-- Container de login -->
    <div class="w-full max-w-md bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
      <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8">
        <!-- Titre du formulaire -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Authentification</h2>
          <p class="text-gray-600">Veuillez saisir votre code PIN</p>
        </div>

        <!-- Formulaire de login -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Champ code PIN -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Code PIN
            </label>
            <input
              id="code"
              v-model="code"
              type="password"
              maxlength="10"
              placeholder="Entrez votre code PIN"
              :disabled="isLoading"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest font-mono"
              autocomplete="off"
              required
            />
          </div>

          <!-- Messages d'erreur -->
          <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
          </div>

          <!-- Messages de succès -->
          <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p class="text-green-600 text-sm text-center">{{ successMessage }}</p>
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            :disabled="isLoading || !code.trim()"
            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connexion...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Informations supplémentaires -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Saisissez le code PIN fourni pour accéder au centre de contrôle
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'LoginForm',
  emits: ['login-success'],
  data() {
    return {
      code: '',
      isLoading: false,
      errorMessage: '',
      successMessage: '',
    }
  },
  methods: {
    async handleLogin() {
      if (!this.code.trim()) {
        this.errorMessage = 'Veuillez saisir un code PIN'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const result = await authService.login(this.code.trim())

        if (result.success) {
          this.successMessage = 'Authentification réussie !'

          // Émettre l'événement de succès vers le parent
          this.$emit('login-success')

          // Petite pause pour montrer le message de succès
          setTimeout(() => {
            // Le parent se chargera de la redirection
          }, 1000)
        } else {
          this.errorMessage = result.message || 'Code PIN incorrect'
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        this.errorMessage = 'Erreur de connexion au serveur'
      } finally {
        this.isLoading = false
      }
    },

    clearMessages() {
      this.errorMessage = ''
      this.successMessage = ''
    },
  },

  mounted() {
    // Focus automatique sur le champ de saisie
    this.$nextTick(() => {
      const codeInput = document.getElementById('code')
      if (codeInput) {
        codeInput.focus()
      }
    })
  },

  watch: {
    code() {
      // Effacer les messages quand l'utilisateur tape
      this.clearMessages()
    },
  },
}
</script>

<style scoped>
/* Animation pour le champ de saisie */
input:focus {
  transform: scale(1.02);
}

/* Animation pour les messages */
.slide-down-enter-active {
  transition: all 0.3s ease-out;
}

.slide-down-leave-active {
  transition: all 0.3s ease-in;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>
