const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI("AIzaSyAdDFoC7VCE8kI8EoHJiEOrkZuphySdq_U");

// Historique des questions générées (limité à 20)
let questions = [];

// Prompts définis
const promptQuestion = `Génère une question courte, drôle ou sérieuse, adaptée à un jeu où un humain doit deviner si la réponse vient d'une IA ou d'un autre humain. Réponds uniquement par la question, sans explication ni commentaire.`;

const promptReponse = `
Réponds uniquement à la question posée, en imitant parfaitement le style, le ton, la structure et la longueur exacte de la réponse du joueur.

Règles obligatoires :
Ignore totalement la réponse du joueur. Tu ne dois jamais y réagir, ni l'approuver, ni la contredire, ni t'en inspirer.

Concentre-toi uniquement sur la question posée.

Imite exactement :

le ton (drôle, absurde, désinvolte, sérieux…)

le niveau de langage (familier, soutenu, relâché…)

les tics d'écriture (abréviations, absence de majuscules, expressions décalées…)

l'utilisation ou non de la ponctuation finale (si le joueur n'en met pas, tu n'en mets pas non plus).

La réponse doit avoir exactement le même nombre de mots que celle du joueur. Si ce n'est pas possible, tu peux te permettre un écart de ±1 mot maximum.

Utilise une syntaxe relâchée ou imparfaite si c'est ce que fait le joueur.

N'explique jamais. Ne donne pas ton avis. N'argumente pas.

Ne fais aucune phrase complète "propre" si le joueur ne le fait pas non plus.

Ta réponse doit etre différente de la réponse du joueur.
`;

/**
 * Charge le profil depuis le fichier profil.txt
 * @returns {string} Le contenu du profil ou un profil par défaut
 */
function chargerProfil() {
  try {
    const profilPath = path.join(__dirname, "../src/apitest/profil.txt");
    return fs.readFileSync(profilPath, "utf-8");
  } catch (error) {
    console.log("Fichier profil.txt non trouvé, utilisation du profil par défaut");
    return "Style détendu et naturel avec un peu d'humour.";
  }
}

/**
 * Génère une question unique avec Gemini
 * @returns {Promise<string>} La question générée
 */
async function generateQuestion() {
  try {
    // Construction du prompt en fonction de l'historique des questions
    let prompt = promptQuestion;

    if (questions.length === 1) {
      prompt += `\nLa question doit être différente de : "${questions[0]}"`;
    } else if (questions.length > 1) {
      prompt += "\nLa question doit être différente des questions suivantes : ";
      prompt += questions.map((q) => `"${q}"`).join(", ");
    }

    // Appel à l'API Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text().trim();

    // Ajoute la question à l'historique et gère la taille maximale
    questions.push(question);
    if (questions.length > 20) {
      questions.shift(); // Supprime le premier élément
    }

    return question;
  } catch (error) {
    console.error("Erreur lors de la génération de la question:", error);
    throw new Error("Impossible de générer une question");
  }
}

/**
 * Génère une réponse IA en imitant le style du joueur
 * @param {string} question - La question posée
 * @param {string} playerAnswer - La réponse du joueur à imiter
 * @param {string} customPrompt - Prompt personnalisé (optionnel)
 * @returns {Promise<string>} La réponse générée par l'IA
 */
async function generateAnswer(question, playerAnswer, customPrompt = promptReponse) {
  try {
    const fullPrompt = `${customPrompt}
Réponse joueur : ${playerAnswer}
Question: ${question}`;

    // Appel à l'API Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiAnswer = response.text().trim();

    return aiAnswer;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    throw new Error("Impossible de générer une réponse");
  }
}

/**
 * Génère une question avec l'ancien modèle Gemini (gemini-2.5-pro)
 * @returns {Promise<string>} La question générée
 */
async function generateQuestionWithGeminiPro() {
  try {
    // Construction du prompt en fonction de l'historique des questions
    let prompt = promptQuestion;

    if (questions.length === 1) {
      prompt += `\nLa question doit être différente de : "${questions[0]}"`;
    } else if (questions.length > 1) {
      prompt += "\nLa question doit être différente des questions suivantes : ";
      prompt += questions.map((q) => `"${q}"`).join(", ");
    }

    // Appel à l'API Gemini avec le modèle Pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const question = response.text().trim();

    // Ajoute la question à l'historique et gère la taille maximale
    questions.push(question);
    if (questions.length > 20) {
      questions.shift(); // Supprime le premier élément
    }

    return question;
  } catch (error) {
    console.error("Erreur lors de la génération de la question avec Gemini Pro:", error);
    throw new Error("Impossible de générer une question avec Gemini Pro");
  }
}

/**
 * Remet à zéro l'historique des questions
 */
function resetQuestionHistory() {
  questions = [];
}

/**
 * Récupère l'historique actuel des questions
 * @returns {Array<string>} L'historique des questions
 */
function getQuestionHistory() {
  return [...questions]; // Retourne une copie pour éviter les modifications externes
}

// Chargement du profil au démarrage
const profil = chargerProfil();

// Export des fonctions
module.exports = {
  generateQuestion,
  generateAnswer,
  generateQuestionWithGeminiPro,
  resetQuestionHistory,
  getQuestionHistory,
  profil,
  promptQuestion,
  promptReponse,
};
