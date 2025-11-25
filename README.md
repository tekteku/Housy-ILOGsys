# 🏠 Housy - Plateforme de Gestion de Construction en Tunisie

[![License](https://img.shields.io/badge/license-Tek-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)

**Housy** est une plateforme web moderne et intelligente qui révolutionne la gestion de projets de construction en Tunisie. Elle offre des estimations IA précises, une gestion complète de projets, et un suivi en temps réel pour les clients et entrepreneurs.

![Housy Platform](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=Housy+Platform)

## ✨ Caractéristiques Principales

### 🤖 Intelligence Artificielle
- **Estimation Automatique** : Utilise 4 modèles d'IA (OpenAI GPT-4, DeepSeek, Claude, Ollama)
- **Assistant Virtuel** : Chat en temps réel pour conseils personnalisés
- **Analyse Prédictive** : Estimation basée sur 6,000+ propriétés tunisiennes
- **Précision >85%** : Validation par experts du secteur

### 📊 Gestion de Projets
- **Tableau de Bord Interactif** : Vue d'ensemble complète de tous vos projets
- **Suivi en Temps Réel** : Monitoring des étapes et progression
- **Gestion Documentaire** : Upload et organisation des documents
- **Calendrier Intégré** : Planning et deadlines

### 💰 Estimation et Devis
- **Calculateur Gratuit** : Estimation sans inscription requise
- **Base de Données Matériaux** : 1,200+ références de matériaux
- **Prix Actualisés** : Mise à jour hebdomadaire des tarifs
- **Couverture Nationale** : Tous les 24 gouvernorats tunisiens

### 👥 Rôles Utilisateurs
- **Clients** : Créent et suivent leurs demandes de construction
- **Entrepreneurs** : Gèrent les projets et équipes
- **Travailleurs** : Accès mobile aux tâches assignées
- **Administrateurs** : Gestion complète de la plateforme

### 🔒 Sécurité et Performance
- **Authentification JWT** : Tokens sécurisés avec expiration
- **Redis Cache** : Performance optimale (<100ms)
- **Rate Limiting** : Protection contre les abus
- **Docker Ready** : Déploiement conteneurisé

## 🎨 Interface Utilisateur

> 📖 **Documentation Complète UI**: Consultez [UI_SHOWCASE.md](UI_SHOWCASE.md) et [UI_STRUCTURE_MAP.md](UI_STRUCTURE_MAP.md)

### Page d'Accueil
- Design moderne et responsive
- Animations fluides avec Framer Motion
- Témoignages clients authentiques
- Galerie de projets réalisés

### Dashboard Client
- Vue consolidée des projets
- Graphiques interactifs (Recharts)
- Notifications en temps réel
- Statistiques personnalisées

### Estimation Interactive
- Formulaire intuitif étape par étape
- Validation en temps réel
- Résultats instantanés (<5 secondes)
- Téléchargement PDF des estimations

### 📱 18+ Interfaces Documentées
Toutes les interfaces (Client, Admin, Public) sont documentées avec:
- Screenshots ASCII art
- Composants utilisés
- Fonctionnalités détaillées
- User flows et navigation

## 🚀 Technologies Utilisées

### Frontend
- **React 18.3** : Interface utilisateur moderne
- **TypeScript** : Typage statique robuste
- **Tailwind CSS** : Design system élégant
- **Framer Motion** : Animations fluides
- **React Query** : Gestion d'état et cache
- **Recharts** : Visualisations de données
- **Wouter** : Routing léger et performant

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web minimaliste
- **PostgreSQL** : Base de données relationnelle
- **Drizzle ORM** : ORM TypeScript moderne
- **Redis** : Cache et sessions
- **JWT** : Authentification sécurisée

### IA et Machine Learning
- **OpenAI GPT-4** : Modèle principal
- **Anthropic Claude** : Alternative premium
- **DeepSeek** : Modèle économique
- **Ollama (Qwen)** : Solution locale/offline
- **LangChain** : Orchestration IA

### DevOps et Outils
- **Docker** : Conteneurisation
- **Vite** : Build tool ultra-rapide
- **ESBuild** : Bundler performant
- **Git** : Contrôle de version

## 📦 Installation

### Prérequis
```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15.0
redis >= 7.0 (optionnel)
```

### Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/housy.git
cd housy
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb housy_db

# Pousser le schéma
npm run db:push
```

5. **Démarrer l'application**
```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:3000`

### Installation avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/housy_db
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Redis (optionnel)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=votre_mot_de_passe_redis

# JWT
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee

# API Keys (optionnelles)
OPENAI_API_KEY=sk-votre-cle-openai
ANTHROPIC_API_KEY=sk-ant-votre-cle-anthropic
DEEPSEEK_API_KEY=sk-votre-cle-deepseek

# Application
NODE_ENV=development
APP_PORT=3000
HOST=0.0.0.0
```

## 📚 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer en mode dev avec hot reload

# Production
npm run build            # Build pour production
npm start                # Démarrer en mode production

# Base de données
npm run db:push          # Pousser le schéma vers la DB

# Utilitaires
npm run check            # Vérification TypeScript
npm run generate:static  # Générer les assets statiques
```

## 🏗️ Architecture

```
housy/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilitaires frontend
│   └── index.html
├── server/              # Backend Express
│   ├── routes/          # Routes API
│   ├── services/        # Logique métier
│   ├── middleware/      # Middlewares Express
│   └── db.ts            # Configuration base de données
├── shared/              # Code partagé (types, schemas)
├── static/              # Assets statiques
└── docker-compose.yml   # Configuration Docker
```

## 🎯 Fonctionnalités Clés

### Pour les Clients
- ✅ Estimation gratuite sans inscription
- ✅ Création et suivi de demandes
- ✅ Chat en temps réel avec l'IA
- ✅ Gestion des documents
- ✅ Suivi des paiements
- ✅ Notifications personnalisées

### Pour les Entrepreneurs
- ✅ Dashboard de gestion complet
- ✅ Gestion multi-projets
- ✅ Attribution des tâches
- ✅ Facturation automatique
- ✅ Reporting et analytics
- ✅ Communication client intégrée

### Pour les Administrateurs
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Modération des projets
- ✅ Gestion des matériaux
- ✅ Analytics avancées
- ✅ Configuration système
- ✅ Logs et monitoring

## 📊 Données et Coverage

- **6,036+** propriétés dans la base de données
- **1,200+** références de matériaux
- **24** gouvernorats couverts
- **85%+** précision des estimations
- **<5s** temps de réponse moyen
- **<100ms** latence API avec cache

## 🔐 Sécurité

- **Authentification JWT** : Tokens sécurisés avec rotation
- **Bcrypt** : Hachage des mots de passe (12 rounds)
- **Helmet.js** : Protection des headers HTTP
- **CORS** : Configuration stricte cross-origin
- **Rate Limiting** : Protection contre les abus
- **Validation Zod** : Validation des données entrantes
- **Sanitization** : Protection XSS et injection SQL

## 🌐 Déploiement

### Déploiement sur Render/Railway

1. Créer un nouveau service Web
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement
4. Déployer automatiquement

### Déploiement sur VPS

```bash
# Sur le serveur
git clone https://github.com/votre-username/housy.git
cd housy
npm install
npm run build

# Utiliser PM2 pour la gestion de processus
npm install -g pm2
pm2 start dist/index.js --name housy
pm2 save
pm2 startup
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence **Tek**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **ILOGsys Team** - *Développement initial* - [ILOGsys](https://ilogsys.com)

## 🙏 Remerciements

- Communauté React et TypeScript
- OpenAI pour l'API GPT-4
- Tous les contributeurs du projet
- Les testeurs et utilisateurs beta

## 📞 Support

Pour toute question ou problème :
- 📧 Email: support@housy-tunisia.com
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/housy/issues)
- 💬 Discord: [Rejoindre notre communauté](https://discord.gg/housy)

---

<p align="center">
  Fait avec ❤️ en Tunisie 🇹🇳
</p>

<p align="center">
  <sub>Révolutionnons ensemble le secteur de la construction !</sub>
</p>
<img width="1354" height="687" alt="Image" src="https://github.com/user-attachments/assets/bc79c50a-1a22-4cf8-a605-b34fc42a1ff0" />

<img width="1332" height="683" alt="Image" src="https://github.com/user-attachments/assets/0c96e220-94be-4a83-9782-a2e9165cb107" />

<img width="1340" height="652" alt="Image" src="https://github.com/user-attachments/assets/7aa5dc2a-70a2-4b68-9d6c-438f9080475d" />

<img width="1360" height="673" alt="Image" src="https://github.com/user-attachments/assets/e1db8775-afdb-4b1b-9a03-7bcc40bfd820" />
