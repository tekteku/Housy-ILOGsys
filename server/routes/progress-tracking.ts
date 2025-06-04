import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// GET /api/projects/:projectId/progress - Get project progress with milestones
router.get('/:projectId/progress', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Get project details
    const project = await storage.getActiveProject(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }

    // Get project phases with milestones
    const phases = await storage.getProjectPhasesByProject(projectId);
    
    // Get tasks for milestone calculation
    const tasks = await storage.getTasks(projectId);
    
    // Calculate project milestones based on phases and tasks
    const allMilestones = [];
    const now = new Date();

    // Add phase milestones
    phases.forEach(phase => {
      if (phase.milestones) {
        const phaseMilestones = phase.milestones.map((milestone: any) => ({
          ...milestone,
          projectId,
          isCompleted: milestone.completed || phase.status === 'completed',
          isOverdue: new Date(milestone.date || phase.plannedEndDate) < now && !milestone.completed,
          type: 'phase',
          priority: phase.priority || 'medium',
        }));
        allMilestones.push(...phaseMilestones);
      }
      
      // Add phase completion as milestone
      allMilestones.push({
        id: `phase-${phase.id}`,
        name: `Fin de phase: ${phase.name}`,
        description: `Achèvement de la phase ${phase.name}`,
        targetDate: phase.plannedEndDate,
        actualDate: phase.actualEndDate,
        isCompleted: phase.status === 'completed',
        isOverdue: phase.plannedEndDate && new Date(phase.plannedEndDate) < now && phase.status !== 'completed',
        priority: phase.priority || 'medium',
        type: 'phase',
        projectId,
        completionPercentage: phase.progressPercentage || 0,
      });
    });

    // Add task milestones for important tasks
    tasks.forEach(task => {
      if (task.priority === 'urgent' || task.priority === 'high') {
        allMilestones.push({
          id: `task-${task.id}`,
          name: `Tâche: ${task.name}`,
          description: task.description,
          targetDate: task.endDate,
          actualDate: task.completedAt,
          isCompleted: task.status === 'completed',
          isOverdue: new Date(task.endDate) < now && task.status !== 'completed',
          priority: task.priority,
          type: 'delivery',
          projectId,
          completionPercentage: task.progress || 0,
          assignedTo: task.assignedToName,
        });
      }
    });

    // Sort milestones by date
    allMilestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

    // Categorize milestones
    const upcomingMilestones = allMilestones.filter(m => !m.isCompleted && !m.isOverdue);
    const overdueMilestones = allMilestones.filter(m => m.isOverdue && !m.isCompleted);
    const completedMilestones = allMilestones.filter(m => m.isCompleted).slice(-10); // Last 10 completed

    // Calculate KPIs
    const completedCount = completedMilestones.length;
    const totalCount = allMilestones.length;
    const overdueCount = overdueMilestones.length;
    
    const onTimeDelivery = totalCount > 0 ? Math.round(((completedCount - overdueCount) / totalCount) * 100) : 100;
    
    // Get budget information
    const transactions = await storage.getTransactionsByProject(projectId);
    const totalBudget = project.contractValue || 0;
    const spentAmount = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((spentAmount / totalBudget) * 100) : 0;

    // Calculate team efficiency based on task completion
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const teamEfficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Prepare phases with their milestones
    const phasesWithMilestones = phases.map(phase => ({
      id: phase.id,
      name: phase.name,
      progress: phase.progressPercentage || 0,
      status: phase.status,
      startDate: phase.plannedStartDate || phase.createdAt,
      endDate: phase.plannedEndDate,
      milestones: allMilestones.filter(m => 
        m.id.toString().startsWith(`phase-${phase.id}`) || 
        (m.type === 'phase' && m.name.includes(phase.name))
      )
    }));

    const progressData = {
      overall: project.progress || 0,
      phases: phasesWithMilestones,
      upcomingMilestones: upcomingMilestones.slice(0, 10),
      overdueMilestones: overdueMilestones.slice(0, 10),
      completedMilestones,
      kpis: {
        onTimeDelivery,
        budgetUtilization,
        qualityScore: 85, // Placeholder - would be calculated from quality metrics
        teamEfficiency,
      }
    };

    res.json({
      message: "Données de progression récupérées avec succès",
      data: progressData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la progression"
    });
  }
});

// POST /api/projects/:projectId/milestones/:milestoneId/complete - Complete a milestone
router.post('/:projectId/milestones/:milestoneId/complete', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const milestoneId = req.params.milestoneId;
    const { notes, completedAt } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // If it's a phase milestone
    if (milestoneId.startsWith('phase-')) {
      const phaseId = parseInt(milestoneId.replace('phase-', ''));
      const updatedPhase = await storage.updateProjectPhase(phaseId, {
        status: 'completed',
        actualEndDate: new Date(completedAt || new Date()),
        progressPercentage: 100,
        completionNotes: notes,
      });

      if (updatedPhase) {
        // Update project progress
        const allPhases = await storage.getProjectPhasesByProject(projectId);
        const completedPhases = allPhases.filter(p => p.status === 'completed').length;
        const totalPhases = allPhases.length;
        const projectProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

        await storage.updateActiveProject(projectId, { progress: projectProgress });

        // Create notification
        await storage.createEnhancedNotification({
          userId: 1, // System notification
          title: 'Jalon terminé',
          message: `Le jalon "${updatedPhase.name}" a été terminé avec succès`,
          type: 'success',
          category: 'project',
          priority: 'medium',
          metadata: { projectId, phaseId },
          isRead: false,
        } as any);
      }

      res.json({
        message: "Jalon de phase terminé avec succès",
        milestone: updatedPhase
      });
    }
    // If it's a task milestone
    else if (milestoneId.startsWith('task-')) {
      const taskId = parseInt(milestoneId.replace('task-', ''));
      const updatedTask = await storage.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(completedAt || new Date()),
        notes: notes || '',
      });

      if (updatedTask) {
        // Create notification
        await storage.createEnhancedNotification({
          userId: 1, // System notification
          title: 'Tâche importante terminée',
          message: `La tâche "${updatedTask.name}" a été terminée avec succès`,
          type: 'success',
          category: 'project',
          priority: 'medium',
          metadata: { projectId, taskId },
          isRead: false,
        } as any);
      }

      res.json({
        message: "Jalon de tâche terminé avec succès",
        milestone: updatedTask
      });
    }
    else {
      return res.status(400).json({
        message: "Type de jalon invalide"
      });
    }
  } catch (error) {
    console.error('Erreur lors de la finalisation du jalon:', error);
    res.status(500).json({
      message: "Erreur lors de la finalisation du jalon"
    });
  }
});

// GET /api/projects/:projectId/milestones/upcoming - Get upcoming milestones with notifications
router.get('/:projectId/milestones/upcoming', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { days = 7 } = req.query;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days as string));

    // Get phases and tasks
    const [phases, tasks] = await Promise.all([
      storage.getProjectPhasesByProject(projectId),
      storage.getTasks(projectId)
    ]);

    const upcomingMilestones = [];

    // Check phase milestones
    phases.forEach(phase => {
      if (phase.status !== 'completed' && phase.plannedEndDate) {
        const phaseEndDate = new Date(phase.plannedEndDate);
        if (phaseEndDate <= futureDate) {
          upcomingMilestones.push({
            id: `phase-${phase.id}`,
            name: `Fin de phase: ${phase.name}`,
            targetDate: phase.plannedEndDate,
            type: 'phase',
            priority: phase.priority || 'medium',
            daysUntil: Math.ceil((phaseEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });

    // Check important task milestones
    tasks.forEach(task => {
      if (task.status !== 'completed' && (task.priority === 'urgent' || task.priority === 'high')) {
        const taskEndDate = new Date(task.endDate);
        if (taskEndDate <= futureDate) {
          upcomingMilestones.push({
            id: `task-${task.id}`,
            name: task.name,
            targetDate: task.endDate,
            type: 'task',
            priority: task.priority,
            assignedTo: task.assignedToName,
            daysUntil: Math.ceil((taskEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });

    // Sort by target date
    upcomingMilestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

    res.json({
      message: "Jalons à venir récupérés avec succès",
      data: upcomingMilestones
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons à venir:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des jalons à venir"
    });
  }
});

// POST /api/projects/:projectId/progress/auto-update - Auto-update project progress
router.post('/:projectId/progress/auto-update', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Get current project state
    const [project, phases, tasks] = await Promise.all([
      storage.getActiveProject(projectId),
      storage.getProjectPhasesByProject(projectId),
      storage.getTasks(projectId)
    ]);

    if (!project) {
      return res.status(404).json({
        message: "Projet non trouvé"
      });
    }

    // Calculate overall progress based on phases and tasks
    const phaseProgress = phases.length > 0 
      ? phases.reduce((sum, phase) => sum + (phase.progressPercentage || 0), 0) / phases.length
      : 0;

    const taskProgress = tasks.length > 0
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length
      : 0;

    const overallProgress = Math.round((phaseProgress + taskProgress) / 2);

    // Update project progress
    const updatedProject = await storage.updateActiveProject(projectId, {
      progress: overallProgress,
      updatedAt: new Date(),
    });

    // Check for milestone achievements and send notifications
    const completedPhases = phases.filter(p => p.status === 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Create progress update notification
    if (overallProgress > (project.progress || 0)) {
      await storage.createEnhancedNotification({
        userId: 1,
        title: 'Progression du projet mise à jour',
        message: `Le projet "${project.name}" est maintenant à ${overallProgress}% d'achèvement`,
        type: 'info',
        category: 'project',
        priority: 'low',
        metadata: { 
          projectId, 
          oldProgress: project.progress || 0, 
          newProgress: overallProgress 
        },
        isRead: false,
      } as any);
    }

    res.json({
      message: "Progression mise à jour automatiquement",
      data: {
        project: updatedProject,
        progress: {
          overall: overallProgress,
          phases: phaseProgress,
          tasks: taskProgress,
          completedPhases: completedPhases.length,
          completedTasks: completedTasks.length,
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour automatique:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour automatique"
    });
  }
});

export default router;
