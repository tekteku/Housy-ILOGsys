# DESCRIPTION DÉTAILLÉE DES ENTITÉS PRINCIPALES - DIAGRAMME DE CLASSE UML HOUSY

## Vue d'ensemble de l'architecture

L'application Housy est un système complet de gestion de projets de construction et d'immobilier structuré autour de plusieurs modules principaux : gestion des utilisateurs, workflow des demandes/devis, projets actifs, ressources, finances, et analyses. Le système suit une approche orientée objet avec des relations complexes entre les entités.

---

## ENTITÉS PRINCIPALES ET LEURS RELATIONS

### 1. **CLASSE `User` (Utilisateurs)**

**Attributs :**
- `id` : Integer (PK, auto-increment)
- `username` : String (unique, not null)
- `password` : String (not null, encrypted)
- `fullName` : String (not null)
- `email` : String (unique, not null)
- `role` : String (not null) [admin, manager, team_member, client]
- `avatar` : String (nullable, URL/path)
- `createdAt` : DateTime (auto-generated)

**Méthodes principales :**
- `authenticate(password: String): Boolean`
- `hasPermission(permission: String): Boolean`
- `getActiveProjects(): List<Project>`
- `getAssignedTasks(): List<Task>`

**Relations :**
- 1:N avec `Project` (createdBy)
- 1:N avec `Task` (assignedTo)
- 1:N avec `ClientRequest` (assignedTo, reviewedBy)
- 1:N avec `Quotation` (createdBy, approvedBy)
- 1:N avec `ActiveProject` (teamLead, projectManager)
- 1:N avec `Notification` (userId)
- 1:N avec `ActivityLog` (userId)
- 1:N avec `TimeTracking` (userId)

---

### 2. **CLASSE `ProjectCategory` (Catégories de Projets)**

**Attributs :**
- `id` : Integer (PK)
- `name` : String (unique, not null)
- `description` : String
- `basePrice` : Decimal (not null)
- `unit` : String (default: "m²")
- `complexity` : Enum [low, medium, high]
- `duration` : Integer (estimated days)
- `materials` : JSON (material breakdown percentages)
- `laborCost` : Decimal
- `projectType` : Enum [construction_neuve, renovation, extension, achat_cle_en_main, amenagement, transformation, rehabilitation_energetique]
- `tunisianSpecifics` : JSON (climate, regulations, materials)
- `isActive` : Boolean (default: true)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `calculateEstimate(area: Double, qualityLevel: String): Decimal`
- `getMaterialRequirements(area: Double): JSON`
- `isValidForRegion(region: String): Boolean`

**Relations :**
- 1:N avec `ClientRequest` (categoryId)

---

### 3. **CLASSE `ClientRequest` (Demandes Clients)**

**Attributs :**
- `id` : Integer (PK)
- `requestNumber` : String (unique, auto-generated)
- `clientName`, `clientEmail`, `clientPhone` : String (not null)
- `clientAddress` : String
- `categoryId` : Integer (FK vers ProjectCategory)
- `title`, `description` : String (not null)
- `location` : String (not null)
- `area` : Double (not null)
- `floors` : Integer (default: 1)
- `budget` : Decimal
- `desiredStartDate` : DateTime
- `priority` : Enum [low, medium, high, urgent]
- `status` : Enum [received, reviewing, quoted, accepted, rejected, expired]
- `urgency` : Enum [normal, urgent, emergency]
- `qualityLevel` : Enum [standard, premium, luxe]
- `specialRequirements` : Text
- `attachments` : JSON (photos, plans, documents)
- `source` : Enum [website, phone, referral, social_media]
- `assignedTo`, `reviewedBy` : Integer (FK vers User)
- `reviewDate` : DateTime
- `reviewNotes` : Text
- `estimatedCost` : Decimal
- `estimatedDuration` : Integer (days)
- `followUpDate`, `expiryDate` : DateTime
- `conversionRate` : Double (default: 0)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `assignToUser(userId: Integer): void`
- `updateStatus(newStatus: String): void`
- `calculateConversionRate(): Double`
- `isExpired(): Boolean`
- `generateQuotation(): Quotation`

**Relations :**
- N:1 avec `ProjectCategory` (categoryId)
- N:1 avec `User` (assignedTo, reviewedBy)
- 1:N avec `Quotation` (requestId)

---

### 4. **CLASSE `Quotation` (Devis)**

**Attributs :**
- `id` : Integer (PK)
- `quotationNumber` : String (unique, auto-generated)
- `requestId` : Integer (FK vers ClientRequest)
- `version` : Integer (default: 1)
- `title`, `description` : String
- `area` : Double (not null)
- `totalCost`, `laborCost`, `materialCost` : Decimal (not null)
- `equipmentCost`, `overheadCost` : Decimal (default: 0)
- `profitMargin` : Double (default: 15%)
- `discount` : Decimal (default: 0)
- `finalAmount` : Decimal (not null)
- `currency` : String (default: "TND")
- `validUntil` : DateTime (not null)
- `paymentTerms` : Text
- `deliveryTime` : Integer (days)
- `warrantyPeriod` : Integer (months, default: 12)
- `specialConditions` : Text
- `breakdown` : JSON (detailed cost breakdown)
- `materials` : JSON (materials list with quantities/prices)
- `phases` : JSON (project phases with timeline)
- `status` : Enum [draft, sent, viewed, accepted, rejected, expired, revised]
- `sentDate`, `viewedDate`, `acceptedDate`, `rejectedDate` : DateTime
- `rejectionReason`, `clientFeedback` : Text
- `isActive` : Boolean (default: true)
- `createdBy`, `approvedBy` : Integer (FK vers User)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `calculateTotal(): Decimal`
- `applyDiscount(amount: Decimal): void`
- `sendToClient(): void`
- `markAsAccepted(): ActiveProject`
- `createRevision(): Quotation`
- `isValid(): Boolean`

**Relations :**
- N:1 avec `ClientRequest` (requestId)
- N:1 avec `User` (createdBy, approvedBy)
- 1:1 avec `ActiveProject` (quotationId)

---

### 5. **CLASSE `ActiveProject` (Projets Actifs)**

**Attributs :**
- `id` : Integer (PK)
- `projectNumber` : String (unique, auto-generated)
- `quotationId` : Integer (FK vers Quotation)
- `originalProjectId` : Integer (FK vers Project, nullable)
- `name`, `description` : String
- `clientName`, `clientEmail`, `clientPhone` : String (not null)
- `location` : String (not null)
- `area` : Double (not null)
- `contractValue` : Decimal (not null)
- `paidAmount`, `remainingAmount` : Decimal
- `startDate`, `plannedEndDate` : DateTime (not null)
- `actualEndDate` : DateTime
- `status` : Enum [planning, in_progress, on_hold, completed, cancelled]
- `progress` : Double (0-100, default: 0)
- `currentPhase` : String
- `priority` : Enum [low, medium, high, urgent]
- `riskLevel` : Enum [low, medium, high, critical]
- `qualityScore`, `clientSatisfaction` : Double (default: 0)
- `teamLead`, `projectManager` : Integer (FK vers User)
- `teamMembers` : JSON (array of user IDs)
- `budget`, `timeline`, `risks`, `resources`, `documents` : JSON
- `lastUpdate`, `nextMilestone` : DateTime
- `contractSignedDate`, `warrantyEndDate` : DateTime
- `isActive` : Boolean (default: true)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `updateProgress(percentage: Double): void`
- `addTeamMember(userId: Integer): void`
- `calculateROI(): Double`
- `getCurrentPhase(): ProjectPhase`
- `isOnSchedule(): Boolean`
- `isOnBudget(): Boolean`
- `generateReport(): JSON`

**Relations :**
- 1:1 avec `Quotation` (quotationId)
- N:1 avec `Project` (originalProjectId)
- N:1 avec `User` (teamLead, projectManager)
- 1:N avec `ProjectPhase` (activeProjectId)
- 1:N avec `ProjectUpdate` (activeProjectId)
- 1:N avec `Payment` (activeProjectId)
- 1:N avec `EnhancedProjectDocument` (activeProjectId)

---

### 6. **CLASSE `ProjectPhase` (Phases de Projet)**

**Attributs :**
- `id` : Integer (PK)
- `activeProjectId` : Integer (FK vers ActiveProject)
- `phaseNumber` : Integer (not null)
- `name`, `description` : String
- `plannedStartDate`, `plannedEndDate` : DateTime (not null)
- `actualStartDate`, `actualEndDate` : DateTime
- `status` : Enum [not_started, in_progress, completed, delayed, cancelled]
- `progress` : Double (0-100, default: 0)
- `budget`, `actualCost` : Decimal
- `materials`, `laborRequired`, `equipment` : JSON
- `deliverables`, `dependencies`, `qualityChecks`, `risks` : JSON
- `notes` : Text
- `completionCertificate` : String
- `approvedBy` : Integer (FK vers User)
- `approvalDate` : DateTime
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `startPhase(): void`
- `completePhase(): void`
- `calculateVariance(): Decimal`
- `isDependencyMet(): Boolean`
- `generateDeliverables(): List<String>`

**Relations :**
- N:1 avec `ActiveProject` (activeProjectId)
- N:1 avec `User` (approvedBy)
- 1:N avec `ProjectUpdate` (phaseId)
- 1:N avec `Payment` (phaseId)

---

### 7. **CLASSE `Material` (Matériaux de Construction)**

**Attributs :**
- `id` : Integer (PK)
- `name` : String (not null)
- `category` : Enum [gros_oeuvre, second_oeuvre, finition]
- `unit` : String (kg, m2, m3, piece, etc.)
- `price` : Double (not null)
- `priceCurrency` : String (default: "TND")
- `supplier`, `brand` : String
- `description` : Text
- `lastUpdated` : DateTime (auto-updated)
- `createdAt` : DateTime

**Méthodes principales :**
- `updatePrice(newPrice: Double): void`
- `getPriceHistory(): List<MaterialPriceHistory>`
- `getAvailableSuppliers(): List<Supplier>`
- `calculateCostForQuantity(quantity: Double): Decimal`

**Relations :**
- 1:N avec `MaterialPriceHistory` (materialId)
- 1:N avec `Inventory` (materialId)
- 1:N avec `PurchaseOrderItem` (materialId)

---

### 8. **CLASSE `Supplier` (Fournisseurs)**

**Attributs :**
- `id` : Integer (PK)
- `companyId` : Integer (FK vers Company)
- `name` : String (not null)
- `specialization` : String (cement, steel, wood, electrical, etc.)
- `deliveryZones` : JSON (zones de livraison)
- `paymentTerms` : String
- `creditLimit` : Double
- `deliveryTime` : Integer (average days)
- `qualityRating`, `priceRating`, `serviceRating` : Double (default: 0)
- `isPreferred` : Boolean (default: false)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `calculateOverallRating(): Double`
- `canDeliverTo(location: String): Boolean`
- `getDeliveryEstimate(location: String): Integer`
- `getPriceList(): List<Material>`

**Relations :**
- N:1 avec `Company` (companyId)
- 1:N avec `Inventory` (supplierId)
- 1:N avec `PurchaseOrder` (supplierId)

---

### 9. **CLASSE `Equipment` (Équipements)**

**Attributs :**
- `id` : Integer (PK)
- `name`, `description` : String
- `equipmentType` : String (excavator, crane, mixer, etc.)
- `brand`, `model`, `serialNumber` : String
- `purchaseDate` : DateTime
- `purchasePrice`, `currentValue` : Decimal
- `hourlyRate`, `dailyRate` : Decimal
- `status` : Enum [available, in_use, maintenance, retired]
- `location` : String
- `owner` : Enum [company, rental, leased]
- `maintenanceSchedule` : JSON
- `operatingHours` : Double (default: 0)
- `fuelType`, `capacity` : String
- `specifications`, `attachments` : JSON
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `isAvailable(startDate: DateTime, endDate: DateTime): Boolean`
- `calculateDepreciation(): Decimal`
- `scheduleMaintenence(date: DateTime): void`
- `updateOperatingHours(hours: Double): void`

**Relations :**
- 1:N avec `EquipmentAssignment` (equipmentId)

---

### 10. **CLASSE `Payment` (Paiements)**

**Attributs :**
- `id` : Integer (PK)
- `paymentNumber` : String (unique, auto-generated)
- `activeProjectId` : Integer (FK vers ActiveProject)
- `phaseId` : Integer (FK vers ProjectPhase, nullable)
- `paymentType` : Enum [advance, progress, milestone, final, retention]
- `amount` : Decimal (not null)
- `currency` : String (default: "TND")
- `percentage` : Double (% of total contract)
- `description` : String
- `dueDate` : DateTime (not null)
- `paidDate` : DateTime
- `status` : Enum [pending, paid, overdue, cancelled, disputed]
- `paymentMethod` : Enum [cash, bank_transfer, check, card]
- `reference`, `invoiceNumber` : String
- `invoiceDate` : DateTime
- `invoicePath`, `receiptPath` : String (file paths)
- `bankAccount`, `transactionId` : String
- `fees`, `taxes` : Decimal (default: 0)
- `netAmount` : Decimal (not null)
- `clientConfirmation` : Boolean (default: false)
- `confirmationDate` : DateTime
- `notes` : Text
- `attachments` : JSON
- `overdueReason` : Text
- `followUpDate` : DateTime
- `reminderSent` : Boolean (default: false)
- `reminderDate` : DateTime
- `createdBy`, `approvedBy` : Integer (FK vers User)
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `processPayment(): void`
- `sendReminder(): void`
- `calculateLateFees(): Decimal`
- `isOverdue(): Boolean`
- `generateInvoice(): String`

**Relations :**
- N:1 avec `ActiveProject` (activeProjectId)
- N:1 avec `ProjectPhase` (phaseId)
- N:1 avec `User` (createdBy, approvedBy)

---

### 11. **CLASSE `Notification` (Notifications Avancées)**

**Attributs :**
- `id` : Integer (PK)
- `userId` : Integer (FK vers User, nullable)
- `userRole` : Enum [admin, manager, client, team_member]
- `type` : Enum [system, project, payment, deadline, alert, reminder, approval]
- `category` : Enum [urgent, important, info, warning, error]
- `title`, `message` : String (not null)
- `shortMessage` : String (for mobile)
- `actionRequired` : Boolean (default: false)
- `actionUrl`, `actionLabel` : String
- `entityType` : String (project, quotation, payment, etc.)
- `entityId` : Integer
- `entityName` : String
- `priority` : Enum [low, medium, high, critical]
- `isRead`, `isArchived` : Boolean (default: false)
- `readAt` : DateTime
- `scheduledFor`, `expiresAt` : DateTime
- `deliveryMethod`, `deliveryStatus` : JSON
- `metadata`, `tags` : JSON
- `parentNotificationId` : Integer (FK auto-référentielle)
- `batchId` : String (for grouping)
- `triggeredBy`, `acknowledgedBy` : Integer (FK vers User)
- `acknowledgedAt` : DateTime
- `createdAt`, `updatedAt` : DateTime

**Méthodes principales :**
- `markAsRead(): void`
- `archive(): void`
- `sendNotification(): void`
- `isExpired(): Boolean`
- `createFollowUp(): Notification`

**Relations :**
- N:1 avec `User` (userId, triggeredBy, acknowledgedBy)
- N:1 avec `Notification` (parentNotificationId, auto-référentielle)

---

### 12. **CLASSE `AdminStatistics` (Statistiques Admin/KPIs)**

**Attributs :**
- `id` : Integer (PK)
- `period` : Enum [daily, weekly, monthly, quarterly, yearly]
- `periodStart`, `periodEnd` : DateTime (not null)
- `totalRequests`, `newRequests` : Integer (default: 0)
- `quotationsSent`, `quotationsAccepted`, `quotationsRejected` : Integer
- `conversionRate` : Double (default: 0)
- `activeProjects`, `completedProjects`, `delayedProjects`, `cancelledProjects` : Integer
- `totalRevenue`, `pendingPayments`, `overduePayments` : Decimal
- `averageProjectValue` : Decimal
- `averageProjectDuration` : Double (days)
- `clientSatisfactionAvg`, `qualityScoreAvg` : Double
- `onTimeCompletionRate`, `budgetAccuracyRate` : Double
- `teamUtilizationRate` : Double
- `materialCostTrend`, `projectTypesBreakdown` : JSON
- `locationDistribution`, `seasonalTrends` : JSON
- `clientRetentionRate`, `referralRate` : Double
- `marketingROI`, `operationalEfficiency`, `profitMarginAvg` : Double
- `riskFactors`, `recommendations`, `kpis` : JSON
- `lastCalculated` : DateTime (auto-updated)
- `calculatedBy` : Integer (FK vers User)
- `createdAt` : DateTime

**Méthodes principales :**
- `calculateKPIs(): void`
- `generateReport(): JSON`
- `identifyTrends(): JSON`
- `generateRecommendations(): JSON`
- `compareWithPreviousPeriod(): JSON`

**Relations :**
- N:1 avec `User` (calculatedBy)

---

## RELATIONS CLÉS ET MULTIPLICITÉS

### Relations Principales :

1. **User ← 1:N → ClientRequest** (assignedTo, reviewedBy)
2. **ProjectCategory ← 1:N → ClientRequest** (categoryId)
3. **ClientRequest ← 1:N → Quotation** (requestId)
4. **Quotation ← 1:1 → ActiveProject** (quotationId)
5. **ActiveProject ← 1:N → ProjectPhase** (activeProjectId)
6. **ActiveProject ← 1:N → Payment** (activeProjectId)
7. **ProjectPhase ← 1:N → Payment** (phaseId)
8. **User ← 1:N → Notification** (userId)
9. **Material ← 1:N → Inventory** (materialId)
10. **Supplier ← 1:N → PurchaseOrder** (supplierId)

### Relations d'Héritage et Composition :

- **Company** est spécialisée en **Supplier** et **Contractor**
- **Notification** peut avoir des **sous-notifications** (auto-référentielle)
- **ProjectDocument** et **EnhancedProjectDocument** (évolution)
- **Project** (basique) et **ActiveProject** (avancé)

---

## PATTERNS ARCHITECTURAUX IDENTIFIÉS

### 1. **State Pattern**
- `ClientRequest.status` : received → reviewing → quoted → accepted/rejected
- `Quotation.status` : draft → sent → viewed → accepted/rejected/expired
- `ActiveProject.status` : planning → in_progress → completed/cancelled
- `ProjectPhase.status` : not_started → in_progress → completed
- `Payment.status` : pending → paid → overdue

### 2. **Factory Pattern**
- Création automatique des numéros (requestNumber, quotationNumber, projectNumber, paymentNumber)
- Génération des devis à partir des demandes
- Conversion des devis acceptés en projets actifs

### 3. **Observer Pattern**
- Système de notifications déclenchées par les changements d'état
- Logs d'activité automatiques
- Alertes de délai et de budget

### 4. **Strategy Pattern**
- Différents types de projets (construction_neuve, renovation, etc.)
- Méthodes de paiement multiples
- Calculs de coûts selon le niveau de qualité

### 5. **Composite Pattern**
- Hiérarchie des phases de projet
- Structure des budgets par catégorie
- Organisation des documents par type

---

## CONTRAINTES ET RÈGLES MÉTIER

### Contraintes d'Intégrité :
1. **Unicité** : requestNumber, quotationNumber, projectNumber, paymentNumber
2. **Cohérence temporelle** : startDate < endDate, dueDate, validUntil
3. **Cohérence financière** : paidAmount + remainingAmount = contractValue
4. **Cohérence d'état** : transitions d'état valides uniquement

### Règles Métier :
1. **Workflow** : ClientRequest → Quotation → ActiveProject → ProjectPhases → Payments
2. **Sécurité** : Seuls les admins/managers peuvent approuver les devis
3. **Finance** : Les paiements ne peuvent excéder le montant contractuel
4. **Qualité** : Inspections obligatoires avant validation des phases

---

Cette description fournit une base solide pour créer un diagramme de classe UML complet et détaillé de l'application Housy, en respectant les principes de l'orienté objet et les patterns architecturaux identifiés.
