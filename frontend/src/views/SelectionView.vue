<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-800 flex items-center justify-center"
  >
    <div class="text-center">
      <h1 class="text-8xl font-bold text-white tracking-wider">SelectionView</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectionView',

  mounted() {
    // Modifier le titre de la page
    document.title = 'Human or AI - Selection'
  },
}
</script>
