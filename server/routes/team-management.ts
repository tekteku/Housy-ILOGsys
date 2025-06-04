import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// GET /api/projects/:projectId/team - Get project team with member details
router.get('/:projectId/team', async (req, res) => {
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

    // Get project tasks to calculate member performance
    const tasks = await storage.getTasks(projectId);

    // Mock team data - In real implementation, this would come from a team members table
    const teamMembers = [
      {
        id: 1,
        userId: 1,
        name: "Mohammed Trabelsi",
        email: "mohammed.trabelsi@housy.tn",
        phone: "+216 22 123 456",
        role: "Chef de projet",
        position: "Project Manager",
        joinDate: "2024-01-15T00:00:00Z",
        status: "active",
        avatar: null,
        skills: ["Gestion de projet", "Leadership", "Planning"],
        workload: 85,
        availability: "busy",
        currentTasks: tasks.filter(t => t.assignedTo === 'user1' && t.status !== 'completed').length,
        completedTasks: tasks.filter(t => t.assignedTo === 'user1' && t.status === 'completed').length,
        performance: {
          rating: 4.8,
          onTimeDelivery: 95,
          qualityScore: 92,
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        permissions: ["project.manage", "team.manage", "tasks.assign"]
      },
      {
        id: 2,
        userId: 2,
        name: "Ahmed Ben Ali",
        email: "ahmed.benali@housy.tn",
        phone: "+216 22 234 567",
        role: "Architecte",
        position: "Senior Architect",
        joinDate: "2024-02-01T00:00:00Z",
        status: "active",
        avatar: null,
        skills: ["Architecture", "AutoCAD", "Design", "BIM"],
        workload: 70,
        availability: "available",
        currentTasks: tasks.filter(t => t.assignedTo === 'user2' && t.status !== 'completed').length,
        completedTasks: tasks.filter(t => t.assignedTo === 'user2' && t.status === 'completed').length,
        performance: {
          rating: 4.6,
          onTimeDelivery: 88,
          qualityScore: 95,
        },
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        permissions: ["project.view", "tasks.manage", "documents.upload"]
      },
      {
        id: 3,
        userId: 3,
        name: "Fatima Kassem",
        email: "fatima.kassem@housy.tn",
        phone: "+216 22 345 678",
        role: "Ingénieur",
        position: "Construction Engineer",
        joinDate: "2024-03-10T00:00:00Z",
        status: "active",
        avatar: null,
        skills: ["Génie civil", "Calcul structures", "Supervision chantier"],
        workload: 60,
        availability: "available",
        currentTasks: tasks.filter(t => t.assignedTo === 'user3' && t.status !== 'completed').length,
        completedTasks: tasks.filter(t => t.assignedTo === 'user3' && t.status === 'completed').length,
        performance: {
          rating: 4.4,
          onTimeDelivery: 82,
          qualityScore: 88,
        },
        lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        permissions: ["project.view", "tasks.manage", "quality.control"]
      },
      {
        id: 4,
        userId: 4,
        name: "Karim Hajji",
        email: "karim.hajji@housy.tn",
        phone: "+216 22 456 789",
        role: "Contremaître",
        position: "Site Supervisor",
        joinDate: "2024-01-20T00:00:00Z",
        status: "active",
        avatar: null,
        skills: ["Supervision", "Sécurité chantier", "Coordination équipes"],
        workload: 90,
        availability: "busy",
        currentTasks: tasks.filter(t => t.assignedTo === 'user4' && t.status !== 'completed').length,
        completedTasks: tasks.filter(t => t.assignedTo === 'user4' && t.status === 'completed').length,
        performance: {
          rating: 4.3,
          onTimeDelivery: 90,
          qualityScore: 85,
        },
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        permissions: ["project.view", "tasks.execute", "safety.manage"]
      },
      {
        id: 5,
        userId: 5,
        name: "Sonia Bourguiba",
        email: "sonia.bourguiba@housy.tn",
        phone: "+216 22 567 890",
        role: "Comptable",
        position: "Project Accountant",
        joinDate: "2024-02-15T00:00:00Z",
        status: "active",
        avatar: null,
        skills: ["Comptabilité", "Gestion budgets", "Facturation"],
        workload: 45,
        availability: "available",
        currentTasks: 0, // Accounting tasks not tracked in this system
        completedTasks: 0,
        performance: {
          rating: 4.7,
          onTimeDelivery: 98,
          qualityScore: 96,
        },
        lastActivity: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        permissions: ["project.view", "finance.manage", "reports.generate"]
      }
    ];

    // Calculate team statistics
    const averageWorkload = Math.round(
      teamMembers.reduce((sum, member) => sum + member.workload, 0) / teamMembers.length
    );

    const averagePerformance = Math.round(
      (teamMembers.reduce((sum, member) => sum + member.performance.rating, 0) / teamMembers.length) * 10
    ) / 10;

    const teamData = {
      members: teamMembers,
      averageWorkload,
      averagePerformance,
      totalMembers: teamMembers.length,
      activeMembers: teamMembers.filter(m => m.status === 'active').length,
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        averageOnTimeDelivery: Math.round(
          teamMembers.reduce((sum, member) => sum + member.performance.onTimeDelivery, 0) / teamMembers.length
        ),
        averageQualityScore: Math.round(
          teamMembers.reduce((sum, member) => sum + member.performance.qualityScore, 0) / teamMembers.length
        ),
      }
    };

    res.json({
      message: "Équipe du projet récupérée avec succès",
      data: teamData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipe:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'équipe"
    });
  }
});

// POST /api/projects/:projectId/team - Add team member
router.post('/:projectId/team', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const memberData = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Validate required fields
    const { name, email, role, position } = memberData;
    if (!name || !email || !role || !position) {
      return res.status(400).json({
        message: "Nom, email, rôle et poste sont requis"
      });
    }

    // In a real implementation, this would create a new team member record
    const newMember = {
      id: Date.now(), // Mock ID
      userId: Date.now(),
      projectId,
      ...memberData,
      joinDate: new Date().toISOString(),
      status: 'active',
      currentTasks: 0,
      completedTasks: 0,
      performance: {
        rating: 4.0,
        onTimeDelivery: 85,
        qualityScore: 85,
      },
      lastActivity: new Date().toISOString(),
      permissions: ["project.view"]
    };

    // Create notification for team addition
    await storage.createEnhancedNotification({
      userId: 1,
      title: 'Nouveau membre d\'équipe',
      message: `${name} a été ajouté à l'équipe du projet`,
      type: 'info',
      category: 'team',
      priority: 'medium',
      metadata: { projectId, memberId: newMember.id },
      isRead: false,
    } as any);

    res.status(201).json({
      message: "Membre ajouté à l'équipe avec succès",
      data: newMember
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    res.status(500).json({
      message: "Erreur lors de l'ajout du membre à l'équipe"
    });
  }
});

// PATCH /api/projects/:projectId/team/:memberId - Update team member
router.patch('/:projectId/team/:memberId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const memberId = parseInt(req.params.memberId);
    const updates = req.body;
    
    if (isNaN(projectId) || isNaN(memberId)) {
      return res.status(400).json({
        message: "ID de projet ou membre invalide"
      });
    }

    // In a real implementation, this would update the team member record
    const updatedMember = {
      id: memberId,
      projectId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Create notification for status changes
    if (updates.status) {
      const statusMessages = {
        'active': 'est maintenant actif',
        'inactive': 'a été désactivé',
        'on_leave': 'est en congé'
      };

      await storage.createEnhancedNotification({
        userId: 1,
        title: 'Statut membre mis à jour',
        message: `Le membre d'équipe ${statusMessages[updates.status] || 'a changé de statut'}`,
        type: 'info',
        category: 'team',
        priority: 'low',
        metadata: { projectId, memberId, newStatus: updates.status },
        isRead: false,
      } as any);
    }

    res.json({
      message: "Membre mis à jour avec succès",
      data: updatedMember
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du membre"
    });
  }
});

// DELETE /api/projects/:projectId/team/:memberId - Remove team member
router.delete('/:projectId/team/:memberId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const memberId = parseInt(req.params.memberId);
    
    if (isNaN(projectId) || isNaN(memberId)) {
      return res.status(400).json({
        message: "ID de projet ou membre invalide"
      });
    }

    // In a real implementation, this would remove the team member record
    // For now, we'll just acknowledge the removal

    // Create notification for team member removal
    await storage.createEnhancedNotification({
      userId: 1,
      title: 'Membre retiré de l\'équipe',
      message: `Un membre a été retiré de l'équipe du projet`,
      type: 'warning',
      category: 'team',
      priority: 'medium',
      metadata: { projectId, memberId },
      isRead: false,
    } as any);

    res.json({
      message: "Membre retiré de l'équipe avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du membre"
    });
  }
});

// GET /api/team/roles - Get available team roles
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      {
        id: 'project_manager',
        name: 'Chef de projet',
        description: 'Responsable de la gestion globale du projet',
        permissions: ['project.manage', 'team.manage', 'tasks.assign', 'budget.manage'],
        color: 'bg-blue-100 text-blue-800'
      },
      {
        id: 'architect',
        name: 'Architecte',
        description: 'Conception et supervision architecturale',
        permissions: ['project.view', 'tasks.manage', 'documents.upload', 'design.approve'],
        color: 'bg-purple-100 text-purple-800'
      },
      {
        id: 'engineer',
        name: 'Ingénieur',
        description: 'Ingénierie et calculs techniques',
        permissions: ['project.view', 'tasks.manage', 'quality.control', 'technical.approve'],
        color: 'bg-green-100 text-green-800'
      },
      {
        id: 'supervisor',
        name: 'Contremaître',
        description: 'Supervision du chantier et des équipes',
        permissions: ['project.view', 'tasks.execute', 'safety.manage', 'team.supervise'],
        color: 'bg-orange-100 text-orange-800'
      },
      {
        id: 'accountant',
        name: 'Comptable',
        description: 'Gestion financière et comptable',
        permissions: ['project.view', 'finance.manage', 'reports.generate', 'budget.view'],
        color: 'bg-indigo-100 text-indigo-800'
      },
      {
        id: 'technician',
        name: 'Technicien',
        description: 'Exécution des tâches techniques',
        permissions: ['project.view', 'tasks.execute', 'materials.manage'],
        color: 'bg-gray-100 text-gray-800'
      },
      {
        id: 'quality_controller',
        name: 'Contrôleur qualité',
        description: 'Contrôle et assurance qualité',
        permissions: ['project.view', 'quality.control', 'inspection.manage', 'reports.quality'],
        color: 'bg-red-100 text-red-800'
      },
      {
        id: 'safety_officer',
        name: 'Responsable sécurité',
        description: 'Sécurité du chantier et prévention',
        permissions: ['project.view', 'safety.manage', 'incident.report', 'training.safety'],
        color: 'bg-yellow-100 text-yellow-800'
      }
    ];

    res.json({
      message: "Rôles d'équipe récupérés avec succès",
      data: roles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des rôles"
    });
  }
});

// GET /api/projects/:projectId/team/workload - Get team workload analysis
router.get('/:projectId/team/workload', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    // Get tasks for workload calculation
    const tasks = await storage.getTasks(projectId);
    
    // Mock workload analysis based on tasks
    const workloadAnalysis = {
      overloaded: [ // >80% workload
        {
          memberId: 1,
          name: "Mohammed Trabelsi",
          workload: 85,
          tasks: tasks.filter(t => t.assignedTo === 'user1').length,
          recommendation: "Déléguer certaines tâches administratives"
        },
        {
          memberId: 4,
          name: "Karim Hajji", 
          workload: 90,
          tasks: tasks.filter(t => t.assignedTo === 'user4').length,
          recommendation: "Ajouter un assistant contremaître"
        }
      ],
      balanced: [ // 40-80% workload
        {
          memberId: 2,
          name: "Ahmed Ben Ali",
          workload: 70,
          tasks: tasks.filter(t => t.assignedTo === 'user2').length,
          status: "Charge de travail optimale"
        },
        {
          memberId: 3,
          name: "Fatima Kassem",
          workload: 60,
          tasks: tasks.filter(t => t.assignedTo === 'user3').length,
          status: "Peut prendre des tâches supplémentaires"
        }
      ],
      underutilized: [ // <40% workload
        {
          memberId: 5,
          name: "Sonia Bourguiba",
          workload: 45,
          tasks: 0,
          recommendation: "Peut être affectée à d'autres projets"
        }
      ],
      summary: {
        averageWorkload: 70,
        balancedMembers: 2,
        overloadedMembers: 2,
        underutilizedMembers: 1,
        recommendations: [
          "Redistributer les tâches des membres surchargés",
          "Former des équipes plus équilibrées",
          "Considérer l'ajout de ressources pour les rôles critiques"
        ]
      }
    };

    res.json({
      message: "Analyse de charge de travail récupérée avec succès",
      data: workloadAnalysis
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse de charge:', error);
    res.status(500).json({
      message: "Erreur lors de l'analyse de charge de travail"
    });
  }
});

// POST /api/projects/:projectId/team/reassign - Reassign tasks between team members
router.post('/:projectId/team/reassign', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { fromMemberId, toMemberId, taskIds } = req.body;
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        message: "ID de projet invalide"
      });
    }

    if (!fromMemberId || !toMemberId || !Array.isArray(taskIds)) {
      return res.status(400).json({
        message: "Paramètres de réassignation invalides"
      });
    }

    // In a real implementation, this would update task assignments
    const reassignmentResult = {
      reassignedTasks: taskIds.length,
      fromMember: fromMemberId,
      toMember: toMemberId,
      newWorkloadDistribution: {
        [fromMemberId]: 65, // Reduced workload
        [toMemberId]: 75,   // Increased workload
      }
    };

    // Create notification for task reassignment
    await storage.createEnhancedNotification({
      userId: 1,
      title: 'Tâches réassignées',
      message: `${taskIds.length} tâche(s) ont été réassignées entre les membres de l'équipe`,
      type: 'info',
      category: 'team',
      priority: 'medium',
      metadata: { projectId, fromMemberId, toMemberId, taskCount: taskIds.length },
      isRead: false,
    } as any);

    res.json({
      message: "Tâches réassignées avec succès",
      data: reassignmentResult
    });
  } catch (error) {
    console.error('Erreur lors de la réassignation:', error);
    res.status(500).json({
      message: "Erreur lors de la réassignation des tâches"
    });
  }
});

export default router;
