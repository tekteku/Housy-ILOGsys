# 🎯 ACCÈS RAPIDE AUX FONCTIONNALITÉS ADMINISTRATEUR

## 🚀 ÉTAPES POUR TESTER L'ADMIN

### 1. Démarrer l'application
```powershell
# Dans PowerShell, exécuter :
cd "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"
.\start-housy.ps1
```

**OU** si PowerShell pose des problèmes :
```cmd
# Dans l'invite de commande :
cd "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"
npm run dev
```

### 2. Accéder à l'application
Ouvrir : **http://localhost:5173**

### 3. Se connecter en tant qu'administrateur
- **Username :** `admin`
- **Mot de passe :** `admin123`

---

## 🔐 COMPTES DISPONIBLES

| Type | Username | Mot de passe | Description |
|------|----------|--------------|-------------|
| 👑 Admin | `admin` | `admin123` | Administrateur principal |
| 👑 Admin | `taher` | `admin123` | Administrateur personnalisé |
| 🔒 Super Admin | `super_admin` | `admin123` | Super administrateur |
| 👤 Client | `client1` | `client123` | Client de test |
| 👤 Client | `client2` | `client123` | Client de test |

---

## 🎯 PAGES ADMIN EXCLUSIVES À TESTER

Une fois connecté en tant qu'admin, vous verrez dans la sidebar de gauche ces nouvelles options :

### 🖥️ **Centre de Contrôle Système**
- **Navigation :** Cliquer sur "Contrôle Système" dans la sidebar
- **URL directe :** http://localhost:5173/admin/system-control
- **Fonctionnalités :**
  - Monitoring CPU, Mémoire, Disque en temps réel
  - Surveillance des services
  - Logs système avec alertes
  - Auto-actualisation (5s, 10s, 30s)

### 🛡️ **Audit de Sécurité**
- **Navigation :** Cliquer sur "Audit Sécurité" dans la sidebar
- **URL directe :** http://localhost:5173/admin/security-audit
- **Fonctionnalités :**
  - Événements de sécurité récents
  - Vérifications de conformité
  - Gestion des incidents
  - Rapports de sécurité

### 💰 **Gestion Financière**
- **Navigation :** Cliquer sur "Gestion Financière" dans la sidebar
- **URL directe :** http://localhost:5173/admin/financial-management
- **Fonctionnalités :**
  - Vue d'ensemble financière complète
  - Gestion budgétaire avancée
  - Suivi des dépenses par catégorie
  - Analyses de trésorerie

### 🎓 **Support Formation**
- **Navigation :** Cliquer sur "Support Formation" dans la sidebar
- **URL directe :** http://localhost:5173/admin/training-support
- **Fonctionnalités :**
  - Gestion des modules de formation
  - Suivi des progrès utilisateur
  - Système de certification
  - Création de cours

---

## ✅ TESTS DE VALIDATION

### Test 1: Connexion Admin
1. ✅ Se connecter avec `admin` / `admin123`
2. ✅ Vérifier que la sidebar contient les 4 nouvelles options admin

### Test 2: Pages Admin Exclusives
1. ✅ Tester chaque page admin (système, sécurité, financier, formation)
2. ✅ Vérifier que les données s'affichent correctement
3. ✅ Tester les fonctionnalités interactives

### Test 3: Fonction de Déconnexion
1. ✅ Chercher le bouton rouge "Déconnexion" en bas de la sidebar
2. ✅ Cliquer dessus
3. ✅ Vérifier la redirection vers la page de connexion

### Test 4: Restriction Client
1. ✅ Se connecter avec `client1` / `client123`
2. ✅ Vérifier que les pages admin ne sont PAS visibles
3. ✅ Tenter d'accéder directement aux URLs admin (doit être bloqué)

### Test 5: Branding "Housy"
1. ✅ Vérifier que le logo affiche "H" (pas "HT")
2. ✅ Vérifier que le titre est "Housy" (pas "Housy")
3. ✅ Vérifier les emails @housy.tn

---

## 🆘 AIDE RAPIDE

### Problème de démarrage
```bash
# Vérifier les ports
netstat -ano | findstr :5173
netstat -ano | findstr :5000

# Tuer les processus si nécessaire
taskkill /F /PID [PID_NUMBER]
```

### Problème de base de données
```bash
# Tester la connexion
node test-database-connection.js

# Recréer les utilisateurs
node setup-admin-access.js
```

---

**🎉 L'APPLICATION HOUSY EST PRÊTE ! TESTEZ LES FONCTIONNALITÉS ADMIN EXCLUSIVES !**
