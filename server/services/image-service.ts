import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for image uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../static/images/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Rename file to prevent collisions - using user ID and timestamp
    const userId = req.params.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `user_${userId}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
});

// Upload profile image
router.post('/upload/:userId', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const userId = parseInt(req.params.userId, 10);
    
    // Get the relative path to store in DB
    const relativePath = `/static/images/profiles/${req.file.filename}`;
    
    // In a production app, we would update the user record in DB
    // For now, we'll just return the path
    
    res.json({ 
      success: true, 
      message: 'Profile image uploaded successfully',
      avatar: relativePath
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ 
      message: 'Error uploading profile image', 
      error: (error as Error).message 
    });
  }
});

// Get default avatar if no image is available
router.get('/default', (req, res) => {
  const defaultPath = path.join(__dirname, '../../static/images/profiles/default.png');
  
  if (fs.existsSync(defaultPath)) {
    res.sendFile(defaultPath);
  } else {
    res.status(404).json({ message: 'Default avatar not found' });
  }
});

// Client-side upload function
async function uploadProfileImage(userId: number, file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`/api/images/upload/${userId}`, {
    method: 'POST',
    body: formData
  });
    return await response.json();
}

// Usage example (for documentation only):
// In React components, you can use the UserAvatar component like this:
// <UserAvatar 
//   src="/static/images/profiles/user_1.jpg" 
//   alt="Adnen Ben Zineb" 
//   size="md" 
// />

export default router;
