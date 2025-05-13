import { storage } from "../storage";
import { Project, Task, Material, ProjectEstimation } from "@shared/schema";
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import * as os from 'os';

// Mock implementation for PDF generation (would use PDF libraries like PDFKit in a real app)
async function generatePdfReport(data: any, reportType: string): Promise<{ filePath: string, filename: string }> {
  try {
    // In a real app, we would use PDFKit to generate PDF
    // Here we'll just create a JSON file as a placeholder
    const tempDir = os.tmpdir();
    const filename = `report_${reportType}_${Date.now()}.json`;
    const filePath = path.join(tempDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return { filePath, filename };
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error;
  }
}

// Mock implementation for Excel generation (would use libraries like ExcelJS in a real app)
async function generateExcelReport(data: any, reportType: string): Promise<{ filePath: string, filename: string }> {
  try {
    // In a real app, we would use ExcelJS to generate Excel file
    // Here we'll just create a JSON file as a placeholder
    const tempDir = os.tmpdir();
    const filename = `report_${reportType}_${Date.now()}.json`;
    const filePath = path.join(tempDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    return { filePath, filename };
  } catch (error) {
    console.error("Error generating Excel report:", error);
    throw error;
  }
}

export class ReportService {
  // Generate project progress report
  async generateProjectProgressReport(
    projectId: number, 
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<{ filePath: string, filename: string }> {
    try {
      // Get project data
      const project = await storage.getProject(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      // Get tasks for the project
      const tasks = await storage.getTasks(projectId);
      
      // Calculate project statistics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const delayedTasks = tasks.filter(task => {
        const now = new Date();
        return new Date(task.endDate) < now && task.status !== 'completed';
      }).length;
      
      // Calculate progress percentage
      const progressPercentage = totalTasks > 0 
        ? (completedTasks / totalTasks) * 100 
        : 0;
      
      // Prepare report data
      const reportData = {
        reportType: 'Project Progress',
        generatedAt: new Date(),
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          clientName: project.clientName,
          location: project.location,
          startDate: project.startDate,
          endDate: project.endDate,
          budget: project.budget,
          progress: progressPercentage.toFixed(2) + '%'
        },
        statistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          delayedTasks,
          completionRate: totalTasks > 0 
            ? ((completedTasks / totalTasks) * 100).toFixed(2) + '%' 
            : '0%'
        },
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.name,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          status: task.status,
          progress: task.progress.toFixed(2) + '%'
        }))
      };
      
      // Generate report based on requested format
      if (format === 'pdf') {
        return await generatePdfReport(reportData, 'project_progress');
      } else {
        return await generateExcelReport(reportData, 'project_progress');
      }
    } catch (error) {
      console.error("Error generating project progress report:", error);
      throw error;
    }
  }
  
  // Generate materials cost report
  async generateMaterialsCostReport(
    estimationId: number,
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<{ filePath: string, filename: string }> {
    try {
      // Get estimation data
      const estimation = await storage.getProjectEstimation(estimationId);
      
      if (!estimation) {
        throw new Error(`Estimation with ID ${estimationId} not found`);
      }
      
      // Get project if available
      let project = null;
      if (estimation.projectId) {
        project = await storage.getProject(estimation.projectId);
      }
      
      // Prepare report data
      const reportData = {
        reportType: 'Materials Cost Estimation',
        generatedAt: new Date(),
        estimation: {
          id: estimation.id,
          name: estimation.name,
          projectType: estimation.projectType,
          area: estimation.area,
          floors: estimation.floors,
          qualityLevel: estimation.qualityLevel,
          wastageIncluded: estimation.wastageIncluded,
          totalCost: estimation.totalCost,
          createdAt: estimation.createdAt
        },
        project: project ? {
          id: project.id,
          name: project.name,
          location: project.location
        } : null,
        costBreakdown: estimation.costBreakdown,
        materialsList: estimation.materialsList
      };
      
      // Generate report based on requested format
      if (format === 'pdf') {
        return await generatePdfReport(reportData, 'materials_cost');
      } else {
        return await generateExcelReport(reportData, 'materials_cost');
      }
    } catch (error) {
      console.error("Error generating materials cost report:", error);
      throw error;
    }
  }
  
  // Generate real estate market analysis report
  async generateMarketAnalysisReport(
    filters: any,
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<{ filePath: string, filename: string }> {
    try {
      // Get real estate listings based on filters
      const listings = await storage.getRealEstateListings(filters);
      
      if (listings.length === 0) {
        throw new Error('No listings found with the specified filters');
      }
      
      // Calculate statistics
      const prices = listings.map(listing => listing.price);
      const areas = listings.map(listing => listing.area || 0).filter(area => area > 0);
      
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      const averageArea = areas.length > 0 
        ? areas.reduce((a, b) => a + b, 0) / areas.length 
        : 0;
      
      const averagePricePerSqm = areas.length > 0
        ? listings
            .filter(l => l.area && l.area > 0)
            .map(l => l.price / l.area!)
            .reduce((a, b) => a + b, 0) / areas.length
        : 0;
      
      // Count by property type
      const propertyTypeCounts: Record<string, number> = {};
      listings.forEach(listing => {
        const type = listing.propertyType || 'unknown';
        propertyTypeCounts[type] = (propertyTypeCounts[type] || 0) + 1;
      });
      
      // Count by city
      const cityCounts: Record<string, number> = {};
      listings.forEach(listing => {
        const city = listing.city || 'unknown';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      
      // Price ranges distribution
      const priceRanges = [
        { range: '< 200,000 TND', count: 0 },
        { range: '200,000 - 500,000 TND', count: 0 },
        { range: '500,000 - 1,000,000 TND', count: 0 },
        { range: '1,000,000 - 2,000,000 TND', count: 0 },
        { range: '> 2,000,000 TND', count: 0 }
      ];
      
      listings.forEach(listing => {
        if (listing.price < 200000) priceRanges[0].count++;
        else if (listing.price < 500000) priceRanges[1].count++;
        else if (listing.price < 1000000) priceRanges[2].count++;
        else if (listing.price < 2000000) priceRanges[3].count++;
        else priceRanges[4].count++;
      });
      
      // Prepare report data
      const reportData = {
        reportType: 'Real Estate Market Analysis',
        generatedAt: new Date(),
        filters,
        summary: {
          totalListings: listings.length,
          averagePrice,
          minPrice,
          maxPrice,
          averageArea,
          averagePricePerSqm
        },
        distribution: {
          byPropertyType: propertyTypeCounts,
          byCity: cityCounts,
          byPriceRange: priceRanges
        },
        listings: listings.map(l => ({
          id: l.propertyId,
          title: l.title,
          price: l.price,
          area: l.area,
          rooms: l.rooms,
          propertyType: l.propertyType,
          city: l.city,
          governorate: l.governorate,
          url: l.url
        }))
      };
      
      // Generate report based on requested format
      if (format === 'pdf') {
        return await generatePdfReport(reportData, 'market_analysis');
      } else {
        return await generateExcelReport(reportData, 'market_analysis');
      }
    } catch (error) {
      console.error("Error generating market analysis report:", error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
