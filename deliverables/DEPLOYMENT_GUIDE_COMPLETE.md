# 📋 Guide de Déploiement Complet - HousyTunisia

## 🏗️ Vue d'ensemble du Projet

**HousyTunisia** est une plateforme d'estimation de coûts de construction alimentée par l'IA, spécialement conçue pour le marché tunisien. Elle intègre des modèles de langage avancés avec des données de marché réelles pour fournir des estimations précises.

### 📊 Données Intégrées
- **525+ matériaux de construction** avec prix du marché tunisien
- **6,036+ propriétés immobilières** avec analyses régionales
- **Support multi-LLM** : OpenAI, Claude, DeepSeek, Ollama

---

## 🚀 Étapes de Déploiement

### 1. Préparation de l'Environnement

#### 📦 Prérequis
```bash
# Node.js (version 18+)
node --version

# npm ou yarn
npm --version

# Git
git --version

# PowerShell (pour Windows)
powershell --version
```

#### 🔧 Installation des Dépendances
```bash
# Cloner le projet
git clone https://github.com/votre-username/HousyTunisia.git
cd HousyTunisia

# Installer les dépendances
npm install
```

### 2. Configuration des Variables d'Environnement

#### 📝 Créer le fichier `.env`
```bash
cp .env.example .env
```

#### 🔑 Variables Essentielles
```env
# API Keys LLM
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_claude_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here

# Base de données
DATABASE_URL=postgresql://localhost:5432/housytunisia
REDIS_URL=redis://localhost:6379

# Configuration serveur
PORT=3000
NODE_ENV=production

# Sécurité
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

### 3. Intégration des Données JSON

#### 🔄 Utilisation du Script PowerShell
```powershell
# Exécuter le script d'intégration
.\integrate-json-data.ps1
```

#### 📁 Structure des Données
```
server/data/
├── materiaux/
│   └── catalogue_estimation_materiaux_complet.json
├── immobilier/
│   └── proprietes_consolidees_resume.json
└── INDEX_GENERAL.json
```

### 4. Configuration de la Base de Données

#### 🗄️ PostgreSQL Setup
```bash
# Créer la base de données
createdb housytunisia

# Exécuter les migrations
npm run db:migrate

# Peupler avec les données
npm run db:seed
```

### 5. Démarrage des Services

#### 🖥️ Mode Développement
```bash
npm run dev
```

#### 🏭 Mode Production
```bash
npm run build
npm start
```

---

## 🔧 Configuration VS Code

### ⚙️ Fonctionnalités Intégrées
- 🔧 Auto-formatage avec Prettier
- 🔍 Linting ESLint automatique
- 📝 IntelliSense TypeScript avancé
- 🎯 Tâches de build automatisées
- 🐛 Configuration de débogage

### 🎯 Tâches Disponibles (Ctrl+Shift+P > Tasks)
- `Start Development (Optimized)`
- `Build Production (Fast)`
- `Clean Project`
- `Ultimate Optimization`

---

## 🧪 Tests et Validation

### 🔍 Tests d'Intégration IA

#### 📊 Test de l'Estimateur IA
```bash
# Ouvrir dans le navigateur
start test-ai-estimator-integration.html
```

#### 📈 Validation du Système
```powershell
.\validate-final-clean.ps1
```

---

## 🌐 Déploiement en Production

### ☁️ Options de Déploiement

#### 🐳 Docker (Recommandé)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### 🚀 Vercel (Frontend)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ]
}
```

---

## 📊 Monitoring et Maintenance

### 📈 Métriques à Surveiller
- Temps de réponse des estimations IA
- Utilisation des APIs LLM
- Performance de la base de données
- Logs d'erreurs système

### 🔧 Scripts de Maintenance
```bash
# Nettoyage automatique
.\cleanup-project.ps1

# Optimisation complète
.\ultimate-optimize.ps1

# Validation système
.\validate-final-clean.ps1
```

---

## 🚨 Dépannage

### ❌ Problèmes Courants

#### 🔧 Erreurs de Démarrage
```bash
# Vérifier les ports
netstat -an | findstr :3000

# Nettoyer et redémarrer
npm run clean
npm install
npm run dev
```

#### 🗄️ Problèmes de Base de Données
```bash
# Vérifier la connexion
npm run db:check

# Réinitialiser si nécessaire
npm run db:reset
```

---

## ✅ Checklist de Déploiement

### 🎯 Avant la Mise en Production
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] APIs LLM testées
- [ ] Tests d'intégration passés
- [ ] SSL/TLS configuré
- [ ] Monitoring activé
- [ ] Sauvegardes configurées

### 🔒 Sécurité
- [ ] Clés API sécurisées
- [ ] Rate limiting configuré
- [ ] Validation des entrées
- [ ] CORS configuré
- [ ] Headers de sécurité

---

## 📞 Support

### 🛠️ Ressources d'Aide
- **Tests d'intégration** : `test-ai-estimator-integration.html`
- **Validation système** : `validate-final-clean.ps1`
- **Documentation API** : `/api/docs`

### 🔗 Liens Utiles
- [Guide d'intégration LLM-JSON](./GUIDE_LLM_JSON_INTEGRATION.md)
- [Mission accomplie](./MISSION_ACCOMPLISHED_JSON_LLM_INTEGRATION.md)
- [README complet](./README_FINAL_COMPLETE.md)

---

**🎉 HousyTunisia est maintenant prêt pour le déploiement avec une intégration IA-JSON complète !**
