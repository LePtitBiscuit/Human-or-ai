import io from 'socket.io-client'

class DeviceSocketService {
  constructor() {
    this.socket = null
    this.baseURL = 'https://https://human-or-ai.vizyondijital.fr/api'
  }

  /**
   * Établir une connexion Socket.IO simple pour les devices
   */
  connect() {
    try {
      // Établir la connexion Socket.IO
      this.socket = io(this.baseURL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      })

      // Gérer la connexion
      this.socket.on('connect', () => {
        console.log('🔌 Device connecté au serveur Socket.IO')
      })

      // Gérer la déconnexion
      this.socket.on('disconnect', () => {
        console.log('🔌 Device déconnecté du serveur Socket.IO')
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
      this.socket.disconnect()
      this.socket = null
      console.log('🔌 Déconnexion Socket.IO du device effectuée')
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
export default new DeviceSocketService()
