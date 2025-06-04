import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, like, desc, asc } from 'drizzle-orm';

// Schémas de validation
const createTaskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  projectId: z.string(),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  phase: z.string().optional(),
  tags: z.array(z.string()).default([])
});

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  phase: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const commentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide')
});

// Interface pour les tâches
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  dueDate?: string;
  projectId: string;
  phase?: string;
  tags: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// Obtenir toutes les tâches d'un projet
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search, sort = 'created_at', order = 'desc' } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'ID du projet requis' });
    }

    // Simulation des données (à remplacer par la vraie logique DB)
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Préparation du terrain',
        description: 'Nivellement et préparation du site de construction',
        status: 'completed',
        priority: 'high',
        assignedTo: 'user1',
        assignedToName: 'Mohammed Trabelsi',
        dueDate: '2025-06-15',
        projectId,
        phase: 'preparation',
        tags: ['terrain', 'preparation'],
        commentsCount: 3,
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-06-04T10:30:00Z'
      },
      {
        id: '2',
        title: 'Coulage des fondations',
        description: 'Coulage du béton pour les fondations principales',
        status: 'in_progress',
        priority: 'urgent',
        assignedTo: 'user2',
        assignedToName: 'Ahmed Ben Ali',
        dueDate: '2025-06-20',
        projectId,
        phase: 'fondations',
        tags: ['fondations', 'beton'],
        commentsCount: 1,
        createdAt: '2025-06-02T09:00:00Z',
        updatedAt: '2025-06-04T14:15:00Z'
      },
      {
        id: '3',
        title: 'Installation électrique',
        description: 'Mise en place du réseau électrique principal',
        status: 'todo',
        priority: 'medium',
        assignedTo: 'user3',
        assignedToName: 'Karim Sellami',
        dueDate: '2025-07-01',
        projectId,
        phase: 'electricite',
        tags: ['electricite', 'installation'],
        commentsCount: 0,
        createdAt: '2025-06-03T11:00:00Z',
        updatedAt: '2025-06-03T11:00:00Z'
      }
    ];

    let filteredTasks = mockTasks;

    // Filtrage
    if (status && status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (assignee && assignee !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === assignee);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    filteredTasks.sort((a, b) => {
      const aValue = a[sort as keyof Task];
      const bValue = b[sort as keyof Task];
      const multiplier = order === 'desc' ? -1 : 1;
      
      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });

    res.json(filteredTasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer une nouvelle tâche
export const createTask = async (req: Request, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    
    // Simulation de création (à remplacer par la vraie logique DB)
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      assignedToName: 'Utilisateur Test',
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(newTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour une tâche
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);

    if (!taskId) {
      return res.status(400).json({ error: 'ID de tâche requis' });
    }

    // Simulation de mise à jour
    const updatedTask = {
      id: taskId,
      ...validatedData,
      updatedAt: new Date().toISOString()
    };

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer une tâche
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'ID de tâche requis' });
    }

    // Simulation de suppression
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir les commentaires d'une tâche
export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: 'ID de tâche requis' });
    }

    // Simulation des commentaires
    const mockComments: TaskComment[] = [
      {
        id: '1',
        taskId,
        author: 'user1',
        authorName: 'Mohammed Trabelsi',
        content: 'Travail bien avancé, bon rythme !',
        createdAt: '2025-06-04T09:30:00Z'
      },
      {
        id: '2',
        taskId,
        author: 'user2',
        authorName: 'Ahmed Ben Ali',
        content: 'Attention aux détails sur les finitions.',
        createdAt: '2025-06-04T11:15:00Z'
      }
    ];

    res.json(mockComments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajouter un commentaire à une tâche
export const addTaskComment = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const validatedData = commentSchema.parse(req.body);

    if (!taskId) {
      return res.status(400).json({ error: 'ID de tâche requis' });
    }

    // Simulation d'ajout de commentaire
    const newComment: TaskComment = {
      id: Math.random().toString(36).substr(2, 9),
      taskId,
      author: 'current_user',
      authorName: 'Utilisateur Actuel',
      content: validatedData.content,
      createdAt: new Date().toISOString()
    };

    res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Exporter les tâches
export const exportTasks = async (req: Request, res: Response) => {
  try {
    const { format, projectId, status, priority, assignee, search } = req.query;

    if (!format || !['csv', 'pdf'].includes(format as string)) {
      return res.status(400).json({ error: 'Format d\'export invalide' });
    }

    // Simulation d'export
    if (format === 'csv') {
      const csvContent = `Title,Description,Status,Priority,Assigned To,Due Date,Tags\n` +
        `Préparation du terrain,Nivellement et préparation,completed,high,Mohammed Trabelsi,2025-06-15,"terrain,preparation"\n` +
        `Coulage des fondations,Coulage du béton,in_progress,urgent,Ahmed Ben Ali,2025-06-20,"fondations,beton"`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="tasks-${projectId || 'all'}.csv"`);
      res.send(csvContent);
    } else {
      // Pour PDF, on retournerait un buffer de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="tasks-${projectId || 'all'}.pdf"`);
      res.send('PDF content would be here');
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
