# Diagrammes UML de l'Architecture Housy

## 1. Diagramme de Classes

### Entités Principales
```plantuml
@startuml
class User {
  +id: number
  +username: string
  +password: string
  +fullName: string
  +email: string
  +role: string
  +avatar: string
  +createdAt: Date
}

class Project {
  +id: number
  +name: string
  +description: string
  +clientName: string
  +location: string
  +budget: number
  +startDate: Date
  +endDate: Date
  +status: string
  +progress: number
  +createdBy: number
}

class Task {
  +id: number
  +projectId: number
  +name: string
  +description: string
  +startDate: Date
  +endDate: Date
  +status: string
  +progress: number
  +assignedTo: number
}

class Material {
  +id: number
  +name: string
  +category: string
  +unit: string
  +price: number
  +supplier: string
  +availability: string
}

Project "1" -- "*" Task
User "1" -- "*" Project
Task "*" -- "1" User
Project "*" -- "*" Material
@enduml
```

## 2. Diagramme de Composants

```plantuml
@startuml
package "Frontend" {
  [React Components]
  [State Management]
  [UI Components]
  [API Client]
}

package "Backend" {
  [Express Server]
  [Services]
  [Routes]
  [Middleware]
  database "PostgreSQL"
  database "Redis"
}

package "AI Services" {
  [AIService]
  [Estimation AI]
  [Analytics AI]
}

[React Components] --> [API Client]
[API Client] --> [Express Server]
[Express Server] --> [Services]
[Services] --> [PostgreSQL]
[Services] --> [Redis]
[Services] --> [AIService]
@enduml
```

## 3. Diagramme de Séquence (Exemple pour Estimation)

```plantuml
@startuml
actor User
participant "Frontend" as FE
participant "Backend API" as API
participant "AI Service" as AI
participant "Database" as DB

User -> FE: Demande estimation
FE -> API: POST /api/estimations
API -> AI: analyzeProject()
AI -> DB: getMaterialPrices()
DB --> AI: prices
AI -> AI: calculateEstimation()
AI --> API: estimationResult
API -> DB: saveEstimation()
DB --> API: saved
API --> FE: estimation
FE --> User: Affiche résultat
@enduml
```

## 4. Diagramme d'États (Projet)

```plantuml
@startuml
[*] --> Draft: Création
Draft --> Submitted: Soumission
Submitted --> InReview: Révision
InReview --> Approved: Approbation
InReview --> Rejected: Rejet
Approved --> InProgress: Démarrage
InProgress --> OnHold: Suspension
OnHold --> InProgress: Reprise
InProgress --> Completed: Finalisation
Completed --> [*]
Rejected --> [*]
@enduml
```

## 5. Diagramme de Déploiement

```plantuml
@startuml
node "Client Browser" {
  [React App]
}

cloud "Cloud Platform" {
  node "Frontend Server" {
    [Nginx]
    [Static Files]
  }
  
  node "Application Server" {
    [Node.js]
    [Express]
  }
  
  node "Database Server" {
    database "PostgreSQL"
    database "Redis"
  }
  
  node "AI Services" {
    [OpenAI API]
    [Claude API]
    [Ollama]
  }
}

[React App] --> [Nginx]
[Nginx] --> [Node.js]
[Express] --> PostgreSQL
[Express] --> Redis
[Express] --> [OpenAI API]
[Express] --> [Claude API]
[Express] --> [Ollama]
@enduml
```

## 6. Diagramme de Paquetages

```plantuml
@startuml
package "Frontend" {
  package "Components" {
    package "UI" 
    package "Pages"
    package "Layout"
  }
  package "Services" {
    package "API"
    package "State"
  }
}

package "Backend" {
  package "Routes"
  package "Services" {
    package "Core"
    package "AI"
  }
  package "Models"
  package "Utils"
}

package "Shared" {
  package "Types"
  package "Constants"
  package "Validation"
}

Frontend ..> Shared
Backend ..> Shared
@enduml
```

## 7. Diagramme ER Base de Données

```plantuml
@startuml
entity "users" {
  * id : number <<PK>>
  --
  * username : string
  * password : string
  * email : string
  * role : string
  created_at : datetime
}

entity "projects" {
  * id : number <<PK>>
  --
  * name : string
  description : text
  * status : string
  * budget : decimal
  * created_by : number <<FK>>
}

entity "materials" {
  * id : number <<PK>>
  --
  * name : string
  * category : string
  * unit : string
  * price : decimal
}

entity "tasks" {
  * id : number <<PK>>
  --
  * project_id : number <<FK>>
  * name : string
  * status : string
  assigned_to : number <<FK>>
}

users ||--o{ projects
projects ||--o{ tasks
projects }o--o{ materials
@enduml
```

## 8. Diagramme d'Activité (Workflow d'Estimation)

```plantuml
@startuml
start
:Utilisateur démarre estimation;
:Saisie données projet;
:Système analyse données;
fork
  :Calcul coûts matériaux;
fork again
  :Analyse historique;
fork again
  :IA suggestions;
end fork
:Génération estimation;
:Affichage résultats;
if (Modifications?) then (oui)
  :Ajustements;
  :Recalcul;
else (non)
  :Sauvegarde estimation;
endif
:Génération rapport;
stop
@enduml
```

## 9. Diagramme de Cas d'Utilisation

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Client" as client
actor "Admin" as admin
actor "Manager de Projet" as pm
actor "Architecte" as architect

rectangle "Système Housy" {
  usecase "S'authentifier" as UC1
  usecase "Créer un projet" as UC2
  usecase "Consulter projets" as UC3
  usecase "Estimer coûts" as UC4
  usecase "Gérer matériaux" as UC5
  usecase "Planifier tâches" as UC6
  usecase "Suivre progression" as UC7
  usecase "Gérer budget" as UC8
  usecase "Générer rapports" as UC9
  usecase "Chat IA" as UC10
  usecase "Gérer utilisateurs" as UC11
  usecase "Configurer système" as UC12
  usecase "Valider projets" as UC13
  usecase "Analyser données" as UC14
  usecase "Gérer fournisseurs" as UC15
  usecase "Contrôler qualité" as UC16
}

' Relations Client
client --> UC1
client --> UC2
client --> UC3
client --> UC4
client --> UC10

' Relations Manager de Projet
pm --> UC1
pm --> UC3
pm --> UC6
pm --> UC7
pm --> UC8
pm --> UC9
pm --> UC13
pm --> UC10
pm --> UC15

' Relations Architecte
architect --> UC1
architect --> UC2
architect --> UC4
architect --> UC5
architect --> UC10
architect --> UC16

' Relations Admin
admin --> UC1
admin --> UC11
admin --> UC12
admin --> UC9
admin --> UC14

' Extensions et inclusions
UC2 ..> UC1 : <<include>>
UC4 ..> UC5 : <<include>>
UC8 ..> UC7 : <<include>>
UC9 ..> UC7 : <<extend>>
UC14 ..> UC9 : <<extend>>

@enduml
```

## 10. Diagramme de Cas d'Utilisation Détaillé (Gestion de Projet)

```plantuml
@startuml
left to right direction

actor "Manager de Projet" as pm
actor "IA Assistant" as ia

rectangle "Module Gestion de Projet" {
  usecase "Créer nouveau projet" as UC_NEW
  usecase "Définir phases" as UC_PHASES
  usecase "Assigner équipe" as UC_TEAM
  usecase "Planifier timeline" as UC_TIMELINE
  usecase "Estimer budget" as UC_BUDGET
  usecase "Suivre avancement" as UC_TRACK
  usecase "Gérer risques" as UC_RISK
  usecase "Communiquer client" as UC_COMM
  usecase "Valider livrables" as UC_DELIVER
  usecase "Clôturer projet" as UC_CLOSE
}

rectangle "Système de Support" {
  usecase "Recommandations IA" as UC_AI_REC
  usecase "Analyse prédictive" as UC_AI_PRED
  usecase "Génération automatique" as UC_AI_GEN
}

pm --> UC_NEW
pm --> UC_PHASES
pm --> UC_TEAM
pm --> UC_TIMELINE
pm --> UC_BUDGET
pm --> UC_TRACK
pm --> UC_RISK
pm --> UC_COMM
pm --> UC_DELIVER
pm --> UC_CLOSE

ia --> UC_AI_REC
ia --> UC_AI_PRED
ia --> UC_AI_GEN

UC_NEW ..> UC_PHASES : <<include>>
UC_PHASES ..> UC_TIMELINE : <<include>>
UC_BUDGET ..> UC_AI_REC : <<extend>>
UC_TRACK ..> UC_AI_PRED : <<extend>>
UC_COMM ..> UC_AI_GEN : <<extend>>

@enduml
```
