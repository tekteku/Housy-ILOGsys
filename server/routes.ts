import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProjectSchema,
  insertTaskSchema, 
  insertResourceSchema,
  insertProjectEstimationSchema
} from "@shared/schema";
import { projectService } from "./services/project-service";
import { materialService } from "./services/material-service";
import { reportService } from "./services/report-service";
import { aiService } from "./services/ai-service";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Handle Zod validation errors
  const validateRequest = (schema: any) => (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      } else {
        next(error);
      }
    }
  };
  
  // ==== User Routes ====
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/users", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error: (error as Error).message });
    }
  });
  
  // ==== Project Routes ====
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects", error: (error as Error).message });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await projectService.getProjectDetails(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project", error: (error as Error).message });
    }
  });
  
  app.post("/api/projects", validateRequest(insertProjectSchema), async (req, res) => {
    try {
      // In a real app, we would get userId from authentication
      const userId = req.body.createdBy;
      const project = await projectService.createProject(req.body, userId);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error creating project", error: (error as Error).message });
    }
  });
  
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // In a real app, we would get userId from authentication
      const userId = req.body.updatedBy || 1;
      const updatedProject = await projectService.updateProject(projectId, req.body, userId);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Error updating project", error: (error as Error).message });
    }
  });
  
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // In a real app, we would get userId from authentication
      const userId = 1;
      await projectService.deleteProject(projectId, userId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting project", error: (error as Error).message });
    }
  });
  
  // ==== Task Routes ====
  app.get("/api/projects/:projectId/tasks", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const tasks = await storage.getTasks(projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error: (error as Error).message });
    }
  });
  
  app.post("/api/tasks", validateRequest(insertTaskSchema), async (req, res) => {
    try {
      // In a real app, we would get userId from authentication
      const userId = 1;
      const task = await projectService.createTask(req.body, userId);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Error creating task", error: (error as Error).message });
    }
  });
  
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      // In a real app, we would get userId from authentication
      const userId = 1;
      const updatedTask = await projectService.updateTask(taskId, req.body, userId);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task", error: (error as Error).message });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      // In a real app, we would get userId from authentication
      const userId = 1;
      await projectService.deleteTask(taskId, userId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error: (error as Error).message });
    }
  });
  
  // ==== Resource Routes ====
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Error fetching resources", error: (error as Error).message });
    }
  });
  
  app.post("/api/resources", validateRequest(insertResourceSchema), async (req, res) => {
    try {
      const resource = await storage.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Error creating resource", error: (error as Error).message });
    }
  });
  
  app.post("/api/tasks/:taskId/resources/:resourceId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const resourceId = parseInt(req.params.resourceId);
      const { allocationPercentage, startDate, endDate } = req.body;
      
      // In a real app, we would get userId from authentication
      const userId = 1;
      
      const result = await projectService.assignResourceToTask(
        taskId,
        resourceId,
        allocationPercentage,
        new Date(startDate),
        new Date(endDate),
        userId
      );
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ 
        message: "Error assigning resource to task", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== Material Routes ====
  app.get("/api/materials", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      if (category) {
        const materials = await storage.getMaterialsByCategory(category);
        res.json(materials);
      } else {
        const materials = await storage.getMaterials();
        res.json(materials);
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching materials", error: (error as Error).message });
    }
  });
  
  app.get("/api/materials/trends", async (req, res) => {
    try {
      const materialIds = (req.query.ids as string).split(',').map(id => parseInt(id));
      const months = req.query.months ? parseInt(req.query.months as string) : 6;
      
      const trends = await materialService.getMaterialPriceTrends(materialIds, months);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching material price trends", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/materials/compare", async (req, res) => {
    try {
      const { materialNames } = req.body;
      
      if (!Array.isArray(materialNames) || materialNames.length === 0) {
        return res.status(400).json({ message: "materialNames array is required" });
      }
      
      const comparison = await materialService.compareMaterialPrices(materialNames);
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ 
        message: "Error comparing material prices", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/materials/import", async (req, res) => {
    try {
      // In a real app, would handle file upload
      // Here we'll use the provided CSV file directly
      const csvPath = path.resolve(import.meta.dirname, "..", "attached_assets", "tunisia_construction_materials v1.csv");
      
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ message: "CSV file not found" });
      }
      
      const importedMaterials = await materialService.importMaterialsFromCsv(csvPath);
      res.json({ 
        message: "Materials imported successfully", 
        count: importedMaterials.length 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error importing materials", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== Material Estimation Routes ====
  app.post("/api/estimation/calculate", async (req, res) => {
    try {
      const { 
        projectType, 
        area, 
        floors, 
        qualityLevel, 
        includeWastage 
      } = req.body;
      
      if (!projectType || !area || !qualityLevel) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const estimation = await materialService.calculateMaterialEstimation(
        projectType,
        parseFloat(area),
        parseInt(floors || 1),
        qualityLevel,
        includeWastage === undefined ? true : includeWastage
      );
      
      res.json(estimation);
    } catch (error) {
      res.status(500).json({ 
        message: "Error calculating material estimation", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/estimation/save", validateRequest(insertProjectEstimationSchema), async (req, res) => {
    try {
      const savedEstimation = await storage.createProjectEstimation(req.body);
      res.status(201).json(savedEstimation);
    } catch (error) {
      res.status(500).json({ 
        message: "Error saving estimation", 
        error: (error as Error).message 
      });
    }
  });
  
  app.get("/api/estimation/history", async (req, res) => {
    try {
      const projectId = req.query.projectId 
        ? parseInt(req.query.projectId as string) 
        : undefined;
      
      const estimations = await storage.getProjectEstimations(projectId);
      res.json(estimations);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching estimation history", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== Report Generation Routes ====
  app.post("/api/reports/project", async (req, res) => {
    try {
      const { projectId, format } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const reportResult = await reportService.generateProjectProgressReport(
        parseInt(projectId),
        format || 'pdf'
      );
      
      // In a real app, we would stream the file to the client
      // Here we just return the path and filename
      res.json({
        message: "Report generated successfully",
        ...reportResult
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error generating project report", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/reports/materials", async (req, res) => {
    try {
      const { estimationId, format } = req.body;
      
      if (!estimationId) {
        return res.status(400).json({ message: "Estimation ID is required" });
      }
      
      const reportResult = await reportService.generateMaterialsCostReport(
        parseInt(estimationId),
        format || 'pdf'
      );
      
      res.json({
        message: "Report generated successfully",
        ...reportResult
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error generating materials report", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/reports/market", async (req, res) => {
    try {
      const { filters, format } = req.body;
      
      const reportResult = await reportService.generateMarketAnalysisReport(
        filters || {},
        format || 'pdf'
      );
      
      res.json({
        message: "Report generated successfully",
        ...reportResult
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error generating market analysis report", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== Real Estate Market Data Routes ====
  app.get("/api/real-estate", async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string | undefined,
        propertyType: req.query.propertyType as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minArea: req.query.minArea ? parseFloat(req.query.minArea as string) : undefined,
        maxArea: req.query.maxArea ? parseFloat(req.query.maxArea as string) : undefined
      };
      
      const listings = await storage.getRealEstateListings(filters);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching real estate listings", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/real-estate/import", async (req, res) => {
    try {
      // In a real app, would handle file upload
      // Here we'll use the provided CSV file directly
      const csvPath = path.resolve(import.meta.dirname, "..", "attached_assets", "tunisia_geo_enhanced_20250427_2133101.csv");
      
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ message: "CSV file not found" });
      }
      
      // For this implementation, we'll just return success without actually importing
      // In a real app, this would parse and import the data
      res.json({ 
        message: "Real estate data import initiated", 
        status: "processing" 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error importing real estate data", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== AI Integration Routes ====
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Use provided sessionId or generate a new one
      const sessionId = req.body.sessionId || nanoid();
      
      const response = await aiService.processChatMessage(
        sessionId,
        userId || null,
        message
      );
      
      res.json({
        response,
        sessionId
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error processing chat message", 
        error: (error as Error).message 
      });
    }
  });
  
  app.get("/api/ai/chat/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching chat history", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/ai/analyze/materials", async (req, res) => {
    try {
      // In a real app, this would accept uploaded data or use stored data
      // Here we'll use a sample from the materials CSV
      const csvPath = path.resolve(import.meta.dirname, "..", "attached_assets", "tunisia_construction_materials v1.csv");
      
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ message: "CSV file not found" });
      }
      
      // Read a few lines from the CSV to simulate data
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n').slice(0, 20); // Take first 20 lines
      
      // Parse CSV (simplified)
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const record: Record<string, any> = {};
        headers.forEach((header, index) => {
          record[header.trim()] = values[index]?.trim();
        });
        return record;
      });
      
      const analysis = await aiService.analyzeCsvData(data, 'material_prices');
      
      res.json({
        message: "Analysis completed",
        result: analysis
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error analyzing materials data", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/ai/market-trends", async (req, res) => {
    try {
      // In a real app, this would use stored real estate data
      // Here we'll simulate with sample data
      const sampleData = [
        {
          id: "prop1",
          title: "Appartement à Tunis",
          price: 350000,
          area: 120,
          rooms: "3",
          propertyType: "apartment",
          city: "Tunis",
          governorate: "Tunis"
        },
        {
          id: "prop2",
          title: "Villa à La Marsa",
          price: 950000,
          area: 250,
          rooms: "5",
          propertyType: "villa",
          city: "La Marsa",
          governorate: "Tunis"
        },
        {
          id: "prop3",
          title: "Appartement à Sousse",
          price: 280000,
          area: 95,
          rooms: "2",
          propertyType: "apartment",
          city: "Sousse",
          governorate: "Sousse"
        }
      ];
      
      const analysis = await aiService.analyzeMarketTrends(sampleData);
      
      res.json({
        message: "Market trend analysis completed",
        result: analysis
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error analyzing market trends", 
        error: (error as Error).message 
      });
    }
  });
  
  app.post("/api/ai/price-prediction", async (req, res) => {
    try {
      // In a real app, this would use historical data from the database
      // Here we'll simulate with sample data
      const sampleData = [
        {
          propertyType: "apartment",
          city: "Tunis",
          area: 120,
          price: 350000,
          date: "2024-01-01"
        },
        {
          propertyType: "apartment",
          city: "Tunis",
          area: 125,
          price: 365000,
          date: "2024-02-01"
        },
        {
          propertyType: "villa",
          city: "La Marsa",
          area: 250,
          price: 950000,
          date: "2024-01-01"
        },
        {
          propertyType: "villa",
          city: "La Marsa",
          area: 260,
          price: 985000,
          date: "2024-02-01"
        }
      ];
      
      const prediction = await aiService.predictPrices(sampleData);
      
      res.json({
        message: "Price prediction completed",
        result: prediction
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error predicting prices", 
        error: (error as Error).message 
      });
    }
  });
  
  // ==== Activity & Notification Routes ====
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const activities = await projectService.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching activities", 
        error: (error as Error).message 
      });
    }
  });
  
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching notifications", 
        error: (error as Error).message 
      });
    }
  });
  
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ 
        message: "Error marking notification as read", 
        error: (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
