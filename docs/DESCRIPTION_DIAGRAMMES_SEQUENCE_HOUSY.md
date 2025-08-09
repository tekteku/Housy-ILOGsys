# DESCRIPTION DES DIAGRAMMES DE SÉQUENCE - APPLICATION HOUSY

## Vue d'ensemble

Les diagrammes de séquence décrivent les interactions temporelles entre les différents acteurs et objets du système Housy. Ils montrent comment les messages sont échangés dans le temps pour réaliser les cas d'usage principaux du système de gestion de projets de construction.

---

## 1. DIAGRAMME DE SÉQUENCE : WORKFLOW PRINCIPAL CLIENT

### **Séquence : "Demande Client → Devis → Projet Actif"**

**Acteurs :** Client, Système, Admin/Manager, Équipe Projet

**Objets :** ClientRequest, ProjectCategory, Quotation, ActiveProject, User, Notification

### Description du flux :

1. **Phase 1 : Création de la demande**
   - Client → Système : `submitRequest(requestData)`
   - Système → ClientRequest : `create(clientData, categoryId)`
   - ClientRequest → ProjectCategory : `getEstimate(area, qualityLevel)`
   - ProjectCategory → ClientRequest : `return estimatedCost`
   - ClientRequest → Notification : `createNotification("Nouvelle demande reçue")`
   - Notification → Admin : `sendNotification()`
   - Système → Client : `return requestNumber`

2. **Phase 2 : Traitement de la demande**
   - Admin → ClientRequest : `assignToUser(managerId)`
   - ClientRequest → User : `addAssignment(requestId)`
   - ClientRequest → Notification : `createNotification("Demande assignée")`
   - Manager → ClientRequest : `reviewRequest()`
   - Manager → ClientRequest : `updateStatus("reviewing")`

3. **Phase 3 : Génération du devis**
   - Manager → ClientRequest : `generateQuotation()`
   - ClientRequest → Quotation : `create(requestData)`
   - Quotation → Material : `getMaterialCosts()`
   - Quotation → ProjectCategory : `getLaborCosts()`
   - Quotation → Quotation : `calculateTotal()`
   - Manager → Quotation : `approve()`
   - Quotation → Client : `sendToClient()`
   - Quotation → Notification : `createNotification("Devis envoyé")`

4. **Phase 4 : Acceptation et conversion en projet**
   - Client → Quotation : `acceptQuotation()`
   - Quotation → ActiveProject : `createFromQuotation()`
   - ActiveProject → ProjectPhase : `initializePhases()`
   - ActiveProject → Payment : `setupPaymentSchedule()`
   - ActiveProject → Notification : `notifyTeam("Nouveau projet")`

**Messages clés :**
- `submitRequest()`, `assignToUser()`, `generateQuotation()`, `acceptQuotation()`, `createFromQuotation()`

---

## 2. DIAGRAMME DE SÉQUENCE : GESTION DES PROJETS ACTIFS

### **Séquence : "Exécution et Suivi de Projet"**

**Acteurs :** ProjectManager, TeamLead, TeamMember, Client, Système

**Objets :** ActiveProject, ProjectPhase, ProjectUpdate, Payment, Notification, User

### Description du flux :

1. **Phase 1 : Démarrage du projet**
   - ProjectManager → ActiveProject : `startProject()`
   - ActiveProject → ProjectPhase : `getFirstPhase()`
   - ProjectPhase → ProjectPhase : `startPhase()`
   - ProjectPhase → TeamMember : `assignTasks()`
   - TeamMember → TimeTracking : `startTimeTracking()`

2. **Phase 2 : Mise à jour du progrès**
   - TeamMember → ProjectUpdate : `createUpdate(progressData)`
   - ProjectUpdate → ProjectPhase : `updateProgress(percentage)`
   - ProjectPhase → ActiveProject : `recalculateProgress()`
   - ActiveProject → Notification : `checkMilestones()`
   - **[Condition]** Si milestone atteint :
     - ActiveProject → Client : `sendMilestoneNotification()`
     - ActiveProject → Payment : `triggerPayment()`

3. **Phase 3 : Gestion des phases**
   - TeamLead → ProjectPhase : `completePhase()`
   - ProjectPhase → QualityInspection : `requestInspection()`
   - QualityInspection → ProjectPhase : `approveCompletion()`
   - ProjectPhase → ProjectPhase : `getNextPhase()`
   - **[Boucle]** Répéter pour chaque phase

4. **Phase 4 : Finalisation du projet**
   - ProjectManager → ActiveProject : `completeProject()`
   - ActiveProject → Payment : `processFinalPayment()`
   - ActiveProject → Client : `deliverProject()`
   - ActiveProject → Notification : `notifyCompletion()`

**Messages clés :**
- `startProject()`, `updateProgress()`, `completePhase()`, `completeProject()`

---

## 3. DIAGRAMME DE SÉQUENCE : GESTION DES PAIEMENTS

### **Séquence : "Processus de Paiement Complet"**

**Acteurs :** Client, Admin, Système, Banque

**Objets :** Payment, ActiveProject, ProjectPhase, FinancialTransaction, Notification

### Description du flux :

1. **Phase 1 : Génération de la facture**
   - ActiveProject → Payment : `generatePayment(phaseId, type)`
   - Payment → Payment : `calculateAmount()`
   - Payment → Client : `sendInvoice()`
   - Payment → Notification : `scheduleReminder(dueDate)`

2. **Phase 2 : Traitement du paiement**
   - Client → Payment : `submitPayment(paymentData)`
   - Payment → Banque : `processTransaction()`
   - Banque → Payment : `return transactionResult`
   - **[Condition]** Si succès :
     - Payment → Payment : `markAsPaid()`
     - Payment → ActiveProject : `updateBalance()`
     - Payment → FinancialTransaction : `recordTransaction()`
   - **[Condition]** Si échec :
     - Payment → Client : `sendFailureNotification()`

3. **Phase 3 : Suivi des impayés**
   - **[Timer]** Système → Payment : `checkOverduePayments()`
   - Payment → Payment : `calculateLateFees()`
   - Payment → Client : `sendReminderNotification()`
   - Payment → Admin : `escalateOverduePayment()`

**Messages clés :**
- `generatePayment()`, `submitPayment()`, `processTransaction()`, `markAsPaid()`

---

## 4. DIAGRAMME DE SÉQUENCE : SYSTÈME DE NOTIFICATIONS

### **Séquence : "Gestion des Notifications Multi-Canal"**

**Acteurs :** Système, User, EmailService, SMSService, PushService

**Objets :** Notification, User, NotificationSettings

### Description du flux :

1. **Phase 1 : Création de la notification**
   - Système → Notification : `create(type, userId, message)`
   - Notification → User : `getUserPreferences()`
   - User → NotificationSettings : `getDeliveryMethods()`

2. **Phase 2 : Distribution multi-canal**
   - **[Condition]** Si email activé :
     - Notification → EmailService : `sendEmail(userEmail, content)`
   - **[Condition]** Si SMS activé :
     - Notification → SMSService : `sendSMS(userPhone, content)`
   - **[Condition]** Si push activé :
     - Notification → PushService : `sendPush(deviceToken, content)`

3. **Phase 3 : Suivi de livraison**
   - EmailService → Notification : `updateDeliveryStatus("email", "sent")`
   - SMSService → Notification : `updateDeliveryStatus("sms", "delivered")`
   - PushService → Notification : `updateDeliveryStatus("push", "read")`

4. **Phase 4 : Gestion des accusés de réception**
   - User → Notification : `markAsRead()`
   - Notification → Système : `updateReadStatus()`
   - **[Condition]** Si action requise :
     - User → Système : `executeAction(actionUrl)`

**Messages clés :**
- `create()`, `sendEmail()`, `sendSMS()`, `sendPush()`, `markAsRead()`

---

## 5. DIAGRAMME DE SÉQUENCE : GESTION DES MATÉRIAUX ET INVENTAIRE

### **Séquence : "Commande et Réception de Matériaux"**

**Acteurs :** ProjectManager, Supplier, InventoryManager, Système

**Objets :** Material, Inventory, PurchaseOrder, PurchaseOrderItem, Supplier

### Description du flux :

1. **Phase 1 : Évaluation des besoins**
   - ProjectManager → ActiveProject : `getMaterialNeeds(phaseId)`
   - ActiveProject → Inventory : `checkAvailability(materialList)`
   - Inventory → Material : `getCurrentStock()`
   - **[Condition]** Si stock insuffisant :
     - Inventory → PurchaseOrder : `createOrder()`

2. **Phase 2 : Processus de commande**
   - PurchaseOrder → Supplier : `getQuote(materialList)`
   - Supplier → PurchaseOrder : `return quote`
   - ProjectManager → PurchaseOrder : `approve()`
   - PurchaseOrder → Supplier : `sendOrder()`
   - Supplier → PurchaseOrder : `confirmOrder(deliveryDate)`

3. **Phase 3 : Livraison et réception**
   - Supplier → InventoryManager : `deliverMaterials(orderItems)`
   - InventoryManager → PurchaseOrderItem : `verifyDelivery()`
   - InventoryManager → Inventory : `updateStock(materialId, quantity)`
   - InventoryManager → PurchaseOrder : `confirmReceipt()`
   - PurchaseOrder → Supplier : `processPayment()`

**Messages clés :**
- `getMaterialNeeds()`, `checkAvailability()`, `createOrder()`, `confirmReceipt()`

---

## 6. DIAGRAMME DE SÉQUENCE : ANALYTICS ET REPORTING

### **Séquence : "Génération de Rapports et KPIs"**

**Acteurs :** Admin, Système, AnalyticsEngine

**Objets :** AdminStatistics, ActiveProject, Payment, ClientRequest, Quotation

### Description du flux :

1. **Phase 1 : Collecte des données**
   - Admin → AdminStatistics : `generateReport(period)`
   - AdminStatistics → ActiveProject : `getProjectData(period)`
   - AdminStatistics → Payment : `getPaymentData(period)`
   - AdminStatistics → ClientRequest : `getRequestData(period)`
   - AdminStatistics → Quotation : `getQuotationData(period)`

2. **Phase 2 : Calcul des KPIs**
   - AdminStatistics → AnalyticsEngine : `calculateConversionRate()`
   - AdminStatistics → AnalyticsEngine : `calculateRevenue()`
   - AdminStatistics → AnalyticsEngine : `calculateSatisfaction()`
   - AdminStatistics → AnalyticsEngine : `identifyTrends()`

3. **Phase 3 : Génération du rapport**
   - AdminStatistics → AdminStatistics : `compileReport()`
   - AdminStatistics → Admin : `return reportData`
   - Admin → Système : `exportReport(format)`

**Messages clés :**
- `generateReport()`, `calculateConversionRate()`, `identifyTrends()`, `exportReport()`

---

## 7. DIAGRAMME DE SÉQUENCE : GESTION DE LA SÉCURITÉ

### **Séquence : "Authentification et Autorisation"**

**Acteurs :** User, Système, AuthService, PermissionService

**Objets :** User, Session, Permission, Role

### Description du flux :

1. **Phase 1 : Authentification**
   - User → AuthService : `login(username, password)`
   - AuthService → User : `validateCredentials()`
   - User → AuthService : `return userInfo`
   - AuthService → Session : `createSession(userId)`
   - Session → User : `return sessionToken`

2. **Phase 2 : Vérification des permissions**
   - User → Système : `accessResource(resource, action)`
   - Système → PermissionService : `checkPermission(userId, resource, action)`
   - PermissionService → User : `getRole()`
   - PermissionService → Role : `getPermissions()`
   - Role → PermissionService : `return permissions`
   - PermissionService → Système : `return authorized/denied`

3. **Phase 3 : Audit de sécurité**
   - Système → ActivityLog : `logActivity(userId, action, resource)`
   - ActivityLog → SecurityAudit : `analyzeActivity()`
   - **[Condition]** Si activité suspecte :
     - SecurityAudit → Admin : `alertSuspiciousActivity()`

**Messages clés :**
- `login()`, `checkPermission()`, `getPermissions()`, `logActivity()`

---

## PATTERNS D'INTERACTION IDENTIFIÉS

### 1. **Request-Response Pattern**
- Interactions synchrones entre client et serveur
- Utilisé pour les opérations CRUD de base

### 2. **Publish-Subscribe Pattern**
- Système de notifications asynchrones
- Événements diffusés à plusieurs abonnés

### 3. **Chain of Responsibility Pattern**
- Workflow d'approbation des devis
- Escalade des paiements en retard

### 4. **Observer Pattern**
- Mise à jour automatique des statuts
- Notifications déclenchées par les changements d'état

### 5. **Command Pattern**
- Actions utilisateur encapsulées
- Possibilité d'annulation/restauration

---

## GESTION DES ERREURS ET EXCEPTIONS

### Scénarios d'exception dans les séquences :

1. **Échec de paiement**
   - `Payment → Client : sendFailureNotification()`
   - `Payment → Admin : escalatePaymentIssue()`

2. **Dépassement de délai**
   - `ProjectPhase → Manager : alertDelayRisk()`
   - `ActiveProject → Client : notifyDelay()`

3. **Erreur de validation**
   - `Quotation → Manager : returnValidationErrors()`
   - `ClientRequest → Client : requestAdditionalInfo()`

4. **Indisponibilité de ressource**
   - `Equipment → Manager : suggestAlternatives()`
   - `Material → Supplier : requestEmergencyDelivery()`

---

## CONDITIONS ET BOUCLES

### Conditions principales :
- **[If milestone reached]** → Déclencher paiement
- **[If payment overdue]** → Envoyer rappel
- **[If project delayed]** → Alerter équipe
- **[If quality check failed]** → Bloquer phase suivante

### Boucles principales :
- **[For each phase]** → Répéter cycle phase
- **[Daily batch]** → Vérifier échéances
- **[For each team member]** → Distribuer notifications
- **[Until completion]** → Surveiller progrès

---

Cette description des diagrammes de séquence fournit une base complète pour modéliser les interactions temporelles dans l'application Housy, en couvrant tous les workflows principaux et les cas d'exception.
