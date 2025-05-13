import { storage } from "../storage";
import { 
  InsertProject, 
  InsertTask, 
  InsertTaskResource, 
  InsertActivityLog,
  Project,
  Task,
  Resource
} from "@shared/schema";

export class ProjectService {
  // Get all projects with summary data
  async getAllProjects(): Promise<any[]> {
    try {
      const projects = await storage.getProjects();
      
      const projectsWithSummary = [];
      
      for (const project of projects) {
        // Get tasks for this project
        const tasks = await storage.getTasks(project.id);
        
        // Calculate summary stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Calculate overdue tasks
        const currentDate = new Date();
        const overdueTasks = tasks.filter(
          task => task.status !== 'completed' && new Date(task.endDate) < currentDate
        ).length;
        
        // Calculate budget status (simplified - in a real app would compute actual expenditures)
        const budgetStatus = {
          total: project.budget,
          spent: project.budget * (project.progress / 100) * (Math.random() * 0.4 + 0.8), // Simplified simulation
          remaining: 0
        };
        budgetStatus.remaining = budgetStatus.total - budgetStatus.spent;
        
        projectsWithSummary.push({
          ...project,
          summary: {
            taskCompletion: Math.round(taskCompletion),
            totalTasks,
            completedTasks,
            overdueTasks,
            budgetStatus
          }
        });
      }
      
      return projectsWithSummary;
    } catch (error) {
      console.error("Error getting all projects:", error);
      throw error;
    }
  }
  
  // Get project details with tasks and resources
  async getProjectDetails(projectId: number): Promise<any> {
    try {
      const project = await storage.getProject(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Get all tasks for this project
      const tasks = await storage.getTasks(projectId);
      
      // Get resources for each task
      const tasksWithResources = [];
      
      for (const task of tasks) {
        const taskResources = await storage.getTaskResources(task.id);
        
        tasksWithResources.push({
          ...task,
          resources: taskResources
        });
      }
      
      // Return full project details
      return {
        ...project,
        tasks: tasksWithResources
      };
    } catch (error) {
      console.error(`Error getting project details for ID ${projectId}:`, error);
      throw error;
    }
  }
  
  // Create new project
  async createProject(projectData: InsertProject, userId: number): Promise<Project> {
    try {
      const newProject = await storage.createProject(projectData);
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'create',
        'project',
        newProject.id,
        { projectName: newProject.name }
      );
      
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }
  
  // Update project
  async updateProject(projectId: number, projectData: Partial<InsertProject>, userId: number): Promise<Project> {
    try {
      const updatedProject = await storage.updateProject(projectId, projectData);
      
      if (!updatedProject) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'update',
        'project',
        projectId,
        { 
          projectName: updatedProject.name,
          updatedFields: Object.keys(projectData).join(', ') 
        }
      );
      
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ID ${projectId}:`, error);
      throw error;
    }
  }
  
  // Delete project
  async deleteProject(projectId: number, userId: number): Promise<boolean> {
    try {
      // Get project name before deletion for activity log
      const project = await storage.getProject(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      const result = await storage.deleteProject(projectId);
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'delete',
        'project',
        projectId,
        { projectName: project.name }
      );
      
      return result;
    } catch (error) {
      console.error(`Error deleting project ID ${projectId}:`, error);
      throw error;
    }
  }
  
  // Create task in a project
  async createTask(taskData: InsertTask, userId: number): Promise<Task> {
    try {
      const newTask = await storage.createTask(taskData);
      
      // Get project name for activity log
      const project = await storage.getProject(taskData.projectId);
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'create',
        'task',
        newTask.id,
        { 
          taskName: newTask.name,
          projectId: taskData.projectId,
          projectName: project?.name || 'Unknown project'
        }
      );
      
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
  
  // Update task
  async updateTask(taskId: number, taskData: Partial<InsertTask>, userId: number): Promise<Task> {
    try {
      const updatedTask = await storage.updateTask(taskId, taskData);
      
      if (!updatedTask) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Get project name for activity log
      const project = await storage.getProject(updatedTask.projectId);
      
      // If status changed to completed, update project progress
      if (taskData.status === 'completed') {
        await this.updateProjectProgress(updatedTask.projectId);
      }
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'update',
        'task',
        taskId,
        { 
          taskName: updatedTask.name,
          projectId: updatedTask.projectId,
          projectName: project?.name || 'Unknown project',
          updatedFields: Object.keys(taskData).join(', ')
        }
      );
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ID ${taskId}:`, error);
      throw error;
    }
  }
  
  // Delete task
  async deleteTask(taskId: number, userId: number): Promise<boolean> {
    try {
      // Get task and project info before deletion for activity log
      const task = await storage.getTask(taskId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      const project = await storage.getProject(task.projectId);
      
      const result = await storage.deleteTask(taskId);
      
      // Update project progress
      await this.updateProjectProgress(task.projectId);
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'delete',
        'task',
        taskId,
        { 
          taskName: task.name,
          projectId: task.projectId,
          projectName: project?.name || 'Unknown project'
        }
      );
      
      return result;
    } catch (error) {
      console.error(`Error deleting task ID ${taskId}:`, error);
      throw error;
    }
  }
  
  // Assign resource to task
  async assignResourceToTask(
    taskId: number, 
    resourceId: number, 
    allocationPercentage: number,
    startDate: Date,
    endDate: Date,
    userId: number
  ): Promise<any> {
    try {
      // Verify task and resource exist
      const task = await storage.getTask(taskId);
      const resource = await storage.getResource(resourceId);
      
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      if (!resource) {
        throw new Error(`Resource with ID ${resourceId} not found`);
      }
      
      // Create assignment
      const assignmentData: InsertTaskResource = {
        taskId,
        resourceId,
        allocationPercentage,
        startDate,
        endDate
      };
      
      const assignment = await storage.assignResourceToTask(assignmentData);
      
      // Get project for activity log
      const project = await storage.getProject(task.projectId);
      
      // Log activity
      await this.logProjectActivity(
        userId,
        'assign',
        'resource',
        assignment.id,
        { 
          taskId,
          taskName: task.name,
          resourceId,
          resourceName: resource.name,
          resourceType: resource.type,
          projectId: task.projectId,
          projectName: project?.name || 'Unknown project',
          allocation: `${allocationPercentage}%`
        }
      );
      
      return {
        assignment,
        task,
        resource
      };
    } catch (error) {
      console.error(`Error assigning resource ${resourceId} to task ${taskId}:`, error);
      throw error;
    }
  }
  
  // Update project progress based on tasks completion
  private async updateProjectProgress(projectId: number): Promise<void> {
    try {
      const tasks = await storage.getTasks(projectId);
      
      if (tasks.length === 0) return;
      
      // Calculate total progress as average of task progress
      const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
      
      // Update project progress
      await storage.updateProject(projectId, { progress: totalProgress });
    } catch (error) {
      console.error(`Error updating project progress for project ${projectId}:`, error);
      throw error;
    }
  }
  
  // Log project activity
  private async logProjectActivity(
    userId: number,
    actionType: string,
    entityType: string,
    entityId: number,
    details: any
  ): Promise<void> {
    try {
      const activityData: InsertActivityLog = {
        userId,
        actionType,
        entityType,
        entityId,
        details,
        timestamp: new Date()
      };
      
      await storage.logActivity(activityData);
    } catch (error) {
      console.error("Error logging project activity:", error);
      // Don't throw here to avoid affecting the main operation
    }
  }
  
  // Get recent project activities
  async getRecentActivities(limit: number = 5): Promise<any[]> {
    try {
      const activities = await storage.getRecentActivities(limit);
      
      // Enrich activities with user, project, and task information
      const enrichedActivities = [];
      
      for (const activity of activities) {
        let enriched = { ...activity };
        
        // Add user info if available
        if (activity.userId) {
          const user = await storage.getUser(activity.userId);
          if (user) {
            enriched.user = {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              avatar: user.avatar
            };
          }
        }
        
        // Add entity info based on type
        if (activity.entityType === 'project' && activity.entityId) {
          const project = await storage.getProject(activity.entityId);
          if (project) {
            enriched.entity = {
              id: project.id,
              name: project.name,
              type: 'project'
            };
          }
        } else if (activity.entityType === 'task' && activity.entityId) {
          const task = await storage.getTask(activity.entityId);
          if (task) {
            const project = await storage.getProject(task.projectId);
            enriched.entity = {
              id: task.id,
              name: task.name,
              type: 'task',
              project: project ? {
                id: project.id,
                name: project.name
              } : undefined
            };
          }
        }
        
        enrichedActivities.push(enriched);
      }
      
      return enrichedActivities;
    } catch (error) {
      console.error("Error getting recent activities:", error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
