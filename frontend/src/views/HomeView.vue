<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-6xl font-bold text-center text-gray-800 mb-12">Human vs AI - Frontend</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          to="/presentation"
          class="bg-blue-500 hover:bg-blue-600 text-white p-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-center group"
        >
          <h2 class="text-2xl font-bold mb-2">PRESENTATION</h2>
          <p class="opacity-80 group-hover:opacity-100">Page de présentation du jeu</p>
        </router-link>

        <router-link
          to="/control-center"
          class="bg-green-500 hover:bg-green-600 text-white p-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-center group"
        >
          <h2 class="text-2xl font-bold mb-2">CONTROL CENTER</h2>
          <p class="opacity-80 group-hover:opacity-100">Centre de contrôle du jeu</p>
        </router-link>

        <router-link
          to="/default-response"
          class="bg-purple-500 hover:bg-purple-600 text-white p-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-center group"
        >
          <h2 class="text-2xl font-bold mb-2">DEFAULT RESPONSE</h2>
          <p class="opacity-80 group-hover:opacity-100">Page de réponse par défaut</p>
        </router-link>

        <router-link
          to="/remote-devices/1"
          class="bg-orange-500 hover:bg-orange-600 text-white p-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-center group"
        >
          <h2 class="text-2xl font-bold mb-2">REMOTE DEVICES</h2>
          <p class="opacity-80 group-hover:opacity-100">
            Page de connexion des appareils distants (Partie 1)
          </p>
        </router-link>

        <div class="bg-gray-300 p-8 rounded-lg shadow-lg text-center">
          <h2 class="text-2xl font-bold mb-2 text-gray-600">PLUS DE PAGES</h2>
          <p class="text-gray-500">À venir...</p>
        </div>
      </div>

      <div class="text-center mt-12">
        <p class="text-gray-600 text-lg">Cliquez sur une page pour naviguer vers celle-ci</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',

  mounted() {
    // Modifier le titre de la page
    document.title = 'Human or AI - Home'
  },
}
</script>
