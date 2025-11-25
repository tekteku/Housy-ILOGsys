

# EXEMPLE DE DESCRIPTION DE TRAVAIL DEMANDÉ - PROJET HOUSY TUNISIA

## 📋 CONTEXTE DU PROJET

**Projet :** Housy Tunisia - Plateforme d'estimation de coûts de construction par IA
**Client :** ILOGsys (Entreprise spécialisée en solutions technologiques)
**Durée :** 6 mois (Janvier 2025 - Juillet 2025)
**Équipe :** 1 développeur full-stack + encadrement technique ILOGsys

---

## 🎯 DESCRIPTION GÉNÉRALE DU TRAVAIL DEMANDÉ

### **Objectif Principal**
Développer une application web intelligente qui démocratise l'accès à l'estimation de coûts de construction en Tunisie grâce à l'intelligence artificielle multi-providers, permettant aux particuliers et professionnels d'obtenir des estimations précises sans expertise technique préalable.

### **Problématique à Résoudre**
Le secteur BTP tunisien souffre d'une asymétrie d'information critique entre professionnels et particuliers, avec :
- 78% des acteurs manquent d'outils fiables pour l'estimation
- Coûts d'estimation traditionnels prohibitifs (200-500€/mois)
- Absence de solutions intégrant IA + données locales certifiées
- Disparité géographique de 35% dans l'accès aux services

---

## 🛠️ TRAVAUX TECHNIQUES DEMANDÉS

### **Phase 1 : Collecte et Traitement des Données (6 semaines)**

#### **1.1 Web Scraping Automatisé**
- Développer des scripts de collecte automatisée depuis 7 sources certifiées tunisiennes
- Implémenter un système de scraping avec Playwright pour :
  - **525+ matériaux de construction** (prix, caractéristiques, fournisseurs)
  - **6,036+ propriétés immobilières** (prix/m², localisation, typologie)
- Gestion des erreurs et retry automatique
- Respect des politiques robots.txt et rate limiting

#### **1.2 Pipeline de Traitement CRISP-DM**
- Nettoyer et normaliser les données collectées (gestion des doublons, valeurs manquantes)
- Géocodifier les adresses tunisiennes (conversion en coordonnées GPS)
- Normaliser les prix en dinars tunisiens avec gestion de l'inflation
- Créer des fichiers JSON structurés avec métadonnées de validation
- Implémenter un système de contrôle qualité automatisé

#### **1.3 Structure de Données**
```
/server/data/
├── materiaux/
│   ├── catalogue_estimation_materiaux_complet.json
│   └── catalogue_brico_direct_detaille.json
├── immobilier/
│   └── proprietes_consolidees_resume.json
└── INDEX_GENERAL.json (métadonnées système)
```

---

### **Phase 2 : Architecture Backend & IA (8 semaines)**

#### **2.1 Stack Technique Backend**
- **Node.js 18+ avec TypeScript** pour le runtime serveur
- **Express.js** avec middleware de sécurité complet (Helmet, CORS, Rate Limiting)
- **PostgreSQL 15** avec **Drizzle ORM** pour la base de données
- **Redis 7** pour le cache haute performance
- **Docker** multi-stage pour la containerisation

#### **2.2 Intégration IA Multi-Providers**
Développer un système d'IA hybride avec 4 providers :

```typescript
// Services IA à implémenter
- OpenAI GPT-4 (précision maximale - API payante)
- Anthropic Claude (analyse contextuelle - API payante)  
- DeepSeek (rapport qualité/prix optimal - API payante)
- Ollama Local (sécurité admin - gratuit, local)
```

#### **2.3 Système de Permissions Granulaires**
- **Utilisateurs standards :** Accès OpenAI, Claude, DeepSeek
- **Administrateurs :** Accès complet + Ollama Local sécurisé
- Authentification JWT avec gestion des rôles (RBAC)
- Middleware de vérification des permissions par endpoint

#### **2.4 Services Backend Critiques**
- `estimation-ai-service.ts` - Service principal d'estimation IA
- `intelligent-estimation-service.ts` - Estimation enrichie avec données
- `data-service.ts` - Lecture et cache des données JSON
- `ai-service.ts` - Orchestration multi-providers
- `data-analysis-service.ts` - Analyses immobilières avancées

---

### **Phase 3 : Frontend & Interface Utilisateur (6 semaines)**

#### **3.1 Stack Frontend Moderne**
- **React 18** avec **TypeScript** pour l'interface
- **TailwindCSS** pour le design système responsive
- **Radix UI** pour les composants accessibles
- **Vite** pour le build optimisé
- **TanStack Query** pour la gestion d'état et cache

#### **3.2 Interfaces Principales à Développer**

**Interface d'Estimation Intelligente :**
- Chat conversationnel avec assistant IA spécialisé
- Enrichissement automatique avec données tunisiennes réelles
- Génération d'estimations détaillées en temps réel (<2s)
- Export PDF/Excel des devis générés

**Interface d'Authentification :**
- Inscription/connexion sécurisée avec validation
- Gestion des profils (particulier/professionnel/admin)
- Récupération de mot de passe automatisée
- Dashboard personnalisé selon les privilèges

**Interface Administrateur :**
- Tableau de bord analytique avec KPIs temps réel
- Gestion des utilisateurs et permissions
- Monitoring des performances IA et système
- Gestion du catalogue de matériaux

---

### **Phase 4 : Fonctionnalités Avancées (4 semaines)**

#### **4.1 Assistant IA Conversationnel**
- Chatbot spécialisé en construction tunisienne
- Enrichissement contextuel automatique avec données certifiées
- Historique des conversations et sessions utilisateur
- Détection automatique des demandes d'estimation
- Support français avec compréhension dialecte tunisien

#### **4.2 Analyses de Marché Immobilier**
- Visualisations graphiques des tendances prix/m²
- Comparaisons inter-villes (24 gouvernorats couverts)
- Prédictions de prix basées sur IA
- Rapports de marché personnalisés exportables

#### **4.3 Gestion des Projets**
- Création et suivi de projets de construction
- Gestion des phases (planification, exécution, finition)
- Collaboration multi-utilisateurs sur projets
- Génération de rapports d'avancement

---

## 📊 OBJECTIFS DE PERFORMANCE DEMANDÉS

### **Métriques Techniques Obligatoires**
- **Précision estimations :** >85% (objectif : 94%+)
- **Temps de réponse :** <2 secondes par estimation
- **Disponibilité système :** >99% uptime
- **Sécurité :** Conformité OWASP Top 10
- **Performance :** Support 750+ utilisateurs simultanés

### **Métriques Utilisateur**
- **Satisfaction utilisateur :** >90% (enquêtes post-utilisation)
- **Taux de complétion tâches :** >85%
- **Réduction temps estimation :** >60% vs méthodes traditionnelles
- **Accessibilité géographique :** Couverture 24 villes tunisiennes

---

## 🔐 EXIGENCES SÉCURITÉ & CONFORMITÉ

### **Sécurité Implémentée**
- Authentification JWT avec refresh tokens
- Chiffrement des données sensibles (AES-256)
- Protection API avec rate limiting (1000 req/15min)
- Headers sécurisés avec Helmet.js
- Tests de pénétration OWASP ZAP

### **Conformité Réglementaire**
- **RGPD :** Consentement utilisateur, droit à l'oubli
- **Réglementation tunisienne :** Protection des données locales
- **Audit trails :** Logs complets et traçabilité
- **Backup :** Sauvegarde automatique quotidienne

---

## 🚀 DÉPLOIEMENT & INFRASTRUCTURE

### **Architecture Docker**
- Dockerfile multi-stage optimisé production
- Docker Compose avec PostgreSQL + Redis + Application
- Health checks et monitoring automatique
- Variables d'environnement sécurisées

### **Environnements**
- **Development :** Hot-reload, debugging activé
- **Staging :** Tests automatisés, validation QA
- **Production :** Optimisations performance, sécurité renforcée

---

## 📈 LIVRABLES ATTENDUS

### **Livrables Techniques**
1. **Application web complète** avec toutes les fonctionnalités
2. **Base de données certifiée** (525+ matériaux, 6,036+ propriétés)
3. **Documentation technique** complète (APIs, architecture)
4. **Tests automatisés** (unitaires, intégration, performance)
5. **Scripts de déploiement** Docker production-ready

### **Livrables Méthodologiques**
1. **Rapport d'architecture** détaillé
2. **Guide d'utilisation** pour utilisateurs finaux
3. **Manuel d'administration** système
4. **Étude de performance** avec benchmarks
5. **Plan de maintenance** et évolutions futures

### **Livrables Académiques**
1. **Mémoire de fin d'études** (80-100 pages)
2. **Présentation soutenance** (7 minutes structurées)
3. **Code source commenté** avec standards de qualité
4. **Analyse d'impact socio-économique**

---

## 🎯 CRITÈRES DE RÉUSSITE

### **Validation Technique**
- ✅ Application fonctionnelle et déployée
- ✅ Performance conforme aux objectifs (précision >85%, temps <2s)
- ✅ Sécurité validée par audit externe
- ✅ Tests utilisateurs concluants (>90% satisfaction)

### **Validation Académique**
- ✅ Innovation technique démontrée
- ✅ Méthodologie CRISP-DM respectée
- ✅ Impact sociétal mesurable
- ✅ Qualité scientifique du rapport

### **Validation Commerciale**
- ✅ Solution prête pour commercialisation
- ✅ Retour sur investissement positif démontré
- ✅ Scalabilité prouvée pour expansion Maghreb
- ✅ Satisfaction client ILOGsys validée

---

## 📅 PLANNING INDICATIF

**Mois 1-1.5 :** Collecte et traitement des données
**Mois 2-3 :** Développement backend et intégration IA
**Mois 3.5-4.5 :** Développement frontend et interfaces
**Mois 5 :** Fonctionnalités avancées et optimisations
**Mois 5.5-6 :** Tests, déploiement et documentation finale

---

**Cette description de travail garantit une compréhension claire des attentes techniques, méthodologiques et académiques pour la réussite du projet Housy Tunisia chez ILOGsys.**
