<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden"
  >
    <!-- Éléments décoratifs en arrière-plan -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Bulles flottantes -->
      <div
        class="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce"
        style="animation-delay: 0s"
      ></div>
      <div
        class="absolute top-40 right-32 w-6 h-6 bg-yellow-300/30 rounded-full animate-bounce"
        style="animation-delay: 1s"
      ></div>
      <div
        class="absolute bottom-32 left-32 w-5 h-5 bg-pink-300/30 rounded-full animate-bounce"
        style="animation-delay: 2s"
      ></div>
      <div
        class="absolute bottom-20 right-20 w-3 h-3 bg-green-300/30 rounded-full animate-bounce"
        style="animation-delay: 0.5s"
      ></div>

      <!-- Étoiles scintillantes -->
      <div
        class="absolute top-32 left-1/4 text-yellow-300/60 animate-pulse"
        style="animation-delay: 0.3s"
      >
        ⭐
      </div>
      <div
        class="absolute top-48 right-1/4 text-yellow-300/60 animate-pulse"
        style="animation-delay: 1.2s"
      >
        ⭐
      </div>
      <div
        class="absolute bottom-40 left-1/3 text-yellow-300/60 animate-pulse"
        style="animation-delay: 0.8s"
      >
        ⭐
      </div>
    </div>

    <div class="max-w-4xl mx-auto text-center relative z-10 px-4">
      <!-- Titre principal avec emoji -->
      <div class="mb-8 sm:mb-10 lg:mb-12">
        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider mb-4"
        >
          🎮 Humain ou IA ? 🧠
        </h1>
        <div class="text-lg sm:text-xl lg:text-2xl text-white/80 animate-pulse">
          🚀 Préparez-vous pour l'aventure ! 🚀
        </div>
      </div>

      <!-- Règles du jeu avec style amélioré -->
      <div
        class="bg-white/20 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 mb-6 sm:mb-8"
      >
        <h2
          class="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3"
        >
          📚 Règles du jeu 📚
        </h2>

        <div
          class="text-white/90 text-sm sm:text-base lg:text-lg space-y-4 sm:space-y-6 text-left max-w-3xl mx-auto"
        >
          <div class="bg-white/10 rounded-xl p-3 sm:p-4 border-l-4 border-blue-400">
            <p class="leading-relaxed flex items-start gap-2 sm:gap-3">
              <span class="text-lg sm:text-xl lg:text-2xl flex-shrink-0">🎯</span>
              <span>
                <span class="font-semibold">Le principe :</span> Une question générée par une IA est
                posée, quelqu'un y répond, puis c'est au tour de l'IA d'y répondre.
              </span>
            </p>
          </div>

          <div class="bg-white/10 rounded-xl p-3 sm:p-4 border-l-4 border-green-400">
            <p class="leading-relaxed flex items-start gap-2 sm:gap-3">
              <span class="text-lg sm:text-xl lg:text-2xl flex-shrink-0">🎲</span>
              <span>
                Ensuite, l'une des deux réponses est choisie au hasard et c'est aux joueurs de
                savoir si elle vient d'une IA ou d'un humain.
              </span>
            </p>
          </div>

          <div class="bg-white/10 rounded-xl p-3 sm:p-4 border-l-4 border-yellow-400">
            <p class="leading-relaxed flex items-start gap-2 sm:gap-3">
              <span class="text-lg sm:text-xl lg:text-2xl flex-shrink-0">🏆</span>
              <span>
                Les joueurs doivent tenter de faire le bon choix à chaque fois pour tenter de gagner
                des petits cadeaux.
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Message d'attente avec animation améliorée -->
      <div
        class="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-yellow-400/30"
      >
        <div class="space-y-3 sm:space-y-4">
          <!-- Emojis animés -->
          <div class="flex items-center justify-center space-x-2 sm:space-x-4">
            <div class="text-2xl sm:text-3xl lg:text-4xl animate-bounce">⏰</div>
            <div
              class="text-2xl sm:text-3xl lg:text-4xl animate-bounce"
              style="animation-delay: 0.2s"
            >
              🎯
            </div>
            <div
              class="text-2xl sm:text-3xl lg:text-4xl animate-bounce"
              style="animation-delay: 0.4s"
            >
              🎮
            </div>
          </div>

          <div class="flex items-center justify-center space-x-2 sm:space-x-3">
            <svg
              class="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span class="text-lg sm:text-xl lg:text-2xl font-semibold text-yellow-300">
              En attente du lancement de la partie...
            </span>
          </div>

          <div class="text-yellow-300/80 text-sm sm:text-base lg:text-lg animate-pulse">
            🎉 La partie va bientôt commencer ! 🎉
          </div>
        </div>
      </div>

      <!-- Indicateur de chargement décoratif -->
      <div class="mt-6 sm:mt-8 flex justify-center space-x-2">
        <div
          class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-bounce"
          style="animation-delay: 0s"
        ></div>
        <div
          class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-bounce"
          style="animation-delay: 0.1s"
        ></div>
        <div
          class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageAttente',
}
</script>

<style scoped>
/* Animations personnalisées */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Effet de brillance sur les bordures */
.border-l-4 {
  position: relative;
}

.border-l-4::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, currentColor, transparent);
  border-radius: 2px;
}
</style>
