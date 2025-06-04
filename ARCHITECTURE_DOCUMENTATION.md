# Housy Tunisia - Architecture & Codebase Documentation

## 📋 Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture générale](#architecture-générale)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Technologies utilisées](#technologies-utilisées)
5. [Backend (Serveur)](#backend-serveur)
6. [Frontend (Client)](#frontend-client)
7. [Base de données](#base-de-données)
8. [Services et intégrations](#services-et-intégrations)
9. [Configuration et déploiement](#configuration-et-déploiement)
10. [Sécurité](#sécurité)

---

## Vue d'ensemble du projet

**Housy Tunisia** est une application complète de gestion de projets de construction spécialement conçue pour le marché tunisien. Elle offre une plateforme intégrée pour la planification, le suivi, l'estimation des coûts et la gestion des matériaux de construction.

### Objectifs principaux:
- **Gestion de projets de construction** avec suivi en temps réel
- **Base de données complète des matériaux** de construction tunisiens
- **Estimation automatique des coûts** basée sur les prix du marché
- **Assistant IA** pour l'aide à la décision
- **Analyse des tendances du marché** des matériaux
- **Gestion financière** intégrée pour les projets

---

## Architecture générale

L'application suit une architecture **Full-Stack TypeScript** avec séparation claire entre frontend et backend:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│   Backend       │◄──►│   Base de       │
│   (React/Vite)  │    │   (Express)     │    │   Données       │
│                 │    │                 │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TailwindCSS   │    │   Drizzle ORM   │    │   Migrations    │
│   Radix UI      │    │   Services      │    │   Schema        │
│   Components    │    │   Routes        │    │   Relations     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Principes architecturaux:
- **Séparation des préoccupations** (MVC pattern)
- **Architecture en couches** (Présentation, Logique, Données)
- **API RESTful** pour la communication client-serveur
- **Typage strict TypeScript** pour la fiabilité
- **Validation de données** avec Zod
- **ORM moderne** avec Drizzle pour la base de données

---

## Structure des dossiers

```
HousyTunisia/
├── 📁 client/                    # Application frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/        # Composants réutilisables
│   │   ├── 📁 pages/            # Pages de l'application
│   │   ├── 📁 lib/              # Utilitaires et services
│   │   ├── 📁 hooks/            # Hooks React personnalisés
│   │   └── 📁 styles/           # Styles CSS
│   ├── index.html               # Point d'entrée HTML
│   └── vite.config.ts           # Configuration Vite
│
├── 📁 server/                    # Application backend Express
│   ├── 📁 routes/               # Routes API RESTful
│   ├── 📁 services/             # Services métier
│   ├── 📁 public/               # Assets statiques
│   ├── 📁 static/               # Fichiers statiques
│   ├── app.ts                   # Configuration Express
│   ├── index.ts                 # Point d'entrée serveur
│   └── storage.ts               # Configuration base de données
│
├── 📁 shared/                    # Code partagé client/serveur
│   ├── schema.ts                # Schémas de validation Zod
│   └── enhanced-schema.ts       # Schémas avancés
│
├── 📁 migrations/                # Migrations base de données
│   ├── 📁 meta/                 # Métadonnées Drizzle
│   └── *.sql                    # Scripts de migration
│
├── 📁 static/                    # Assets statiques publics
│   ├── 📁 images/               # Images du projet
│   ├── 📁 css/                  # Styles CSS
│   └── 📁 js/                   # Scripts JavaScript
│
├── 📁 scripts/                   # Scripts d'automatisation
├── 📁 docs/                     # Documentation technique
├── 📁 attached_assets/          # Ressources annexes
├── package.json                 # Dépendances et scripts npm
├── drizzle.config.ts           # Configuration Drizzle ORM
├── tsconfig.json               # Configuration TypeScript
└── README.md                   # Documentation principale
```

---

## Technologies utilisées

### 🎨 Frontend Stack
- **React 18** - Framework UI moderne avec hooks
- **TypeScript** - Typage statique pour JavaScript
- **Vite** - Build tool rapide et moderne
- **TailwindCSS** - Framework CSS utility-first
- **Radix UI** - Composants UI accessibles et primitifs
- **React Query (@tanstack/react-query)** - Gestion d'état serveur
- **React Hook Form** - Gestion des formulaires
- **Recharts** - Graphiques et visualisations
- **React Router** - Navigation côté client

### 🔧 Backend Stack
- **Node.js** - Runtime JavaScript serveur
- **Express.js** - Framework web minimaliste
- **TypeScript** - Typage statique
- **Drizzle ORM** - ORM TypeScript moderne
- **PostgreSQL** - Base de données relationnelle
- **Zod** - Validation et parsing de schémas
- **bcrypt** - Hachage de mots de passe
- **moment.js** - Manipulation de dates
- **helmet** - Sécurité HTTP
- **cors** - Gestion CORS
- **express-rate-limit** - Limitation de débit

### 🤖 Intelligence Artificielle
- **Anthropic Claude** - Assistant IA principal
- **Ollama** - Modèles IA locaux (optionnel)
- **LangChain** - Framework IA (potentiel)

### 🗄️ Base de données et ORM
- **PostgreSQL** - SGBD principal
- **Drizzle ORM** - Mapping objet-relationnel
- **Drizzle Kit** - Outils de migration

---

## Backend (Serveur)

### Structure du serveur

#### 📄 `server/index.ts` - Point d'entrée
```typescript
// Configuration du serveur principal
// Gestion de l'environnement (dev/prod)
// Démarrage du serveur Express
// Configuration du port et de l'écoute
```

#### ⚙️ `server/app.ts` - Configuration Express
```typescript
// Middleware de sécurité (helmet, cors)
// Limitation de débit (rate limiting)
// Configuration des routes API
// Gestion des erreurs globales
// Service de fichiers statiques
```

#### 🗃️ `server/storage.ts` - Configuration base de données
```typescript
// Configuration Drizzle ORM
// Connection PostgreSQL
// Export des tables et opérateurs
// Gestion des requêtes de base
```

### 🛣️ Routes API (`server/routes/`)

#### `auth.ts` - Authentification
```typescript
POST /api/auth/register    # Inscription utilisateur
POST /api/auth/login       # Connexion utilisateur
POST /api/auth/logout      # Déconnexion
GET  /api/auth/me          # Profil utilisateur
```

#### `projects.ts` - Gestion de projets
```typescript
GET    /api/projects           # Liste des projets
POST   /api/projects           # Créer un projet
GET    /api/projects/:id       # Détails d'un projet
PUT    /api/projects/:id       # Modifier un projet
DELETE /api/projects/:id       # Supprimer un projet
GET    /api/projects/:id/tasks # Tâches du projet
```

#### `materials.ts` - Matériaux de construction
```typescript
GET  /api/materials              # Liste des matériaux
GET  /api/materials/:id          # Détails d'un matériau
GET  /api/materials/categories   # Catégories
GET  /api/materials/suppliers    # Fournisseurs
GET  /api/materials/trends       # Tendances de prix
POST /api/materials/compare      # Comparaison de matériaux
```

#### `financial.ts` - Gestion financière
```typescript
GET  /api/financial/transactions        # Transactions
POST /api/financial/transactions        # Nouvelle transaction
GET  /api/financial/budgets             # Budgets projet
GET  /api/financial/reports/:projectId  # Rapport financier
GET  /api/financial/analytics/cash-flow # Analyse flux trésorerie
```

#### `estimation.ts` - Estimations de coût
```typescript
POST /api/estimation/calculate    # Calculer estimation
GET  /api/estimation/history      # Historique estimations
POST /api/estimation/save         # Sauvegarder estimation
```

#### `analytics.ts` - Analyses et rapports
```typescript
GET /api/analytics/dashboard      # Données tableau de bord
GET /api/analytics/projects       # Statistiques projets
GET /api/analytics/materials      # Analyses matériaux
```

#### `ai.ts` - Assistant IA
```typescript
POST /api/ai/chat                 # Chat avec l'assistant
POST /api/ai/project-analysis     # Analyse de projet IA
POST /api/ai/material-suggestions # Suggestions matériaux
```

### 🔧 Services (`server/services/`)

#### `project-service.ts`
```typescript
class ProjectService {
  getAllProjects()           # Récupérer tous les projets
  getProjectById(id)         # Projet par ID
  createProject(data)        # Créer nouveau projet
  updateProject(id, data)    # Mettre à jour projet
  deleteProject(id)          # Supprimer projet
  getProjectEstimation(id)   # Estimation coûts projet
  generateAIEstimation(id)   # Estimation IA
}
```

#### `material-service.ts`
```typescript
class MaterialService {
  getAllMaterials(filters)   # Liste filtrée matériaux
  getMaterialById(id)        # Matériau par ID
  getCategories()            # Catégories matériaux
  getSuppliers()             # Liste fournisseurs
  getPriceHistory(id)        # Historique prix
  getMarketAnalysis()        # Analyse marché
}
```

#### `ai-service.ts`
```typescript
class AIService {
  processChat(message)       # Traitement chat IA
  analyzeProject(data)       # Analyse projet IA
  suggestMaterials(context)  # Suggestions matériaux
  generateEstimation(params) # Estimation automatique
}
```

#### `image-service.ts`
```typescript
class ImageService {
  uploadImage(file)          # Upload image
  resizeImage(buffer)        # Redimensionnement
  generateThumbnail(image)   # Génération miniature
  deleteImage(path)          # Suppression image
}
```

---

## Frontend (Client)

### Structure du client

#### 📄 `client/src/main.tsx` - Point d'entrée React
```typescript
// Configuration React Router
// Providers globaux (React Query, Theme)
// Rendu de l'application principale
```

#### 🏗️ `client/src/App.tsx` - Composant principal
```typescript
// Layout principal de l'application
// Navigation et routage
// Gestion de l'état global
// Composants de layout
```

### 📦 Composants (`client/src/components/`)

#### `layout/` - Composants de structure
```typescript
Header.tsx           # En-tête navigation
Sidebar.tsx          # Barre latérale
Footer.tsx           # Pied de page
Layout.tsx           # Layout principal
Navigation.tsx       # Menu navigation
```

#### `ui/` - Composants UI de base (Radix UI)
```typescript
button.tsx           # Bouton personnalisé
input.tsx            # Champ de saisie
card.tsx             # Carte de contenu
dialog.tsx           # Boîte de dialogue
table.tsx            # Tableau de données
form.tsx             # Composants formulaire
```

#### `dashboard/` - Tableau de bord
```typescript
DashboardStats.tsx   # Statistiques principales
ProjectsChart.tsx    # Graphique projets
MaterialsChart.tsx   # Graphique matériaux
RecentActivity.tsx   # Activité récente
```

#### `projects/` - Gestion de projets
```typescript
ProjectList.tsx      # Liste des projets
ProjectCard.tsx      # Carte projet
ProjectForm.tsx      # Formulaire projet
ProjectDetails.tsx   # Détails projet
TaskManager.tsx      # Gestion des tâches
GanttChart.tsx       # Diagramme de Gantt
```

#### `materials/` - Matériaux
```typescript
MaterialList.tsx     # Liste matériaux
MaterialCard.tsx     # Carte matériau
MaterialSearch.tsx   # Recherche matériaux
PriceChart.tsx       # Graphique prix
MaterialCompare.tsx  # Comparaison matériaux
```

#### `chatbot/` - Assistant IA
```typescript
ChatInterface.tsx    # Interface chat
ChatMessage.tsx      # Message de chat
ChatInput.tsx        # Saisie message
AIAssistant.tsx      # Assistant IA
```

### 📄 Pages (`client/src/pages/`)
```typescript
Dashboard.tsx        # Tableau de bord principal
Projects.tsx         # Page gestion projets
Materials.tsx        # Page matériaux
Estimation.tsx       # Page estimation coûts
Financial.tsx        # Page gestion financière
Analytics.tsx        # Page analyses
Profile.tsx          # Profil utilisateur
Settings.tsx         # Paramètres application
```

### 🔗 Services (`client/src/lib/`)

#### `data-service.ts` - Services API
```typescript
class DataService {
  // Projets
  getProjects()
  createProject(data)
  updateProject(id, data)
  
  // Matériaux
  getMaterials(filters)
  getMaterialTrends(ids)
  compareMaterials(ids)
  
  // Estimation
  calculateEstimation(params)
  saveEstimation(data)
  
  // Finances
  getTransactions(filters)
  createTransaction(data)
  getBudgets(projectId)
}
```

#### `ai-service.ts` - Service IA
```typescript
class AIService {
  sendMessage(message)
  analyzeProject(projectData)
  getSuggestions(context)
  generateReport(data)
}
```

#### `utils.ts` - Utilitaires
```typescript
formatCurrency(value)     # Format monétaire
formatDate(date)          # Format date
formatPercentage(value)   # Format pourcentage
getDateDiff(start, end)   # Différence dates
cn(...classes)            # Fusion classes CSS
```

### 🎣 Hooks personnalisés (`client/src/hooks/`)
```typescript
use-mobile.tsx           # Détection mobile
use-notification.tsx     # Gestion notifications
use-toast.ts            # Messages toast
```

---

## Base de données

### Schéma de base de données (`shared/schema.ts`)

#### 👥 Table `users` - Utilisateurs
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
role            VARCHAR(50) DEFAULT 'user'
profileImageUrl VARCHAR(500)
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

#### 🏗️ Table `projects` - Projets
```sql
id            SERIAL PRIMARY KEY
name          VARCHAR(255) NOT NULL
description   TEXT
status        VARCHAR(50) DEFAULT 'active'
priority      VARCHAR(50) DEFAULT 'medium'
startDate     DATE
endDate       DATE
budget        DECIMAL(12,2)
location      VARCHAR(255)
createdBy     INTEGER REFERENCES users(id)
imageUrl      VARCHAR(500)
createdAt     TIMESTAMP DEFAULT NOW()
updatedAt     TIMESTAMP DEFAULT NOW()
```

#### 🧱 Table `materials` - Matériaux
```sql
id            SERIAL PRIMARY KEY
name          VARCHAR(255) NOT NULL
category      VARCHAR(100) NOT NULL
subcategory   VARCHAR(100)
unit          VARCHAR(50) NOT NULL
price         DECIMAL(10,2) NOT NULL
supplier      VARCHAR(255)
description   TEXT
imageUrl      VARCHAR(500)
availability  VARCHAR(50) DEFAULT 'available'
region        VARCHAR(100) DEFAULT 'tunisia'
createdAt     TIMESTAMP DEFAULT NOW()
updatedAt     TIMESTAMP DEFAULT NOW()
```

#### 💰 Table `financialTransactions` - Transactions
```sql
id              SERIAL PRIMARY KEY
projectId       INTEGER REFERENCES projects(id)
transactionType VARCHAR(50) NOT NULL  -- 'income' | 'expense'
amount          DECIMAL(12,2) NOT NULL
description     TEXT
category        VARCHAR(100)
transactionId   VARCHAR(255)
createdAt       TIMESTAMP DEFAULT NOW()
updatedAt       TIMESTAMP DEFAULT NOW()
```

#### 📊 Table `projectBudgets` - Budgets projet
```sql
id             SERIAL PRIMARY KEY
projectId      INTEGER REFERENCES projects(id)
categoryName   VARCHAR(255) NOT NULL
budgetedAmount DECIMAL(12,2) NOT NULL
spentAmount    DECIMAL(12,2) DEFAULT 0
createdAt      TIMESTAMP DEFAULT NOW()
updatedAt      TIMESTAMP DEFAULT NOW()
```

#### 📋 Table `estimations` - Estimations
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
projectType     VARCHAR(100) NOT NULL
area            DECIMAL(8,2) NOT NULL
floors          INTEGER NOT NULL
qualityLevel    VARCHAR(50) NOT NULL
wastageIncluded BOOLEAN DEFAULT FALSE
totalCost       DECIMAL(12,2) NOT NULL
createdBy       INTEGER REFERENCES users(id)
createdAt       TIMESTAMP DEFAULT NOW()
```

#### 📄 Table `projectDocuments` - Documents
```sql
id           SERIAL PRIMARY KEY
projectId    INTEGER REFERENCES projects(id)
name         VARCHAR(255) NOT NULL
type         VARCHAR(100) NOT NULL
fileUrl      VARCHAR(500) NOT NULL
fileSize     INTEGER
uploadedBy   INTEGER REFERENCES users(id)
createdAt    TIMESTAMP DEFAULT NOW()
```

### Relations principales:
- **Users → Projects** (1:N) - Un utilisateur peut créer plusieurs projets
- **Projects → Transactions** (1:N) - Un projet peut avoir plusieurs transactions
- **Projects → Budgets** (1:N) - Un projet peut avoir plusieurs budgets
- **Projects → Documents** (1:N) - Un projet peut avoir plusieurs documents
- **Users → Estimations** (1:N) - Un utilisateur peut créer plusieurs estimations

---

## Services et intégrations

### 🤖 Intelligence Artificielle

#### Configuration IA (`server/services/ai-service.ts`)
```typescript
// Support multi-modèles:
// - Anthropic Claude (principal)
// - Ollama (local, optionnel)
// - OpenAI (potentiel)

class AIService {
  // Chat conversationnel
  async processChat(message, context) {
    // Analyse du contexte projet
    // Génération de réponses pertinentes
    // Suggestions d'actions
  }
  
  // Analyse de projet
  async analyzeProject(projectData) {
    // Évaluation de faisabilité
    // Identification des risques
    // Recommandations d'optimisation
  }
  
  // Suggestions de matériaux
  async suggestMaterials(requirements) {
    // Analyse des besoins
    // Recommandations basées sur le marché tunisien
    // Optimisation coût/qualité
  }
}
```

### 📤 Service d'images (`server/services/image-service.ts`)
```typescript
class ImageService {
  // Upload et traitement d'images
  // Support formats: JPEG, PNG, WebP
  // Redimensionnement automatique
  // Génération de miniatures
  // Stockage optimisé
}
```

### 📊 Service de rapports (`server/services/report-service.ts`)
```typescript
class ReportService {
  // Génération rapports PDF
  // Analyses financières
  // Rapports de progression
  // Exports de données
}
```

---

## Configuration et déploiement

### Variables d'environnement (`.env`)
```bash
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/housy
POSTGRES_URL=neon_postgresql_url

# IA
ANTHROPIC_API_KEY=your_anthropic_key
OLLAMA_HOST=http://localhost:11434

# Application
NODE_ENV=development|production
PORT=9876

# Sécurité
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Scripts npm (`package.json`)
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "generate:static": "tsx scripts/setup-static-assets.ts"
  }
}
```

### Configuration Drizzle (`drizzle.config.ts`)
```typescript
export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
```

### Configuration Vite (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:9876"  // Proxy API vers backend
    }
  },
  build: {
    outDir: "dist/client"
  }
})
```

---

## Sécurité

### 🛡️ Mesures de sécurité backend

#### Middleware de sécurité (`server/app.ts`)
```typescript
// Helmet - Protection headers HTTP
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true
}))

// CORS - Contrôle d'accès origine
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// Rate Limiting - Limitation débit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                   // 100 requêtes max
})
```

#### Validation des données (`shared/schema.ts`)
```typescript
// Validation Zod pour toutes les entrées
export const insertUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8)
})

export const insertProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  budget: z.number().positive().optional()
})
```

#### Authentification (`server/routes/auth.ts`)
```typescript
// TODO: Implémentation JWT
// - Tokens d'accès sécurisés
// - Refresh tokens
// - Hachage bcrypt des mots de passe
// - Sessions sécurisées
```

### 🔒 Sécurité frontend

#### Protection XSS
```typescript
// Échappement automatique des données
// Validation côté client
// Sanitisation des entrées utilisateur
```

#### Gestion d'état sécurisée
```typescript
// Pas de stockage sensible en localStorage
// Chiffrement des données critiques
// Validation avant envoi au serveur
```

---

## Flux de données

### 🔄 Cycle de vie d'une requête

```
1. Frontend (React) → API Request
2. Backend (Express) → Route Handler
3. Middleware → Validation (Zod)
4. Service Layer → Business Logic
5. Database (PostgreSQL) → Data Query
6. ORM (Drizzle) → Query Building
7. Response → JSON Formatting
8. Frontend → State Update (React Query)
9. UI → Component Re-render
```

### 📡 Gestion d'état

#### Frontend state management
```typescript
// React Query pour cache serveur
// useState pour état local composant
// useContext pour état global partagé
// React Hook Form pour formulaires
```

#### Backend state management
```typescript
// Stateless API (RESTful)
// Sessions utilisateur (à implémenter)
// Cache Redis (potentiel)
// Database comme source de vérité
```

---

## Performance et optimisation

### ⚡ Optimisations frontend
- **Code splitting** avec React.lazy()
- **Tree shaking** avec Vite
- **Images optimisées** avec compression
- **Cache navigation** avec React Query
- **Bundle analysis** pour taille optimale

### 🚀 Optimisations backend
- **Connection pooling** PostgreSQL
- **Query optimization** avec Drizzle
- **Compression gzip** des réponses
- **Rate limiting** pour protection
- **Static file serving** optimisé

### 📊 Monitoring (à implémenter)
- **Logs structurés** avec Winston
- **Métriques performance** avec Prometheus
- **Health checks** pour monitoring
- **Error tracking** avec Sentry

---

## Tests (à développer)

### 🧪 Tests frontend
```typescript
// Tests unitaires avec Vitest
// Tests composants avec React Testing Library
// Tests e2e avec Playwright
// Tests visuels avec Chromatic
```

### 🔬 Tests backend
```typescript
// Tests unitaires avec Jest
// Tests intégration avec Supertest
// Tests base de données avec test containers
// Tests API avec Postman/Newman
```

---

## Documentation et maintenance

### 📚 Documentation existante
- `README.md` - Documentation principale
- `ARCHITECTURE_DOCUMENTATION.md` - Ce document
- `docs/` - Documentation technique spécialisée
- Code commenté en français

### 🔧 Maintenance et évolution
- **Migration database** avec Drizzle Kit
- **Versioning** avec Git
- **CI/CD** pipeline (à implémenter)
- **Backup** base de données régulier

---

## Conclusion

**Housy Tunisia** est une application moderne et complète utilisant les meilleures pratiques du développement web. L'architecture modulaire, le typage strict TypeScript, et l'intégration d'IA en font une solution robuste pour la gestion de projets de construction en Tunisie.

### Points forts:
✅ **Architecture moderne** (React + Express + PostgreSQL)  
✅ **Typage complet** TypeScript sur toute la stack  
✅ **ORM moderne** avec Drizzle pour type-safety  
✅ **UI/UX moderne** avec TailwindCSS et Radix UI  
✅ **Intelligence artificielle** intégrée  
✅ **Sécurité** avec validation et protection  
✅ **Performance** optimisée  

### Évolutions futures:
🔄 **Authentification JWT** complète  
🔄 **Tests automatisés** complets  
🔄 **Déploiement cloud** (Vercel/Railway)  
🔄 **Mobile app** React Native  
🔄 **PWA** pour utilisation offline  
🔄 **Analytics** avancées  

---

*Documentation générée le 28 mai 2025*  
*Version de l'application: 1.0.0*  
*Dernière mise à jour du code: TypeScript errors resolved*
