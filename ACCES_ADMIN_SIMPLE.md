# 🔐 GUIDE D'ACCÈS ADMINISTRATEUR HOUSY

## 🚀 ÉTAPES SIMPLES POUR ACCÉDER À L'ADMIN

### 1. Démarrer l'application
```powershell
# MÉTHODE 1: Script automatique (recommandé)
.\demarrer-housy.bat

# MÉTHODE 2: PowerShell manuel
cd "c:\Users\TaherCh\Desktop\Essay\Housy\Housy"
# Arrêter les processus existants
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
# Démarrer le serveur
$env:PORT=5000; npm run dev
```

### 2. Accéder à l'application
- Ouvrir votre navigateur
- Aller à : **http://localhost:5173**

### 3. Se connecter en administrateur
**Identifiants admin :**
- **Username :** `admin`
- **Mot de passe :** `admin123`

**OU utilisez :**
- **Username :** `taher`
- **Mot de passe :** `admin123`

---

## 🎯 PAGES ADMIN EXCLUSIVES

Une fois connecté, vous verrez dans la **sidebar de gauche** ces nouvelles options :

### 🖥️ **Contrôle Système**
- Monitoring CPU, Mémoire, Disque
- Surveillance des services
- Logs système
- URL : `/admin/system-control`

### 🛡️ **Audit Sécurité**
- Événements de sécurité
- Conformité et incidents
- Rapports de sécurité
- URL : `/admin/security-audit`

### 💰 **Gestion Financière**
- Tableau de bord financier
- Budget et analyses
- Suivi des dépenses
- URL : `/admin/financial-management`

### 🎓 **Support Formation**
- Modules de formation
- Certifications
- Suivi des progrès
- URL : `/admin/training-support`

---

## ✅ TESTS À EFFECTUER

1. **Test de connexion :** Se connecter avec admin/admin123
2. **Test des pages :** Naviguer dans chaque page admin
3. **Test de déconnexion :** Bouton rouge "Déconnexion" en bas de sidebar
4. **Test de restriction :** Se connecter avec client1/client123 et vérifier qu'il n'y a pas d'accès admin

---

## 🔧 DÉPANNAGE

### Erreur "EADDRINUSE" (port déjà utilisé)
```powershell
# 1. Arrêter tous les processus Node.js
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Libérer les ports spécifiques
netstat -ano | findstr :9876
# Noter le PID et exécuter: taskkill /F /PID [PID_NUMBER]

# 3. Utiliser le script automatique
.\demarrer-housy.bat
```

Si le serveur ne démarre pas :
```powershell
# Tuer les processus Node.js existants
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Redémarrer avec port spécifique
$env:PORT=5000; npm run dev
```

Si problème de base de données :
```powershell
node test-database-connection.js
```

**🎉 BONNE NAVIGATION DANS HOUSY ADMIN !**
