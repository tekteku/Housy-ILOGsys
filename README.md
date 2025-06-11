# 🏗️ Housy Tunisia - Advanced Construction Management Platform

![Housy Tunisia](https://img.shields.io/badge/Housy-Tunisia-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## 🌟 Overview

**Housy Tunisia** is a comprehensive, AI-powered construction project management platform specifically designed for the Tunisian construction market. The application provides intelligent tools for project planning, material estimation, cost analysis, and AI-assisted decision making for construction professionals.

## 🚀 Major Features & Recent Enhancements

### 🤖 AI-Powered Estimation System
- **Role-Based AI Access**: Ollama Local restricted to administrators for secure, confidential estimations
- **Multi-Model Support**: OpenAI GPT-4, Claude 3, DeepSeek, and Ollama Local
- **Intelligent Fallback**: Automatic model switching based on user permissions
- **Smart Prompting**: Context-aware prompts for accurate construction estimation

### 🛡️ Advanced Security & Access Control
- **Administrator-Only Features**: Exclusive access to Ollama Local for sensitive projects
- **Audit Logging**: Complete tracking of AI model usage and access attempts
- **Role-Based UI**: Visual indicators for restricted features and permissions
- **Secure API Routes**: Protected endpoints with authentication middleware

### 📊 Enhanced Project Management
- **AI Showcase Page**: Interactive demonstrations of AI capabilities
- **Smart Material Estimation**: AI-powered quantity and cost calculations
- **Market Analysis**: Real-time construction material price trends in Tunisia
- **Advanced Dashboard**: Separate admin and client interfaces with role-specific features

### 🎨 Modern User Interface
- **Responsive Design**: Mobile-first approach with smooth animations
- **Visual Feedback**: Clear indicators for permissions and restrictions
- **Error Boundaries**: Robust error handling with user-friendly messages
- **Accessibility**: WCAG compliant design with proper contrast and navigation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **TailwindCSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **React Query** for efficient data fetching

### Backend
- **Node.js** with Express framework
- **TypeScript** for full-stack type safety
- **PostgreSQL** with Drizzle ORM
- **JWT Authentication** for secure sessions
- **Zod** for runtime validation
- **Multer** for file uploads

### AI Integration
- **OpenAI GPT-4** for general construction advice
- **Anthropic Claude 3** for detailed analysis
- **DeepSeek** for market predictions
- **Ollama Local** for admin-only secure processing

### DevOps & Tools
- **ESLint & Prettier** for code quality
- **VS Code Tasks** for development automation
- **Git Hooks** for pre-commit validation
- **Performance Monitoring** with custom scripts

## 📁 Project Architecture

```
housy-tunisia/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── animations/    # Reusable animation components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── chatbot/       # AI chat interface
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── estimation/    # AI estimation components
│   │   │   ├── financial/     # Financial management
│   │   │   ├── layout/        # Layout components
│   │   │   ├── materials/     # Material management
│   │   │   ├── projects/      # Project management
│   │   │   ├── team/          # Team management
│   │   │   └── ui/            # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── client/        # Client pages
│   │   │   ├── ai-showcase.tsx # AI demonstrations
│   │   │   └── estimation.tsx  # Enhanced estimation page
│   │   └── styles/            # Global styles
│   └── public/
│       └── static/
│           └── images/        # Static image assets
├── server/                     # Backend Node.js Application
│   ├── routes/
│   │   ├── admin.ts           # Admin-specific routes
│   │   ├── ai.ts              # AI chat routes
│   │   ├── estimation-ai.ts   # AI estimation routes
│   │   ├── auth.ts            # Authentication routes
│   │   ├── materials.ts       # Material management
│   │   └── projects.ts        # Project management
│   ├── services/
│   │   ├── ai-service.ts      # Core AI service
│   │   ├── estimation-ai-service.ts # AI estimation service
│   │   └── auth-service.ts    # Authentication service
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   └── app.ts                 # Express application setup
├── shared/                     # Shared TypeScript types
├── migrations/                 # Database migrations
├── scripts/                    # Utility scripts
└── docs/                       # Documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git
- (Optional) Ollama for local AI models

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/housy-tunisia.git
   cd housy-tunisia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/housy_tunisia
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   
   # AI Models
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-claude-api-key
   DEEPSEEK_API_KEY=your-deepseek-api-key
   
   # Ollama (for admin-only features)
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Development Server**
   ```bash
   # Start development server
   npm run dev
   
   # Server runs on http://localhost:5000
   # Client runs on http://localhost:5173 (Vite dev server)
   ```

## 🎯 Key Features Explained

### 🤖 AI Estimation System

The AI estimation system is the crown jewel of Housy Tunisia, providing intelligent construction cost estimation with role-based access control.

#### Admin Features (Ollama Local)
- **Secure Processing**: All data processed locally for maximum confidentiality
- **Advanced Analysis**: Deep construction expertise with local models
- **No External Calls**: Complete data privacy for sensitive projects
- **Custom Training**: Ability to fine-tune models with proprietary data

#### Client Features (Cloud Models)
- **OpenAI Integration**: General construction advice and estimation
- **Claude Analysis**: Detailed technical analysis and recommendations
- **DeepSeek Predictions**: Market trends and cost forecasting
- **Real-time Processing**: Fast responses with cloud-based models

#### How It Works
1. **Model Selection**: System automatically selects appropriate AI model based on user role
2. **Context Building**: Intelligent prompt engineering with Tunisian construction context
3. **Processing**: AI analyzes project requirements and generates detailed estimates
4. **Validation**: Results are validated against local material databases
5. **Output**: Comprehensive estimation with materials list, costs, and recommendations

### 🛡️ Security Implementation

#### Role-Based Access Control (RBAC)
```typescript
// Example: Admin-only Ollama access
if (userRole === 'admin' || userRole === 'super_admin') {
  // Access to Ollama Local and all cloud models
} else {
  // Access only to OpenAI, Claude, and DeepSeek
}
```

#### API Security
- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Middleware-based route protection
- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Complete activity tracking

### 📊 Enhanced Dashboard

#### Admin Dashboard
- **User Management**: Create, edit, and manage user accounts
- **System Analytics**: Monitor AI usage and system performance
- **Project Oversight**: View all projects across the platform
- **Security Monitoring**: Track access attempts and security events

#### Client Dashboard
- **Project Portfolio**: Manage personal construction projects
- **AI Assistance**: Access to cloud-based AI models
- **Cost Tracking**: Monitor project costs and budgets
- **Material Management**: Organize and track construction materials

## 🔄 Recent Major Updates

### Version 2.0.0 - AI Revolution Update

#### 🚀 New Features
- ✅ **AI Estimation System** with role-based access control
- ✅ **Ollama Local Integration** for administrators
- ✅ **AI Showcase Page** with interactive demonstrations
- ✅ **Enhanced Admin Dashboard** with user management
- ✅ **Visual Permission System** with badges and indicators
- ✅ **Automatic Model Fallback** for seamless user experience

#### 🛠️ Technical Improvements
- ✅ **Fixed React Children Mapping** errors in animations
- ✅ **Enhanced Error Boundaries** for better error handling
- ✅ **Improved TypeScript Definitions** across the application
- ✅ **Optimized Performance** with better state management
- ✅ **Responsive Design Updates** for mobile compatibility

#### 🔒 Security Enhancements
- ✅ **Multi-layer Authentication** with JWT and middleware
- ✅ **API Route Protection** for sensitive endpoints
- ✅ **Audit Logging System** for security monitoring
- ✅ **Input Validation** with Zod schemas
- ✅ **Role-based UI Restrictions** with visual feedback

## 🚀 Usage Examples

### AI Estimation Workflow

```typescript
// Client estimation request
const estimationRequest = {
  projectDescription: "Construction d'une villa de 200m² avec 2 étages",
  projectType: "construction_neuve",
  estimatedBudget: 200000,
  preferredModel: "openai" // Will automatically fallback for non-admins
};

// API call
const response = await apiRequest('POST', '/api/estimation-ai/generate', estimationRequest);
```

### Admin User Management

```typescript
// Create new user (admin only)
const newUser = {
  email: "user@example.com",
  role: "client",
  firstName: "John",
  lastName: "Doe"
};

const response = await apiRequest('POST', '/api/admin/users', newUser);
```

## 🎨 UI Components

### AI Model Selector
```tsx
<EstimationAIModelSelector
  selectedModel={selectedModel}
  onModelSelect={setSelectedModel}
  showPermissions={true}
/>
```

### Admin User Table
```tsx
<AdminUsersTable
  users={users}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onRoleChange={handleRoleChange}
/>
```

## 📈 Performance Optimizations

### Build Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Asset Optimization**: Image compression and lazy loading

### Runtime Optimizations
- **React Query**: Efficient data fetching and caching
- **Memoization**: Strategic use of React.memo and useMemo
- **Virtualization**: For large lists and tables
- **Error Boundaries**: Graceful error handling

## 🧪 Testing Strategy

### Unit Testing
```bash
npm run test:unit
```

### Integration Testing
```bash
npm run test:integration
```

### E2E Testing
```bash
npm run test:e2e
```

### AI Model Testing
```bash
npm run test:ai-models
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Adapted layouts with touch-friendly controls
- **Mobile**: Streamlined interface with essential features

## 🌍 Localization

Currently supports:
- **French**: Primary language for Tunisian market
- **Arabic**: Right-to-left layout support
- **English**: International accessibility

## 🔮 Future Roadmap

### Planned Features
- [ ] **Real-time Collaboration**: Multi-user project editing
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **3D Visualization**: WebGL-based 3D project previews
- [ ] **IoT Integration**: Construction site monitoring
- [ ] **Blockchain**: Secure contract and payment processing

### Technical Debt
- [ ] **Migration to Next.js**: For better SEO and performance
- [ ] **GraphQL API**: More efficient data fetching
- [ ] **Microservices**: Service-oriented architecture
- [ ] **Docker Deployment**: Containerized deployment

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Coding Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ILOG Systems**: Project sponsorship and guidance
- **Tunisia Construction Industry**: Domain expertise and requirements
- **Open Source Community**: Amazing libraries and tools used
- **AI Model Providers**: OpenAI, Anthropic, DeepSeek, and Ollama teams

## 📞 Support

For support and questions:
- 📧 **Email**: support@housy-tunisia.com
- 💬 **Discord**: [Join our community](https://discord.gg/housy-tunisia)
- 📖 **Documentation**: [docs.housy-tunisia.com](https://docs.housy-tunisia.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/housy-tunisia/issues)

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/housy-tunisia?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/housy-tunisia?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/housy-tunisia)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/housy-tunisia)

---

**Built with ❤️ for the Tunisian Construction Industry**

*Last updated: June 2025*
