// Service d'authentification côté client
class AuthService {
  constructor() {
    this.baseURL = 'https://human-or-ai.vizyondijital.fr/api'
    this.tokenKey = 'humanai_jwt_token'
  }

  /**
   * Vérifier si l'utilisateur est authentifié (a un token valide)
   */
  isAuthenticated() {
    const token = this.getToken()
    if (!token) {
      return false
    }

    // Vérifier si le token n'est pas expiré
    try {
      const payload = this.parseJWT(token)
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        this.removeToken() // Token expiré, le supprimer
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error)
      this.removeToken() // Token invalide, le supprimer
      return false
    }
  }

  /**
   * Récupérer le token depuis le localStorage
   */
  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Sauvegarder le token dans le localStorage
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token)
  }

  /**
   * Supprimer le token du localStorage
   */
  removeToken() {
    localStorage.removeItem(this.tokenKey)
  }

  /**
   * Parser un JWT pour récupérer le payload
   */
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error('Token JWT invalide')
    }
  }

  /**
   * Authentification avec un code PIN
   */
  async login(code) {
    try {
      const response = await fetch(`${this.baseURL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'authentification")
      }

      if (data.success && data.token) {
        this.setToken(data.token)
        return {
          success: true,
          token: data.token,
          message: data.message,
        }
      } else {
        throw new Error("Réponse d'authentification invalide")
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return {
        success: false,
        message: error.message || 'Erreur de connexion au serveur',
      }
    }
  }

  /**
   * Déconnexion (supprime le token)
   */
  logout() {
    this.removeToken()
  }

  /**
   * Vérifier la validité du token avec le serveur
   */
  async verifyTokenWithServer() {
    const token = this.getToken()
    if (!token) {
      return false
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.success === true
      } else {
        this.removeToken() // Token invalide côté serveur
        return false
      }
    } catch (error) {
      console.error('Erreur de vérification du token:', error)
      return false
    }
  }

  /**
   * Obtenir les informations de l'utilisateur depuis le token
   */
  getUserInfo() {
    const token = this.getToken()
    if (!token) {
      return null
    }

    try {
      return this.parseJWT(token)
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error)
      return null
    }
  }
}

// Exporter une instance singleton
export default new AuthService()
