import { Router } from 'express';
import { ZodError } from 'zod';
import { storage } from '../storage';
import { insertProjectDocumentSchema } from '../../shared/schema.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db, projectDocuments, eq, desc, and } from '../storage.js';

const router = Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'server/public/documents');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Erreur lors de la création du dossier:', error);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware de validation
const validateRequest = (schema: any) => (req: any, res: any, next: any) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Erreur de validation",
        errors: error.errors
      });
    } else {
      next(error);
    }
  }
};

// GET /api/documents - Obtenir tous les documents
router.get('/', async (req, res) => {
  try {
    const { 
      projectId, 
      type, 
      page = 1, 
      limit = 20,      search 
    } = req.query;
    
    let documents;
    
    if (projectId && type) {
      documents = await db.select().from(projectDocuments)
        .where(and(
          eq(projectDocuments.projectId, parseInt(projectId as string)),
          eq(projectDocuments.documentType, type as string)
        ))
        .limit(parseInt(limit as string))
        .offset((parseInt(page as string) - 1) * parseInt(limit as string));
    } else if (projectId) {
      documents = await db.select().from(projectDocuments)
        .where(eq(projectDocuments.projectId, parseInt(projectId as string)))
        .limit(parseInt(limit as string))
        .offset((parseInt(page as string) - 1) * parseInt(limit as string));
    } else if (type) {
      documents = await db.select().from(projectDocuments)
        .where(eq(projectDocuments.documentType, type as string))
        .limit(parseInt(limit as string))
        .offset((parseInt(page as string) - 1) * parseInt(limit as string));    } else {
      documents = await db.select().from(projectDocuments)
        .limit(parseInt(limit as string))
        .offset((parseInt(page as string) - 1) * parseInt(limit as string));
    }

    res.json({
      message: "Documents récupérés avec succès",
      data: documents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: documents.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des documents"
    });
  }
});

// GET /api/documents/:id - Obtenir un document par ID
router.get('/:id', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    
    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "ID de document invalide"
      });
    }

    const [document] = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return res.status(404).json({
        message: "Document non trouvé"
      });
    }

    res.json({
      message: "Document récupéré avec succès",
      data: document
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du document"
    });
  }
});

// POST /api/documents/upload - Upload d'un nouveau document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier uploadé"
      });
    }

    const { projectId, type, title, description } = req.body;

    if (!projectId) {
      return res.status(400).json({
        message: "ID de projet requis"
      });
    }    const documentData = {
      projectId: parseInt(projectId),
      name: title || req.file.originalname,
      documentType: type || 'other',
      description: description || '',
      filePath: `/static/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: 1, // TODO: Get from authenticated user
      createdAt: new Date(),
      updatedAt: new Date()
    };const [newDocument] = await db
      .insert(projectDocuments)
      .values(documentData)
      .returning();

    res.status(201).json({
      message: "Document uploadé avec succès",
      data: newDocument
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({
      message: "Erreur lors de l'upload du document"
    });
  }
});

// PUT /api/documents/:id - Mettre à jour un document
router.put('/:id', validateRequest(insertProjectDocumentSchema.partial()), async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "ID de document invalide"
      });    }

    const [updatedDocument] = await db
      .update(projectDocuments)
      .set(updateData)
      .where(eq(projectDocuments.id, documentId))
      .returning();

    if (!updatedDocument) {
      return res.status(404).json({
        message: "Document non trouvé"
      });
    }

    res.json({
      message: "Document mis à jour avec succès",
      data: updatedDocument
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du document"
    });
  }
});

// DELETE /api/documents/:id - Supprimer un document
router.delete('/:id', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    
    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "ID de document invalide"
      });
    }    // Récupérer le document pour obtenir le chemin du fichier
    const [document] = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return res.status(404).json({
        message: "Document non trouvé"
      });
    }

    // Supprimer le fichier physique
    try {
      const filePath = path.join(process.cwd(), 'server/public', document.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Impossible de supprimer le fichier physique:', error);
    }    // Supprimer l'enregistrement de la base de données
    await db
      .delete(projectDocuments)
      .where(eq(projectDocuments.id, documentId));

    res.json({
      message: "Document supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du document"
    });
  }
});

// GET /api/documents/:id/download - Télécharger un document
router.get('/:id/download', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    
    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "ID de document invalide"
      });
    }    const [document] = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return res.status(404).json({
        message: "Document non trouvé"
      });
    }

    const filePath = path.join(process.cwd(), 'server/public', document.filePath);
      try {
      await fs.access(filePath);
      res.download(filePath, document.name);
    } catch (error) {
      res.status(404).json({
        message: "Fichier non trouvé sur le disque"
      });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({
      message: "Erreur lors du téléchargement du document"
    });
  }
});

// GET /api/documents/project/:projectId - Obtenir tous les documents d'un projet
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });    }

    const documents = await db
      .select()
      .from(projectDocuments)
      .where(eq(projectDocuments.projectId, projectId))
      .orderBy(desc(projectDocuments.createdAt));

    res.json({
      message: "Documents du projet récupérés avec succès",
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents du projet:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des documents du projet"
    });
  }
});

export default router;
