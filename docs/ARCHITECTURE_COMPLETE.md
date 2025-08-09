# Architecture Complète de Housy

## 1. Vue d'ensemble

Housy est une application full-stack moderne qui utilise une architecture en couches avec une séparation claire des responsabilités. L'application est entièrement écrite en TypeScript et suit les principes de conception modernes.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Backend       │◄──►│   Base de       │
│   (React/Vite)  │    │   (Express)     │    │   Données       │
│                 │    │                 │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Frontend (Client)

### Technologies principales
- **React 18** avec TypeScript
- **Vite** comme outil de build
- **TailwindCSS** pour le styling
- **Radix UI** pour les composants de base
- **TanStack Query** pour la gestion d'état serveur
- **React Hook Form** pour la gestion des formulaires
- **Recharts** pour les visualisations

### Structure des composants
```
client/src/
├── components/
│   ├── layout/          # Composants structurels
│   ├── ui/             # Composants de base
│   ├── dashboard/      # Composants tableau de bord
│   ├── projects/       # Gestion de projets
│   ├── materials/      # Gestion des matériaux
│   ├── chatbot/        # Interface IA
│   └── animations/     # Composants d'animation
├── pages/             # Pages de l'application
├── lib/              # Services et utilitaires
└── hooks/            # Hooks personnalisés
```

## 3. Backend (Serveur)

### Technologies principales
- **Node.js 18** avec TypeScript
- **Express.js** pour l'API REST
- **Drizzle ORM** pour l'accès base de données
- **Zod** pour la validation de données
- **JWT** pour l'authentification
- **Helmet** pour la sécurité HTTP
- **Rate Limiting** pour la protection DoS

### Services principaux
```
server/services/
├── ai-service.ts         # Intégration IA multimodèle
├── project-service.ts    # Gestion des projets
├── material-service.ts   # Gestion des matériaux
├── estimation-service.ts # Calculs et estimations
├── auth-service.ts      # Authentification
└── image-service.ts     # Gestion des images
```

### Routes API
```
server/routes/
├── auth.ts             # Authentification
├── projects.ts         # Gestion projets
├── materials.ts        # Matériaux
├── estimation.ts       # Estimations
├── financial.ts        # Gestion financière
├── analytics.ts        # Analyses
└── ai.ts              # Routes IA
```

## 4. Base de données

### PostgreSQL
- Base de données relationnelle principale
- Schémas fortement typés avec Drizzle ORM
- Migrations automatisées

### Redis
- Cache distribué pour les performances
- Stockage des sessions utilisateurs
- Cache des requêtes API fréquentes
- TTL (Time To Live) configuré pour l'expiration du cache
- Persistance activée pour la fiabilité
- Configuration en mode AOF (Append-Only File)

### Tables principales
```sql
users                  # Utilisateurs
projects              # Projets
materials             # Matériaux
materialPriceHistory  # Historique prix
estimations          # Estimations
tasks                # Tâches
resources            # Ressources
aiAnalysis           # Analyses IA
notifications        # Notifications
```

## 5. Intégration IA

### Modèles et services
- **Anthropic Claude** - Assistant IA principal
- **OpenAI** - Analyses avancées
- **DeepSeek** - Traitement spécialisé
- **Ollama** - Modèles locaux (optionnel)

### Fonctionnalités IA
- Analyse de projets
- Estimation automatique
- Suggestions de matériaux
- Assistant conversationnel
- Génération de rapports

## 6. Infrastructure et Déploiement

### Architecture Docker
```yaml
services:
  frontend:
    image: node:18-alpine
    # Build optimisé production React/Vite

  backend:
    image: node:18-alpine
    # API Node.js/Express

  postgres:
    image: postgres:15-alpine
    # Base de données principale

  redis:
    image: redis:7-alpine
    # Cache et sessions
```

### Sécurité
- **JWT** pour l'authentification
- **Bcrypt** pour le hachage
- **Helmet** pour les headers HTTP
- **CORS** configuré
- **Rate Limiting** anti-DDoS

### Performance
- Build multi-stage Docker
- Cache Redis
- Optimisations frontend (Vite)
- Lazy loading des composants
- Mise en cache des requêtes

## 7. Structure des dossiers

```
housy-tunisia/
├── client/                 # Application React
├── server/                 # API Node.js
├── shared/                 # Code partagé
├── migrations/             # Migrations DB
├── scripts/               # Scripts utilitaires
├── docker/                # Config Docker
└── docs/                  # Documentation
```

## 8. Flux de données

1. Frontend (React) → API Request
2. Backend (Express) → Route Handler
3. Middleware → Validation (Zod)
4. Service Layer → Business Logic
5. Database (PostgreSQL) → Data Query
6. ORM (Drizzle) → Query Building
7. Response → JSON Formatting
8. Frontend → State Update (React Query)
9. UI → Component Re-render
