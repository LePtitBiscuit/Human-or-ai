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

      <!-- Éléments tech flottants -->
      <div
        class="absolute top-1/4 left-10 text-blue-300/40 text-4xl animate-float"
        style="animation-delay: 0.5s"
      >
        🤖
      </div>
      <div
        class="absolute top-3/4 right-10 text-orange-300/40 text-4xl animate-float"
        style="animation-delay: 1.5s"
      >
        👤
      </div>
    </div>

    <div class="max-w-5xl mx-auto text-center relative z-10 px-4">
      <!-- Logo/Icône principal -->
      <div class="mb-8 sm:mb-10 lg:mb-12">
        <div class="text-6xl sm:text-7xl lg:text-8xl mb-6 animate-pulse">🎯</div>

        <!-- Titre principal avec effet dramatique -->
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider mb-6 animate-fade-in"
        >
          <span class="text-blue-300">Humain</span>
          <span class="text-white mx-2 sm:mx-4">ou</span>
          <span class="text-purple-300">IA</span>
          <span class="text-white">?</span>
        </h1>

        <!-- Sous-titre accrocheur -->
        <div class="text-xl sm:text-2xl lg:text-3xl text-white/90 font-medium mb-8">
          <div class="animate-pulse">🧠 Le défi ultime de l'intelligence 🤖</div>
        </div>
      </div>

      <!-- Présentation du concept -->
      <div
        class="bg-white/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/20 mb-8 sm:mb-10"
      >
        <h2
          class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 flex items-center justify-center gap-3"
        >
          🎮 Le Concept 🎮
        </h2>

        <div class="text-white/90 text-lg sm:text-xl lg:text-2xl space-y-6 sm:space-y-8">
          <div class="flex items-center justify-center space-x-4 sm:space-x-8">
            <div class="text-center">
              <div class="text-4xl sm:text-5xl lg:text-6xl mb-2 animate-bounce">🤖</div>
              <div class="text-sm sm:text-base lg:text-lg font-semibold">
                Intelligence<br />Artificielle
              </div>
            </div>

            <div class="text-3xl sm:text-4xl lg:text-5xl text-yellow-300 animate-pulse">⚡</div>

            <div class="text-center">
              <div
                class="text-4xl sm:text-5xl lg:text-6xl mb-2 animate-bounce"
                style="animation-delay: 0.2s"
              >
                👤
              </div>
              <div class="text-sm sm:text-base lg:text-lg font-semibold">
                Intelligence<br />Humaine
              </div>
            </div>
          </div>

          <div class="bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <p class="leading-relaxed text-base sm:text-lg lg:text-xl">
              <span class="font-bold text-yellow-300">Saurez-vous faire la différence ?</span><br />
              Testez votre capacité à distinguer les réponses générées par une IA de celles créées
              par un être humain !
            </p>
          </div>
        </div>
      </div>

      <!-- Call to action -->
      <div
        class="bg-gradient-to-r from-green-500/30 to-blue-500/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-white/30"
      >
        <div class="space-y-4 sm:space-y-6">
          <div class="flex items-center justify-center space-x-3 sm:space-x-4">
            <div class="text-3xl sm:text-4xl lg:text-5xl animate-bounce">🚀</div>
            <div
              class="text-3xl sm:text-4xl lg:text-5xl animate-bounce"
              style="animation-delay: 0.2s"
            >
              🎯
            </div>
            <div
              class="text-3xl sm:text-4xl lg:text-5xl animate-bounce"
              style="animation-delay: 0.4s"
            >
              🏆
            </div>
          </div>

          <div class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Prêt à relever le défi ?
          </div>

          <div class="text-white/80 text-base sm:text-lg lg:text-xl animate-pulse">
            ✨ Une expérience unique vous attend ! ✨
          </div>
        </div>
      </div>

      <!-- Indicateur de chargement décoratif -->
      <div class="mt-8 sm:mt-10 flex justify-center space-x-2 sm:space-x-3">
        <div
          class="w-3 h-3 sm:w-4 sm:h-4 bg-white/60 rounded-full animate-bounce"
          style="animation-delay: 0s"
        ></div>
        <div
          class="w-3 h-3 sm:w-4 sm:h-4 bg-white/60 rounded-full animate-bounce"
          style="animation-delay: 0.1s"
        ></div>
        <div
          class="w-3 h-3 sm:w-4 sm:h-4 bg-white/60 rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageDeGarde',
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

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 1.5s ease-out;
}

/* Effet de brillance sur le titre */
h1 {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* Effet hover sur les cartes */
.bg-white\/20:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
</style>
