import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import working routes
import apiRoutes from './routes/index';
import imageRoutes from './services/image-service';
import materialRoutes from './routes/materials';
import documentRoutes from './routes/documents';
import projectRoutes from './routes/projects';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import financialRoutes from './routes/financial';
import authRoutes from './routes/auth';
import estimationRoutes from './routes/estimation';
import activitiesRoutes from './routes/activities';
import resourcesRoutes from './routes/resources';

// Import new extended routes
import clientRequestRoutes from './routes/client-requests';
import quotationRoutes from './routes/quotations';
import activeProjectRoutes from './routes/active-projects';
import projectPhaseRoutes from './routes/project-phases';
import projectUpdateRoutes from './routes/project-updates';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import projectCategoryRoutes from './routes/project-categories';

// Import new enhanced component routes
import progressTrackingRoutes from './routes/progress-tracking';
import teamManagementRoutes from './routes/team-management';

// Import enhanced mega routes
import megaRoutes from './routes/mega-routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : [])],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://housy-tunisia.com', 'https://www.housy-tunisia.com']
    : ['http://localhost:5173', 'http://localhost:9876'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && process.env.NODE_ENV === 'development') {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/estimation', estimationRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/resources', resourcesRoutes);

// Extended schema routes
app.use('/api/client-requests', clientRequestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/active-projects', activeProjectRoutes);
app.use('/api/project-phases', projectPhaseRoutes);
app.use('/api/project-updates', projectUpdateRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/project-categories', projectCategoryRoutes);

// New enhanced component routes
app.use('/api/projects', progressTrackingRoutes);
app.use('/api/projects', teamManagementRoutes);

// Enhanced mega routes with comprehensive features
app.use('/api/mega', megaRoutes);

// Simple test routes to verify modular structure works
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Modular Express.js structure is working!',
    timestamp: new Date(),
    routes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/projects',
      '/api/materials',
      '/api/materials/trends',
      '/api/materials/compare',
      '/api/users',
      '/api/financial/transactions',
      '/api/documents',
      '/api/images',
      '/api/ai/chat',
      '/api/analytics/dashboard',
      '/api/estimation/calculate',
      '/api/estimation/history',
      '/api/activities',
      '/api/resources',
      // Extended schema routes
      '/api/client-requests',
      '/api/quotations',
      '/api/active-projects',
      '/api/project-phases',
      '/api/project-updates',
      '/api/payments',
      '/api/notifications',
      '/api/project-categories',
      '/api/test',
      '/health'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error(`Error ${status}: ${message}`, err.stack);
  
  res.status(status).json({
    message: process.env.NODE_ENV === 'production' ? 'Une erreur interne s\'est produite' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint non trouvé',
    path: req.path
  });
});

export default app;
