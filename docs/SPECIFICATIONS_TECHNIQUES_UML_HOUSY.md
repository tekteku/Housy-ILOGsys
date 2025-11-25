# DIAGRAMME DE CLASSE UML HOUSY - SPÉCIFICATIONS TECHNIQUES

## DIAGRAMME TEXTUEL DES RELATIONS PRINCIPALES

```
[User] ||--o{ [ClientRequest] : assigns/reviews
[User] ||--o{ [Quotation] : creates/approves  
[User] ||--o{ [ActiveProject] : manages/leads
[User] ||--o{ [Notification] : receives
[User] ||--o{ [TimeTracking] : tracks
[User] ||--o{ [ActivityLog] : logs

[ProjectCategory] ||--o{ [ClientRequest] : categorizes

[ClientRequest] ||--o{ [Quotation] : generates
[Quotation] ||--|| [ActiveProject] : converts_to

[ActiveProject] ||--o{ [ProjectPhase] : contains
[ActiveProject] ||--o{ [ProjectUpdate] : updates
[ActiveProject] ||--o{ [Payment] : receives
[ActiveProject] ||--o{ [EnhancedProjectDocument] : documents

[ProjectPhase] ||--o{ [Payment] : triggers
[ProjectPhase] ||--o{ [ProjectUpdate] : updates

[Material] ||--o{ [Inventory] : stocks
[Material] ||--o{ [PurchaseOrderItem] : orders
[Material] ||--o{ [MaterialPriceHistory] : tracks_prices

[Supplier] ||--o{ [PurchaseOrder] : supplies
[Supplier] ||--o{ [Inventory] : provides
[Company] ||--o{ [Supplier] : specializes

[Equipment] ||--o{ [EquipmentAssignment] : assigns

[Notification] ||--o{ [Notification] : has_children (self-referential)

[AdminStatistics] }o--|| [User] : calculated_by
```

## CLASSES ABSTRAITES ET INTERFACES SUGGÉRÉES

### Interface `Trackable`
```typescript
interface Trackable {
  createdAt: DateTime
  updatedAt: DateTime
  createdBy?: Integer
  lastModified?: DateTime
}
```

### Interface `Approvable`
```typescript
interface Approvable {
  status: String
  approvedBy?: Integer
  approvalDate?: DateTime
  approve(userId: Integer): void
  reject(userId: Integer, reason: String): void
}
```

### Interface `Documentable`
```typescript
interface Documentable {
  attachments?: JSON
  documents?: JSON
  addDocument(document: Document): void
  getDocuments(): List<Document>
}
```

### Abstract Class `BaseProject`
```typescript
abstract class BaseProject implements Trackable, Approvable, Documentable {
  id: Integer
  name: String
  description: String
  location: String
  budget: Decimal
  status: String
  
  abstract calculateProgress(): Double
  abstract updateStatus(newStatus: String): void
}
```

## ÉNUMÉRATIONS DÉTAILLÉES

### ProjectStatus
```typescript
enum ProjectStatus {
  DRAFT = "draft",
  PLANNING = "planning", 
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ARCHIVED = "archived"
}
```

### PaymentType
```typescript
enum PaymentType {
  ADVANCE = "advance",           // Acompte initial
  PROGRESS = "progress",         // Paiement d'avancement 
  MILESTONE = "milestone",       // Paiement d'étape
  FINAL = "final",              // Solde final
  RETENTION = "retention"        // Retenue de garantie
}
```

### NotificationPriority
```typescript
enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical",
  URGENT = "urgent"
}
```

### UserRole
```typescript
enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  PROJECT_MANAGER = "project_manager",
  TEAM_LEAD = "team_lead", 
  TEAM_MEMBER = "team_member",
  CLIENT = "client",
  SUPPLIER = "supplier",
  CONTRACTOR = "contractor"
}
```

## MÉTHODES DÉTAILLÉES PAR CLASSE

### Classe `ClientRequest`

```typescript
class ClientRequest implements Trackable, Approvable {
  // ... attributs ...
  
  // Méthodes de workflow
  assignToUser(userId: Integer): void {
    this.assignedTo = userId
    this.status = RequestStatus.REVIEWING
    this.createNotification("Request assigned", userId)
  }
  
  generateQuotation(templateData: JSON): Quotation {
    const quotation = new Quotation()
    quotation.requestId = this.id
    quotation.populateFromRequest(this)
    quotation.calculateCosts(templateData)
    return quotation
  }
  
  calculateConversionRate(): Double {
    const quotations = this.getQuotations()
    const acceptedQuotations = quotations.filter(q => q.status === "accepted")
    return quotations.length > 0 ? acceptedQuotations.length / quotations.length : 0
  }
  
  isExpired(): Boolean {
    return this.expiryDate && new Date() > this.expiryDate
  }
  
  scheduleFollowUp(days: Integer): void {
    this.followUpDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    this.createFollowUpNotification()
  }
}
```

### Classe `Quotation`

```typescript
class Quotation implements Trackable, Approvable {
  // ... attributs ...
  
  calculateTotal(): Decimal {
    const subtotal = this.laborCost + this.materialCost + this.equipmentCost + this.overheadCost
    const profitAmount = subtotal * (this.profitMargin / 100)
    const totalBeforeDiscount = subtotal + profitAmount
    this.finalAmount = totalBeforeDiscount - this.discount
    return this.finalAmount
  }
  
  applyDiscount(amount: Decimal, type: "percentage" | "fixed"): void {
    if (type === "percentage") {
      this.discount = this.totalCost * (amount / 100)
    } else {
      this.discount = amount
    }
    this.calculateTotal()
  }
  
  sendToClient(): void {
    this.status = QuotationStatus.SENT
    this.sentDate = new Date()
    this.generatePDF()
    this.sendEmailNotification()
    this.createSystemNotification("Quotation sent to client")
  }
  
  markAsAccepted(): ActiveProject {
    this.status = QuotationStatus.ACCEPTED
    this.acceptedDate = new Date()
    
    const project = new ActiveProject()
    project.createFromQuotation(this)
    project.initializePhases()
    project.setupPaymentSchedule()
    
    return project
  }
  
  createRevision(): Quotation {
    const revision = new Quotation()
    revision.copyFrom(this)
    revision.version = this.version + 1
    revision.status = QuotationStatus.DRAFT
    return revision
  }
}
```

### Classe `ActiveProject`

```typescript
class ActiveProject extends BaseProject {
  // ... attributs ...
  
  updateProgress(percentage: Double): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Progress must be between 0 and 100")
    }
    
    const oldProgress = this.progress
    this.progress = percentage
    this.lastUpdate = new Date()
    
    // Déclencher des notifications selon les seuils
    if (percentage >= 25 && oldProgress < 25) {
      this.createMilestoneNotification("25% completion milestone reached")
    }
    
    if (percentage >= 100) {
      this.completeProject()
    }
  }
  
  addTeamMember(userId: Integer, role: String): void {
    const teamMembers = JSON.parse(this.teamMembers || "[]")
    teamMembers.push({ userId, role, addedDate: new Date() })
    this.teamMembers = JSON.stringify(teamMembers)
    
    this.createNotification(`Added to project team as ${role}`, userId)
  }
  
  calculateROI(): Double {
    const totalRevenue = this.contractValue
    const totalCosts = this.calculateActualCosts()
    return ((totalRevenue - totalCosts) / totalCosts) * 100
  }
  
  isOnSchedule(): Boolean {
    const today = new Date()
    const plannedProgress = this.calculatePlannedProgress(today)
    const tolerance = 5 // 5% tolerance
    return Math.abs(this.progress - plannedProgress) <= tolerance
  }
  
  isOnBudget(): Boolean {
    const budgetUsed = this.calculateBudgetUsed()
    const progressBased = this.contractValue * (this.progress / 100)
    const tolerance = 0.1 // 10% tolerance
    return Math.abs(budgetUsed - progressBased) / progressBased <= tolerance
  }
  
  generateReport(): JSON {
    return {
      basicInfo: this.getBasicInfo(),
      financial: this.getFinancialSummary(),
      timeline: this.getTimelineSummary(),
      quality: this.getQualityMetrics(),
      risks: this.identifyRisks(),
      recommendations: this.generateRecommendations()
    }
  }
}
```

### Classe `Payment`

```typescript
class Payment implements Trackable, Approvable {
  // ... attributs ...
  
  processPayment(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error("Payment is not in pending status")
    }
    
    this.status = PaymentStatus.PAID
    this.paidDate = new Date()
    this.updateProjectBalance()
    this.createPaymentNotifications()
    this.generateReceipt()
  }
  
  sendReminder(): void {
    if (this.isOverdue()) {
      this.reminderSent = true
      this.reminderDate = new Date()
      this.sendOverdueNotification()
    } else if (this.isDueSoon()) {
      this.sendUpcomingDueNotification()
    }
  }
  
  calculateLateFees(): Decimal {
    if (!this.isOverdue()) return 0
    
    const daysOverdue = this.getDaysOverdue()
    const lateFeeRate = 0.02 // 2% per day (configurable)
    return this.amount * lateFeeRate * daysOverdue
  }
  
  isOverdue(): Boolean {
    return this.status === PaymentStatus.PENDING && new Date() > this.dueDate
  }
  
  generateInvoice(): String {
    const invoiceData = {
      paymentInfo: this.getPaymentInfo(),
      projectInfo: this.getProjectInfo(),
      clientInfo: this.getClientInfo(),
      breakdown: this.getBreakdown()
    }
    
    return InvoiceGenerator.generate(invoiceData)
  }
}
```

## PATTERNS D'ACCÈS AUX DONNÉES (REPOSITORY)

### Interface Repository Générique
```typescript
interface Repository<T> {
  findById(id: Integer): T | null
  findAll(): List<T>
  save(entity: T): T
  update(entity: T): T
  delete(id: Integer): void
  findBy(criteria: JSON): List<T>
}
```

### Repositories Spécialisés
```typescript
interface ClientRequestRepository extends Repository<ClientRequest> {
  findByStatus(status: String): List<ClientRequest>
  findByAssignee(userId: Integer): List<ClientRequest>
  findExpiring(days: Integer): List<ClientRequest>
  getConversionStats(period: String): JSON
}

interface ActiveProjectRepository extends Repository<ActiveProject> {
  findByManager(managerId: Integer): List<ActiveProject>
  findByStatus(status: String): List<ActiveProject>
  findDelayed(): List<ActiveProject>
  findOverBudget(): List<ActiveProject>
  getKPIs(period: String): JSON
}

interface PaymentRepository extends Repository<Payment> {
  findOverdue(): List<Payment>
  findDueSoon(days: Integer): List<Payment>
  findByProject(projectId: Integer): List<Payment>
  getPaymentStats(period: String): JSON
}
```

## SERVICES MÉTIER

### Classe `WorkflowService`
```typescript
class WorkflowService {
  processRequestToQuotation(requestId: Integer): Quotation
  processQuotationToProject(quotationId: Integer): ActiveProject
  processPhaseCompletion(phaseId: Integer): void
  processPayment(paymentId: Integer): void
}
```

### Classe `NotificationService`
```typescript
class NotificationService {
  createNotification(data: NotificationData): Notification
  sendBulkNotifications(notifications: List<Notification>): void
  processScheduledNotifications(): void
  markAsRead(notificationId: Integer, userId: Integer): void
}
```

### Classe `AnalyticsService`
```typescript
class AnalyticsService {
  calculateKPIs(period: String): AdminStatistics
  generateProjectReport(projectId: Integer): JSON
  getConversionAnalytics(): JSON
  getFinancialAnalytics(): JSON
  getPredictiveAnalytics(): JSON
}
```

## ÉVÉNEMENTS SYSTÈME

### Événements de Workflow
```typescript
enum SystemEvent {
  REQUEST_CREATED = "request.created",
  REQUEST_ASSIGNED = "request.assigned",
  QUOTATION_SENT = "quotation.sent",
  QUOTATION_ACCEPTED = "quotation.accepted",
  PROJECT_STARTED = "project.started",
  PHASE_COMPLETED = "phase.completed",
  PAYMENT_RECEIVED = "payment.received",
  PROJECT_COMPLETED = "project.completed"
}
```

### Gestionnaire d'Événements
```typescript
class EventHandler {
  handle(event: SystemEvent, data: JSON): void {
    switch(event) {
      case SystemEvent.REQUEST_CREATED:
        this.handleRequestCreated(data)
        break
      case SystemEvent.QUOTATION_ACCEPTED:
        this.handleQuotationAccepted(data)
        break
      // ... autres événements
    }
  }
}
```

Cette spécification technique complète la description UML et fournit tous les éléments nécessaires pour implémenter le diagramme de classe et l'architecture logicielle de l'application Housy.
