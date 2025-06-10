# 🎯 GUIDE DE TEST - FONCTIONNALITÉS ADMINISTRATEUR HOUSY

## 🚀 DÉMARRAGE DE L'APPLICATION

### 1. Démarrer le serveur
```bash
cd "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"
npm run dev
```

### 2. Accéder à l'application
- **URL Frontend :** http://localhost:5173
- **URL Backend :** http://localhost:5000

---

## 🔐 COMPTES DE TEST

### 👑 COMPTES ADMINISTRATEUR
| Username | Mot de passe | Email | Rôle |
|----------|--------------|-------|------|
| `admin` | `admin123` | admin@housy.tn | admin |
| `taher` | `admin123` | taher@housy.tn | admin |
| `super_admin` | `admin123` | superadmin@housy.tn | super_admin |

### 👤 COMPTES CLIENT
| Username | Mot de passe | Email | Rôle |
|----------|--------------|-------|------|
| `client1` | `client123` | client1@housy.tn | client |
| `client2` | `client123` | client2@housy.tn | client |

---

## 🧪 TESTS À EFFECTUER

### ✅ 1. TEST DE CONNEXION
1. Accéder à http://localhost:5173
2. Se connecter avec `admin` / `admin123`
3. Vérifier que vous êtes bien dans l'interface admin

### ✅ 2. TEST DE DÉCONNEXION
1. Une fois connecté, rechercher le bouton rouge "Déconnexion" dans la sidebar
2. Cliquer dessus
3. Vérifier la redirection vers la page de connexion

### ✅ 3. TEST DES PAGES ADMIN EXCLUSIVES

#### 🖥️ Centre de Contrôle Système
- **URL :** http://localhost:5173/admin/system-control
- **Tests :**
  - ✅ Métriques système en temps réel (CPU, Mémoire, Disque)
  - ✅ Monitoring des services
  - ✅ Logs système avec alertes
  - ✅ Auto-actualisation (boutons 5s, 10s, 30s)
  - ✅ Graphiques de performance

#### 🛡️ Audit de Sécurité
- **URL :** http://localhost:5173/admin/security-audit
- **Tests :**
  - ✅ Événements de sécurité récents
  - ✅ Vérifications de conformité
  - ✅ Gestion des incidents
  - ✅ Trail d'audit
  - ✅ Rapports de sécurité

#### 💰 Gestion Financière
- **URL :** http://localhost:5173/admin/financial-management
- **Tests :**
  - ✅ Vue d'ensemble financière
  - ✅ Gestion budgétaire
  - ✅ Suivi des dépenses par catégorie
  - ✅ Alertes financières
  - ✅ Analyses de trésorerie

#### 🎓 Support Formation
- **URL :** http://localhost:5173/admin/training-support
- **Tests :**
  - ✅ Modules de formation
  - ✅ Suivi des progrès utilisateur
  - ✅ Système de certification
  - ✅ Création de cours
  - ✅ Analyses d'apprentissage

### ✅ 4. TEST DE RESTRICTION D'ACCÈS
1. Se connecter avec un compte client (`client1` / `client123`)
2. Essayer d'accéder aux URLs admin ci-dessus
3. Vérifier que l'accès est refusé ou redirigé

### ✅ 5. TEST DE NAVIGATION
1. En tant qu'admin, vérifier la sidebar
2. Confirmer la présence des nouveaux éléments :
   - 🖥️ Contrôle Système
   - 🛡️ Audit Sécurité  
   - 💰 Gestion Financière
   - 🎓 Support Formation
3. Tester la navigation entre les pages

---

## 🎯 FONCTIONNALITÉS À VALIDER

### ✅ Branding "Housy"
- [ ] Logo "H" au lieu de "HT"
- [ ] Titre "Housy" partout au lieu de "Housy"
- [ ] Emails "@housy.tn" au lieu de "@housytunisia.tn"

### ✅ Fonctionnalités Admin vs Client

#### 👑 ADMIN ONT ACCÈS À :
- ✅ Toutes les fonctionnalités client +
- ✅ Centre de Contrôle Système
- ✅ Audit de Sécurité
- ✅ Gestion Financière Avancée
- ✅ Support Formation
- ✅ Gestion des utilisateurs
- ✅ Configuration système

#### 👤 CLIENTS ONT ACCÈS À :
- ✅ Tableau de bord personnel
- ✅ Leurs projets uniquement
- ✅ Demandes et devis
- ✅ Documents et paiements
- ✅ Assistant IA de base

---

## 🐛 DÉPANNAGE

### Serveur ne démarre pas
```bash
# Vérifier les processus Node.js
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Tuer les processus si nécessaire
Stop-Process -Name "node" -Force

# Redémarrer
npm run dev
```

### Base de données non accessible
```bash
# Tester la connexion
node test-database-connection.js

# Recréer les utilisateurs
node setup-admin-access.js
```

### Ports occupés
- Frontend (5173) : `netstat -ano | findstr :5173`
- Backend (5000) : `netstat -ano | findstr :5000`

---

**🎉 BONNE CHANCE POUR LES TESTS ! L'APPLICATION HOUSY EST PRÊTE !**
