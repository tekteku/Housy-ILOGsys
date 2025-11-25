# 🗺️ Housy UI Structure Map

## 📊 Architecture des Interfaces

```
                         HOUSY PLATFORM
                               |
        ┌──────────────────────┴──────────────────────┐
        |                                              |
   PUBLIC PAGES                                AUTHENTICATED PAGES
        |                                              |
        ├─ / (Landing Page)                           ├─ CLIENT INTERFACES
        │  ├─ Hero Section                            │  ├─ /dashboard
        │  ├─ Quick Estimator                         │  │  ├─ Statistics Cards (4)
        │  ├─ Image Gallery                           │  │  ├─ Charts (Budget, Progress)
        │  ├─ Testimonials                            │  │  ├─ Recent Activity
        │  ├─ Features                                │  │  └─ Quick Actions
        │  └─ Assistant Chatbot                       │  │
        │                                              │  ├─ /estimation
        ├─ /auth                                      │  │  ├─ AI Model Selector
        │  ├─ Login Form                              │  │  ├─ Property Form
        │  ├─ Register Form                           │  │  ├─ Advanced Options
        │  └─ Social Auth                             │  │  └─ Results Display
        │                                              │  │
        └─ Public Features                            │  ├─ /projects or /client/projects
           ├─ Free Estimation                         │  │  ├─ Projects Grid/List
           ├─ Materials Catalog                       │  │  ├─ Filters & Search
           ├─ Gallery View                            │  │  └─ Quick Actions
           └─ IA Chat (Guest)                         │  │
                                                      │  ├─ /projects/:id
                                                      │  │  ├─ Overview Tab
                                                      │  │  ├─ Tasks Tab
                                                      │  │  ├─ Team Tab
                                                      │  │  ├─ Documents Tab
                                                      │  │  ├─ Finances Tab
                                                      │  │  └─ Timeline Tab
                                                      │  │
                                                      │  ├─ /client/request
                                                      │  │  ├─ Step 1: Project Type
                                                      │  │  ├─ Step 2: Details
                                                      │  │  ├─ Step 3: Documents
                                                      │  │  └─ Step 4: Confirmation
                                                      │  │
                                                      │  ├─ /client/quotations
                                                      │  │  ├─ Received Quotes
                                                      │  │  ├─ Quote Details
                                                      │  │  └─ Actions (Accept/Reject)
                                                      │  │
                                                      │  ├─ /client/documents
                                                      │  │  ├─ File Browser
                                                      │  │  ├─ Upload Zone
                                                      │  │  └─ Preview/Download
                                                      │  │
                                                      │  ├─ /client/payments
                                                      │  │  ├─ Payment Schedule
                                                      │  │  ├─ Transaction History
                                                      │  │  └─ Payment Methods
                                                      │  │
                                                      │  └─ /profile or /client/profile
                                                      │     ├─ Personal Info
                                                      │     ├─ Preferences
                                                      │     ├─ Security
                                                      │     └─ Notifications
                                                      │
                                                      ├─ ADMIN INTERFACES
                                                      │  ├─ /admin/dashboard
                                                      │  │  ├─ System Overview
                                                      │  │  ├─ Quick Stats (4 cards)
                                                      │  │  ├─ Real-time Analytics
                                                      │  │  └─ Recent Activities
                                                      │  │
                                                      │  ├─ /admin/users
                                                      │  │  ├─ Users Table (CRUD)
                                                      │  │  ├─ Search & Filters
                                                      │  │  ├─ Role Management
                                                      │  │  └─ Bulk Actions
                                                      │  │
                                                      │  ├─ /admin/requests
                                                      │  │  ├─ Pending Requests
                                                      │  │  ├─ Request Details
                                                      │  │  └─ Approval Workflow
                                                      │  │
                                                      │  ├─ /admin/quotations
                                                      │  │  ├─ All Quotations
                                                      │  │  ├─ Generate Quote
                                                      │  │  └─ Templates
                                                      │  │
                                                      │  ├─ /admin/analytics
                                                      │  │  ├─ Revenue Charts
                                                      │  │  ├─ Geographic Distribution
                                                      │  │  ├─ User Behavior
                                                      │  │  └─ Export Reports
                                                      │  │
                                                      │  ├─ /admin/categories
                                                      │  │  ├─ Project Types
                                                      │  │  ├─ Material Categories
                                                      │  │  └─ Tags Management
                                                      │  │
                                                      │  ├─ /admin/notifications
                                                      │  │  ├─ Send Notifications
                                                      │  │  ├─ Templates
                                                      │  │  └─ History
                                                      │  │
                                                      │  ├─ /admin/system-monitoring
                                                      │  │  ├─ Server Status
                                                      │  │  ├─ API Performance
                                                      │  │  ├─ Database Metrics
                                                      │  │  └─ Logs Viewer
                                                      │  │
                                                      │  └─ /admin/financial
                                                      │     ├─ Revenue Overview
                                                      │     ├─ Expenses
                                                      │     ├─ Transactions
                                                      │     └─ Reports
                                                      │
                                                      ├─ SHARED INTERFACES
                                                      │  ├─ /chatbot
                                                      │  │  ├─ AI Model Selector
                                                      │  │  ├─ Chat Messages
                                                      │  │  ├─ Quick Actions
                                                      │  │  └─ File Upload
                                                      │  │
                                                      │  ├─ /materials
                                                      │  │  ├─ Materials Grid
                                                      │  │  ├─ Filters (Category, Price)
                                                      │  │  ├─ Search
                                                      │  │  └─ Price Comparison
                                                      │  │
                                                      │  └─ /data-analysis
                                                      │     ├─ Market Trends
                                                      │     ├─ Property Analysis
                                                      │     ├─ Regional Stats
                                                      │     └─ Export Data
                                                      │
                                                      └─ ERROR PAGES
                                                         ├─ /404 (Not Found)
                                                         └─ /500 (Server Error)
```

---

## 🎨 Component Hierarchy

### Layout Components
```
AppLayout
├─ Sidebar (Desktop)
│  ├─ Logo
│  ├─ Navigation Menu
│  │  ├─ Dashboard Link
│  │  ├─ Projects Link
│  │  ├─ Estimation Link
│  │  ├─ Materials Link
│  │  ├─ Chatbot Link
│  │  └─ Profile Link
│  └─ Theme Toggle
│
├─ Header
│  ├─ Breadcrumbs
│  ├─ Search Bar
│  ├─ Notifications Icon
│  └─ User Menu
│
├─ Main Content Area
│  └─ {children} (Page content)
│
└─ BottomNav (Mobile)
   ├─ Home
   ├─ Projects
   ├─ Add
   ├─ Chat
   └─ Profile
```

---

## 📱 Screen Flows

### User Journey: New Project Request

```
Landing Page
     |
     v
[Voir un aperçu] Button
     |
     v
Login/Register Page
     |
     v
Dashboard
     |
     v
[Nouvelle Demande] Button
     |
     v
Request Form (Step 1: Type)
     |
     v
Request Form (Step 2: Details)
     |
     v
Request Form (Step 3: Documents)
     |
     v
Request Form (Step 4: Confirmation)
     |
     v
Request Submitted ✅
     |
     v
My Projects Page
     |
     v
Project Details (Track Progress)
```

### User Journey: AI Estimation

```
Landing Page
     |
     v
Quick Estimator Component
     |
     v
[Estimer gratuitement] Button
     |
     v
Estimation Page
     |
     v
Select AI Model (OpenAI/Claude/DeepSeek)
     |
     v
Fill Property Form
     |
     v
Submit for Estimation
     |
     v
AI Processing (5s)
     |
     v
Results Display
     |
     v
[Télécharger PDF] or [Créer un Projet]
```

### Admin Journey: Approve Request

```
Admin Dashboard
     |
     v
Notifications Badge (New Request)
     |
     v
Requests Management Page
     |
     v
Click on Request Card
     |
     v
Request Details Modal
     |
     v
Review Information
     |
     v
[Approuver] Button
     |
     v
Assign to Entrepreneur
     |
     v
Create Project
     |
     v
Notification Sent to Client ✅
```

---

## 🎯 Key UI Features by Page

### Dashboard Page
```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ [Breadcrumb] [Search] [Notifications]  │
├─────────────────────────────────────────┤
│ STATISTICS CARDS (Grid 2x2)            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │  12  │ │  3   │ │ 8/12 │ │ 85%  │  │
│ └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│ CHARTS SECTION (Grid 1x2)              │
│ ┌──────────────┐ ┌──────────────┐     │
│ │ Budget Chart │ │ Progress Line│     │
│ └──────────────┘ └──────────────┘     │
├─────────────────────────────────────────┤
│ RECENT ACTIVITY & ACTIVE PROJECTS       │
│ ┌────────────────────────────────────┐ │
│ │ Timeline | Project Cards           │ │
│ └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Projects List Page
```
┌─────────────────────────────────────────┐
│ HEADER + ACTIONS                        │
│ [+ Nouvelle Demande] [Filtres] [Vue]   │
├─────────────────────────────────────────┤
│ FILTERS BAR                             │
│ [Status] [Type] [Localisation] [Date]  │
├─────────────────────────────────────────┤
│ PROJECT CARDS (Grid)                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Project 1│ │ Project 2│ │ Project 3││
│ │ [View]   │ │ [View]   │ │ [View]   ││
│ └──────────┘ └──────────┘ └──────────┘│
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Project 4│ │ Project 5│ │ Project 6││
│ └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│ PAGINATION                              │
│ [< Previous] [1] [2] [3] [Next >]      │
└─────────────────────────────────────────┘
```

### Project Details Page
```
┌─────────────────────────────────────────┐
│ PROJECT HEADER                          │
│ Title | Status Badge | Actions Menu    │
├─────────────────────────────────────────┤
│ TABS NAVIGATION                         │
│ [Vue d'ensemble] [Tâches] [Équipe] ... │
├─────────────────────────────────────────┤
│ TAB CONTENT                             │
│ ┌─────────────┐ ┌─────────────────────┐│
│ │ Left Panel  │ │  Right Panel/Chart  ││
│ │ Project Info│ │  Gantt/Progress     ││
│ └─────────────┘ └─────────────────────┘│
├─────────────────────────────────────────┤
│ BOTTOM SECTION                          │
│ Documents | Comments | Activity Log    │
└─────────────────────────────────────────┘
```

---

## 🎨 Design System Elements

### Colors by Role
```css
/* Client Interface */
--client-primary: #4F46E5    /* Indigo */
--client-accent: #10B981     /* Green */

/* Admin Interface */
--admin-primary: #DC2626     /* Red */
--admin-accent: #F59E0B      /* Amber */

/* Entrepreneur Interface */
--entrepreneur-primary: #7C3AED  /* Purple */
--entrepreneur-accent: #06B6D4   /* Cyan */
```

### Component States
```
Default → Hover → Active → Disabled
  ↓        ↓       ↓        ↓
Normal   +Shadow  Pressed  Grayed
```

### Icon System (Lucide React)
```
- Home: HomeIcon
- Projects: BriefcaseIcon
- Estimation: CalculatorIcon
- Materials: BoxIcon
- Chat: MessageCircleIcon
- Profile: UserIcon
- Settings: SettingsIcon
- Notifications: BellIcon
- Add: PlusIcon
- Edit: PencilIcon
- Delete: TrashIcon
- Download: DownloadIcon
```

---

## 📊 Data Visualization Components

### Charts Used
1. **Bar Chart**: Budget comparison, Monthly revenue
2. **Line Chart**: Progress over time, Trends
3. **Pie Chart**: Budget distribution, Project types
4. **Area Chart**: Cumulative costs, Timeline
5. **Gantt Chart**: Project timeline, Task scheduling

### Data Tables
- **Sortable**: Click headers to sort
- **Filterable**: Search and filter bars
- **Paginated**: 10/25/50/100 items per page
- **Actionable**: Inline actions (edit, delete, view)
- **Exportable**: CSV, Excel, PDF

---

## 🔔 Notification System

### Notification Types
```
✅ Success: Green background, CheckCircle icon
❌ Error: Red background, XCircle icon
⚠️ Warning: Yellow background, AlertTriangle icon
ℹ️ Info: Blue background, Info icon
```

### Notification Placement
- **Toast**: Bottom-right corner
- **Banner**: Top of page
- **Badge**: On icons (count)
- **Modal**: Center screen (important)

---

## 🌐 Internationalization Ready

### Supported Features
- RTL Layout support (future)
- Multi-language strings
- Date/Time formatting
- Currency formatting (TND)
- Number formatting

---

## 📸 Screenshot Checklist

Pour une présentation complète:

- [ ] **Landing Page** - Full page, hero visible
- [ ] **Dashboard** - Charts and stats visible
- [ ] **Projects List** - Grid view with cards
- [ ] **Project Details** - All tabs
- [ ] **Estimation Form** - Before and after
- [ ] **AI Chat** - Conversation example
- [ ] **Admin Dashboard** - Analytics visible
- [ ] **Admin Users** - Table with data
- [ ] **Mobile View** - Responsive design
- [ ] **Dark Mode** - Theme variant

---

## 🚀 Live Demo Preparation

### Demo Script (3 minutes)
1. **Intro (15s)**: Landing page, scroll through features
2. **Estimation (30s)**: Quick estimation demo
3. **Login (10s)**: Quick login
4. **Dashboard (20s)**: Show statistics and charts
5. **Projects (30s)**: Browse projects, open details
6. **AI Chat (30s)**: Ask questions, get responses
7. **Admin (30s)**: Show admin capabilities
8. **Mobile (15s)**: Show responsive design
9. **Conclusion (10s)**: Thank you slide

---

<p align="center">
  <strong>🗺️ Complete UI Map - Every interface documented and ready to showcase</strong>
</p>

<p align="center">
  Ready for GitHub, Portfolio, and Presentations 🎯
</p>
