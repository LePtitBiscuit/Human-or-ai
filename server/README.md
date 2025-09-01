# Serveur Express.js - Human vs AI

Ce dossier contient tous les éléments nécessaires pour créer et déployer un serveur Express.js dans un conteneur Docker.

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)

### 1. Configuration

Copiez le fichier d'environnement d'exemple :

```bash
cp .env.example .env
```

Modifiez les variables d'environnement selon vos besoins.

### 2. Développement local

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Ou démarrer en mode production
npm start
```

### 3. Déploiement avec Docker

#### Option 1 : Docker simple

```bash
# Construire l'image
docker build -t humanvsai-server .

# Démarrer le conteneur
docker run -p 3000:3000 --env-file .env humanvsai-server
```

#### Option 2 : Docker Compose (recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 📁 Structure des fichiers

```
serveur/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances et scripts
├── Dockerfile             # Configuration Docker
├── docker-compose.yml     # Orchestration Docker
├── .dockerignore          # Fichiers ignorés par Docker
├── nginx.conf             # Configuration Nginx (reverse proxy)
├── .env.example           # Variables d'environnement d'exemple
└── README.md             # Cette documentation
```

## 🛠️ Configuration

### Variables d'environnement

- `PORT` : Port d'écoute du serveur (défaut: 3000)
- `NODE_ENV` : Environnement (development/production)
- `CORS_ORIGIN` : Origine autorisée pour CORS

### Routes disponibles

- `GET /health` : Vérification de l'état du serveur
- `GET /api/test` : Route de test de l'API

## 🔧 Développement

### Ajouter de nouvelles routes

Modifiez le fichier `server.js` pour ajouter vos routes personnalisées.

### Middleware disponibles

- **Helmet** : Sécurité HTTP
- **CORS** : Gestion des requêtes cross-origin
- **Morgan** : Logging des requêtes
- **Express.json** : Parsing JSON automatique

## 🐳 Docker

### Optimisations incluses

- Image Alpine légère
- Utilisateur non-root pour la sécurité
- Health check intégré
- Cache des dépendances optimisé
- Multi-stage build ready

### Commandes utiles

```bash
# Reconstruire l'image
docker-compose build

# Redémarrer uniquement le serveur
docker-compose restart app

# Voir les ressources utilisées
docker stats
```

## 🔍 Monitoring

Le serveur inclut :

- Health check sur `/health`
- Logging des requêtes
- Gestion d'erreurs centralisée
- Arrêt propre du serveur

## 📝 Notes

- Le serveur écoute sur `0.0.0.0` pour être accessible depuis Docker
- Les logs sont configurés pour la production
- CORS est configuré pour le développement local
- Nginx est optionnel mais recommandé pour la production
