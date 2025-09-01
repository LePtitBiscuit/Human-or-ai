const jwt = require("jsonwebtoken");

// Clé secrète pour signer les JWT (à mettre dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || "votre_cle_secrete_ultra_securisee_pour_jwt_auth_97232";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Code d'authentification requis
const AUTH_CODE = "97232";

/**
 * Route d'authentification
 * POST /api/auth
 *
 * Body: { code: "97232" }
 *
 * Retourne un JWT si le code est correct
 */
const authenticate = (req, res) => {
  try {
    const { code } = req.body;

    // Vérification du code d'authentification
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Code d'authentification requis",
        message: "Veuillez fournir un code d'authentification",
      });
    }

    if (code !== AUTH_CODE) {
      return res.status(401).json({
        success: false,
        error: "Code d'authentification invalide",
        message: "Le code fourni n'est pas correct",
      });
    }

    // Génération du payload JWT
    const payload = {
      authenticated: true,
      timestamp: new Date().toISOString(),
      code: code,
      // Vous pouvez ajouter d'autres informations utilisateur ici
    };

    // Génération du JWT
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "humanvsai-server",
      subject: "authentication",
    });

    // Réponse avec le token
    res.status(200).json({
      success: true,
      message: "Authentification réussie",
      token: token,
      expiresIn: JWT_EXPIRES_IN,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
      message: "Une erreur est survenue lors de l'authentification",
    });
  }
};

/**
 * Middleware pour vérifier le JWT
 * Peut être utilisé pour protéger d'autres routes
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Token d'authentification requis",
        message: "Veuillez fournir un token d'authentification dans l'en-tête Authorization",
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ajouter les informations décodées à la requête
    req.user = decoded;
    req.authenticated = true;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expiré",
        message: "Votre session a expiré, veuillez vous reconnecter",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token invalide",
        message: "Le token fourni n'est pas valide",
      });
    }

    console.error("Erreur lors de la vérification du token:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur interne du serveur",
      message: "Une erreur est survenue lors de la vérification du token",
    });
  }
};

/**
 * Route pour vérifier la validité d'un token
 * GET /api/auth/verify
 */
const verifyTokenRoute = (req, res) => {
  // Si on arrive ici, c'est que le middleware verifyToken a validé le token
  res.status(200).json({
    success: true,
    message: "Token valide",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Route pour obtenir des informations sur l'authentification
 * GET /api/auth/info
 */
const getAuthInfo = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Informations d'authentification",
    authCodeRequired: true,
    jwtExpiresIn: JWT_EXPIRES_IN,
    endpoint: "/api/auth",
    method: "POST",
    bodyExample: {
      code: "XXXXX",
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  authenticate,
  verifyToken,
  verifyTokenRoute,
  getAuthInfo,
};
