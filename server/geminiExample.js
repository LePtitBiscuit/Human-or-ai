// Exemple d'utilisation du module geminiApi.js
const {
  generateQuestion,
  generateAnswer,
  generateQuestionWithGeminiPro,
  resetQuestionHistory,
  getQuestionHistory,
} = require('./geminiApi')

async function exempleUtilisation() {
  console.log("=== Exemple d'utilisation des fonctions Gemini API ===\n")

  try {
    // 1. Générer une question
    console.log("1. Génération d'une question...")
    const question = await generateQuestion()
    console.log(`Question générée: "${question}"\n`)

    // 2. Simuler une réponse de joueur
    const reponseJoueur = 'oui bien sûr, ça me paraît évident !'
    console.log(`Réponse du joueur: "${reponseJoueur}"\n`)

    // 3. Générer une réponse IA qui imite le style du joueur
    console.log("3. Génération d'une réponse IA...")
    const reponseIA = await generateAnswer(question, reponseJoueur)
    console.log(`Réponse IA: "${reponseIA}"\n`)

    // 4. Générer une autre question
    console.log("4. Génération d'une deuxième question...")
    const question2 = await generateQuestion()
    console.log(`Deuxième question: "${question2}"\n`)

    // 5. Afficher l'historique des questions
    console.log('5. Historique des questions générées:')
    const historique = getQuestionHistory()
    historique.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q}`)
    })
    console.log()

    // 6. Test avec Gemini Pro
    console.log('6. Test avec Gemini Pro...')
    const questionPro = await generateQuestionWithGeminiPro()
    console.log(`Question Gemini Pro: "${questionPro}"\n`)

    // 7. Réinitialiser l'historique
    console.log("7. Réinitialisation de l'historique...")
    resetQuestionHistory()
    console.log(`Historique après reset: ${getQuestionHistory().length} questions\n`)

    console.log('✅ Exemple terminé avec succès !')
  } catch (error) {
    console.error("❌ Erreur lors de l'exemple:", error.message)
  }
}

// Fonction pour tester les différents types de réponses
async function testDifferentsStyles() {
  console.log('\n=== Test de différents styles de réponses ===\n')

  const question = 'Quelle est ta couleur préférée ?'

  const reponsesTest = [
    "le bleu c'est trop beau",
    'Rouge.',
    "Franchement j'adore le vert mais bon...",
    'violet !!! 💜',
  ]

  for (let i = 0; i < reponsesTest.length; i++) {
    try {
      console.log(`Test ${i + 1}:`)
      console.log(`Question: "${question}"`)
      console.log(`Réponse joueur: "${reponsesTest[i]}"`)

      const reponseIA = await generateAnswer(question, reponsesTest[i])
      console.log(`Réponse IA: "${reponseIA}"`)
      console.log('---')
    } catch (error) {
      console.error(`Erreur test ${i + 1}:`, error.message)
    }
  }
}

// Exécuter l'exemple si le fichier est lancé directement
if (require.main === module) {
  exempleUtilisation()
    .then(() => testDifferentsStyles())
    .catch(console.error)
}

module.exports = {
  exempleUtilisation,
  testDifferentsStyles,
}
