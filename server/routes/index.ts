import { Router } from 'express';
import { storage } from '../storage';
import { projectService } from '../services/project-service';
import bcrypt from 'bcrypt';

const router = Router();

// ==== Legacy Routes (kept for backwards compatibility) ====
// Note: Most routes are now handled by dedicated route modules

// Simple health check for the main API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date() 
  });
});

export default router;
