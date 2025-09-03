import io from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.baseURL = 'https://human-or-ai.vizyondijital.fr/api'
  }

  /**
   * Établir une connexion Socket.IO avec authentification JWT
   */
  connect(token) {
    try {
      // Établir la connexion Socket.IO
      this.socket = io(this.baseURL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      })

      // Gérer la connexion
      this.socket.on('connect', () => {
        console.log('🔌 Connecté au serveur Socket.IO')

        // Authentifier la socket avec le JWT
        this.socket.emit('control_center_connect', { token })
      })

      // Gérer l'authentification réussie
      this.socket.on('control_center_connected', (data) => {
        console.log('🔐 Authentification Socket.IO réussie:', data)
      })

      // Gérer les erreurs d'authentification
      this.socket.on('control_center_error', (error) => {
        console.error("❌ Erreur d'authentification Socket.IO:", error)
        // Émettre un événement personnalisé pour gérer l'erreur côté composant
        this.socket.emit('auth_error', error)
      })

      // Gérer la déconnexion
      this.socket.on('disconnect', () => {
        console.log('🔌 Déconnecté du serveur Socket.IO')
      })

      return this.socket
    } catch (error) {
      console.error('Erreur lors de la connexion Socket.IO:', error)
      throw error
    }
  }

  /**
   * Déconnecter la socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.emit('control_center_disconnect')
      this.socket.disconnect()
      this.socket = null
      console.log('🔌 Déconnexion Socket.IO effectuée')
    }
  }

  /**
   * Obtenir l'instance de la socket
   */
  getSocket() {
    return this.socket
  }

  /**
   * Vérifier si la socket est connectée
   */
  isConnected() {
    return this.socket && this.socket.connected
  }

  /**
   * Émettre un événement
   */
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn("Socket non connectée, impossible d'émettre l'événement:", event)
    }
  }

  /**
   * Écouter un événement
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Arrêter d'écouter un événement
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

// Exporter une instance singleton
export default new SocketService()
