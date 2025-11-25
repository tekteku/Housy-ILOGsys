# DESCRIPTION DU DIAGRAMME DE COMPOSANTS - APPLICATION HOUSY

## Vue d'ensemble

Le diagramme de composants modélise l'architecture logicielle de l'application Housy en montrant les composants logiciels, leurs interfaces, leurs dépendances et la façon dont ils sont organisés et connectés. Il représente la structure physique du système et les relations entre les différents modules.

---

## ARCHITECTURE GÉNÉRALE DU SYSTÈME

### **Architecture Multi-Couches (N-Tier)**

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                      │
├─────────────────────────────────────────────────────────────┤
│                     COUCHE LOGIQUE MÉTIER                   │
├─────────────────────────────────────────────────────────────┤
│                    COUCHE ACCÈS DONNÉES                     │
├─────────────────────────────────────────────────────────────┤
│                    COUCHE PERSISTANCE                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. COUCHE PRÉSENTATION (FRONTEND)

### **Composant Principal : `ClientApp`**

**Responsabilités :**
- Interface utilisateur responsive
- Gestion des interactions utilisateur
- Routing côté client
- State management global

**Sous-composants :**

#### **1.1 `AuthenticationModule`**
- **Interfaces fournies :** `IAuthService`
- **Interfaces requises :** `IUserService`, `ISessionService`
- **Fonctionnalités :**
  - Connexion/déconnexion utilisateurs
  - Gestion des tokens JWT
  - Récupération de mot de passe
  - Validation des sessions

#### **1.2 `AdminDashboardModule`**
- **Interfaces fournies :** `IAdminDashboard`
- **Interfaces requises :** `IAnalyticsService`, `IUserManagementService`
- **Sous-composants :**
  - `UserManagementComponent`
  - `AnalyticsComponent`
  - `SystemMonitoringComponent`
  - `PermissionManagementComponent`
  - `NotificationCenterComponent`

#### **1.3 `ProjectManagementModule`**
- **Interfaces fournies :** `IProjectManagement`
- **Interfaces requises :** `IProjectService`, `ITaskService`
- **Sous-composants :**
  - `ProjectListComponent`
  - `ProjectDetailsComponent`
  - `TaskManagementComponent`
  - `TimeTrackingComponent`
  - `DocumentManagementComponent`

#### **1.4 `ClientPortalModule`**
- **Interfaces fournies :** `IClientPortal`
- **Interfaces requises :** `IClientService`, `IQuotationService`
- **Sous-composants :**
  - `RequestSubmissionComponent`
  - `QuotationViewerComponent`
  - `ProjectProgressComponent`
  - `PaymentPortalComponent`

#### **1.5 `NotificationModule`**
- **Interfaces fournies :** `INotificationUI`
- **Interfaces requises :** `INotificationService`
- **Fonctionnalités :**
  - Affichage notifications temps réel
  - Centre de notifications
  - Préférences utilisateur
  - Accusés de réception

---

## 2. COUCHE LOGIQUE MÉTIER (BACKEND SERVICES)

### **Composant Principal : `BusinessLogicLayer`**

#### **2.1 `ProjectWorkflowService`**
- **Interfaces fournies :** `IProjectWorkflow`
- **Interfaces requises :** `IProjectRepository`, `INotificationService`
- **Responsabilités :**
  - Orchestration workflow client → devis → projet
  - Gestion des transitions d'état
  - Validation des règles métier
  - Coordination des phases de projet

#### **2.2 `QuotationService`**
- **Interfaces fournies :** `IQuotationService`
- **Interfaces requises :** `IMaterialService`, `IPricingEngine`
- **Responsabilités :**
  - Génération automatique des devis
  - Calcul des coûts (matériaux, main-d'œuvre, équipements)
  - Gestion des révisions
  - Application des marges et remises

#### **2.3 `PaymentService`**
- **Interfaces fournies :** `IPaymentService`
- **Interfaces requises :** `IBankingGateway`, `IFinancialRepository`
- **Responsabilités :**
  - Traitement des paiements
  - Gestion des échéanciers
  - Rappels automatiques
  - Intégration bancaire

#### **2.4 `InventoryService`**
- **Interfaces fournies :** `IInventoryService`
- **Interfaces requises :** `IMaterialRepository`, `ISupplierService`
- **Responsabilités :**
  - Gestion des stocks
  - Commandes automatiques
  - Tracking des livraisons
  - Optimisation des approvisionnements

#### **2.5 `QualityControlService`**
- **Interfaces fournies :** `IQualityControl`
- **Interfaces requises :** `IInspectionRepository`, `IPhaseService`
- **Responsabilités :**
  - Planification des inspections
  - Validation des phases
  - Gestion des non-conformités
  - Rapports qualité

#### **2.6 `AnalyticsService`**
- **Interfaces fournies :** `IAnalyticsService`
- **Interfaces requises :** `IDataWarehouse`, `IReportingEngine`
- **Responsabilités :**
  - Calcul des KPIs
  - Génération de rapports
  - Analyse des tendances
  - Tableaux de bord décisionnels

---

## 3. COUCHE SERVICES TRANSVERSAUX

### **3.1 `NotificationService`**
- **Interfaces fournies :** `INotificationService`
- **Interfaces requises :** `IEmailService`, `ISMSService`, `IPushService`
- **Responsabilités :**
  - Orchestration multi-canal
  - Programmation des notifications
  - Gestion des préférences
  - Suivi de livraison

**Sous-composants :**
- `EmailServiceConnector` → Intégration SMTP/SendGrid
- `SMSServiceConnector` → Intégration Twilio/AWS SNS
- `PushServiceConnector` → Firebase/Apple Push

### **3.2 `SecurityService`**
- **Interfaces fournies :** `ISecurityService`
- **Interfaces requises :** `IAuthProvider`, `IPermissionRepository`
- **Responsabilités :**
  - Authentification et autorisation
  - Gestion des permissions
  - Audit de sécurité
  - Chiffrement des données

### **3.3 `FileManagementService`**
- **Interfaces fournies :** `IFileService`
- **Interfaces requises :** `IStorageProvider`, `ICompressionService`
- **Responsabilités :**
  - Upload/download de fichiers
  - Gestion des versions
  - Compression et optimisation
  - CDN et cache

### **3.4 `AuditService`**
- **Interfaces fournies :** `IAuditService`
- **Interfaces requises :** `IAuditRepository`
- **Responsabilités :**
  - Traçabilité des actions
  - Logs d'activité
  - Monitoring système
  - Conformité réglementaire

---

## 4. COUCHE ACCÈS DONNÉES (DATA ACCESS LAYER)

### **Composant Principal : `DataAccessLayer`**

#### **4.1 `ProjectRepository`**
- **Interfaces fournies :** `IProjectRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** Project, ActiveProject, ProjectPhase

#### **4.2 `UserRepository`**
- **Interfaces fournies :** `IUserRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** User, Role, Permission

#### **4.3 `ClientRepository`**
- **Interfaces fournies :** `IClientRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** ClientRequest, Quotation

#### **4.4 `FinancialRepository`**
- **Interfaces fournies :** `IFinancialRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** Payment, FinancialTransaction

#### **4.5 `MaterialRepository`**
- **Interfaces fournies :** `IMaterialRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** Material, Inventory, Supplier

#### **4.6 `NotificationRepository`**
- **Interfaces fournies :** `INotificationRepository`
- **Interfaces requises :** `IDbContext`
- **Entités gérées :** Notification, NotificationSettings

---

## 5. COUCHE INTÉGRATIONS EXTERNES

### **5.1 `BankingGateway`**
- **Interfaces fournies :** `IBankingGateway`
- **Interfaces requises :** `IBankAPI`
- **Intégrations :**
  - Banques tunisiennes (STB, BIAT, Attijari)
  - Gateways de paiement (MoneyGram, Flouci)
  - Systèmes de virements

### **5.2 `WeatherService`**
- **Interfaces fournies :** `IWeatherService`
- **Interfaces requises :** `IWeatherAPI`
- **Responsabilités :**
  - Données météo en temps réel
  - Prévisions pour planification
  - Alertes météorologiques
  - Impact sur les chantiers

### **5.3 `AIAnalyticsEngine`**
- **Interfaces fournies :** `IAIAnalytics`
- **Interfaces requises :** `IMLModelService`
- **Responsabilités :**
  - Prédictions de coûts
  - Optimisation planning
  - Détection d'anomalies
  - Recommandations intelligentes

### **5.4 `DocumentGenerationService`**
- **Interfaces fournies :** `IDocumentGenerator`
- **Interfaces requises :** `IPDFEngine`, `ITemplateEngine`
- **Responsabilités :**
  - Génération de devis PDF
  - Factures automatiques
  - Rapports personnalisés
  - Contrats digitalisés

---

## 6. COUCHE INFRASTRUCTURE

### **6.1 `DatabaseCluster`**
- **Composant principal :** PostgreSQL
- **Réplication :** Master-Slave pour haute disponibilité
- **Sharding :** Partitionnement par région/projet
- **Backup :** Sauvegardes automatiques

### **6.2 `CacheLayer`**
- **Redis Cluster :** Cache distribué
- **Sessions :** Stockage des sessions utilisateur
- **Temporary Data :** Données temporaires
- **Rate Limiting :** Limitation des requêtes

### **6.3 `MessageQueue`**
- **RabbitMQ/Apache Kafka :** File de messages
- **Background Jobs :** Traitement asynchrone
- **Event Sourcing :** Historique des événements
- **Retry Mechanism :** Gestion des échecs

### **6.4 `FileStorage`**
- **Local Storage :** Fichiers temporaires
- **Cloud Storage :** AWS S3/Azure Blob
- **CDN :** Distribution de contenu
- **Compression :** Optimisation des fichiers

---

## DIAGRAMME DE DÉPLOIEMENT DES COMPOSANTS

### **Architecture de Déploiement :**

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web App   │  │ Mobile App  │  │  Admin App  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                               │
                         ┌─────────────┐
                         │ Load Balancer│
                         └─────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ API Gateway │  │ Auth Service│  │Notification │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Project Svc  │  │Payment Svc  │  │Analytics Svc│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │    Redis    │  │ File Storage│        │
│  │  Cluster    │  │   Cache     │  │    S3/CDN   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## PATTERNS ARCHITECTURAUX UTILISÉS

### **1. Microservices Pattern**
- Services autonomes et déployables indépendamment
- Communication via APIs REST/GraphQL
- Isolation des données par service

### **2. API Gateway Pattern**
- Point d'entrée unique pour toutes les requêtes
- Routage intelligent vers les microservices
- Authentification centralisée

### **3. CQRS (Command Query Responsibility Segregation)**
- Séparation lecture/écriture
- Optimisation des performances
- Évolutivité des requêtes

### **4. Event-Driven Architecture**
- Communication asynchrone par événements
- Découplage des composants
- Résilience et scalabilité

### **5. Repository Pattern**
- Abstraction de l'accès aux données
- Testabilité améliorée
- Flexibilité des sources de données

### **6. Dependency Injection**
- Inversion de contrôle
- Couplage faible entre composants
- Facilité de test et de maintenance

---

## INTERFACES ET CONTRATS

### **Interfaces Principales :**

#### **IProjectService**
```typescript
interface IProjectService {
  createProject(data: ProjectData): Promise<Project>
  updateProgress(projectId: string, progress: number): Promise<void>
  getProjectsByStatus(status: ProjectStatus): Promise<Project[]>
  generateReport(projectId: string): Promise<Report>
}
```

#### **IPaymentService**
```typescript
interface IPaymentService {
  processPayment(payment: PaymentRequest): Promise<PaymentResult>
  scheduleReminder(paymentId: string, dueDate: Date): Promise<void>
  calculateLateFees(paymentId: string): Promise<number>
  getPaymentHistory(projectId: string): Promise<Payment[]>
}
```

#### **INotificationService**
```typescript
interface INotificationService {
  sendNotification(notification: NotificationRequest): Promise<void>
  scheduleNotification(notification: ScheduledNotification): Promise<void>
  getUnreadNotifications(userId: string): Promise<Notification[]>
  markAsRead(notificationId: string): Promise<void>
}
```

---

## GESTION DES DÉPENDANCES

### **Dépendances entre Composants :**

1. **Frontend → Backend :** HTTP/HTTPS APIs
2. **Services → Repositories :** Injection de dépendances
3. **Services → External APIs :** Adaptateurs/Wrappers
4. **Background Jobs → Message Queue :** Event-driven
5. **Cache → Database :** Cache-aside pattern

### **Gestion des Versions :**
- **Semantic Versioning :** Pour tous les composants
- **API Versioning :** Rétrocompatibilité garantie
- **Database Migrations :** Scripts de migration automatisés

---

## SCALABILITÉ ET PERFORMANCE

### **Stratégies de Scalabilité :**

#### **Horizontale (Scale-out) :**
- Load balancing des instances frontend
- Clustering des services backend
- Sharding de la base de données
- CDN pour les assets statiques

#### **Verticale (Scale-up) :**
- Optimisation des requêtes SQL
- Cache intelligent (Redis)
- Compression des données
- Monitoring des performances

### **Points de Monitoring :**
- Latence des APIs
- Utilisation mémoire/CPU
- Connexions base de données
- Taille des files de messages
- Erreurs et exceptions

---

## SÉCURITÉ ET CONFORMITÉ

### **Composants de Sécurité :**

#### **Authentication & Authorization :**
- OAuth 2.0 / OpenID Connect
- JWT avec refresh tokens
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)

#### **Data Protection :**
- Chiffrement en transit (TLS 1.3)
- Chiffrement au repos (AES-256)
- Anonymisation des données sensibles
- GDPR compliance

#### **Audit & Monitoring :**
- Logs d'accès sécurisés
- Détection d'intrusion
- Alertes de sécurité
- Rapports de conformité

---

Cette description du diagramme de composants fournit une vue architecturale complète de l'application Housy, définissant clairement les responsabilités, interfaces et interactions entre tous les composants du système.
