<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex flex-col items-center px-8 pb-8 relative"
  >
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
            <!-- Champ de saisie de réponse -->
            <div class="w-full max-w-[40vw] mx-auto">
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
                  :disabled="!currentResponse.trim() || isSubmittingResponse"
                  :class="[
                    'px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform flex items-center gap-2',
                    currentResponse.trim() && !isSubmittingResponse
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
                  {{ isSubmittingResponse ? 'Envoi en cours...' : 'Envoyer ma réponse' }}
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
import deviceSocketService from '@/services/deviceSocketService'

export default {
  name: 'ResponseView',
  data() {
    return {
      currentResponse: '',
      currentQuestion: null,
      currentScore: {},
      isSubmittingResponse: false,
    }
  },
  methods: {
    async submitResponse() {
      if (!this.currentResponse.trim() || this.isSubmittingResponse) {
        return
      }

      try {
        this.isSubmittingResponse = true
        console.log('📤 Envoi de la réponse humaine:', this.currentResponse.trim())

        // Envoyer la réponse via Socket.IO
        deviceSocketService.emit('human_response', {
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

    setupSocketListeners() {
      // Écouter la génération de question
      deviceSocketService.on('question_generated', (data) => {
        this.currentQuestion = data.question
        console.log('❓ Question générée reçue:', data.question)
      })

      // Écouter la confirmation de réception de la réponse
      deviceSocketService.on('response_received', (data) => {
        console.log('✅ Réponse reçue par le serveur:', data.message)
        this.isSubmittingResponse = false
      })

      // Écouter les erreurs de réponse
      deviceSocketService.on('response_error', (error) => {
        console.error("❌ Erreur lors de l'envoi de la réponse:", error)
        this.isSubmittingResponse = false
      })
    },
  },
  mounted() {
    // Modifier le titre de la page
    document.title = 'Human or AI - Response'

    // Configurer les écouteurs Socket.IO
    this.setupSocketListeners()
  },
}
</script>
