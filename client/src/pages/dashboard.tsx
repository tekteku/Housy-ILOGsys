import { useEffect } from "react";
import ProjectStats from "@/components/dashboard/ProjectStats";
import GanttChart from "@/components/dashboard/GanttChart";
import MaterialCalculator from "@/components/dashboard/MaterialCalculator";
import MarketTrends from "@/components/dashboard/MarketTrends";
import ProjectResources from "@/components/dashboard/ProjectResources";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RealEstateAnalysis from "@/components/dashboard/RealEstateAnalysis";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Set document title
  useEffect(() => {
    document.title = "Tableau de bord | Housy";
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            Tableau de bord
          </h1>
          <p className="text-neutral-500 mt-1">
            Vue d'ensemble de vos projets et activités
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <i className="fas fa-download mr-2"></i>
            Rapports
          </Button>
          <Button className="flex items-center">
            <i className="fas fa-plus mr-2"></i>
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Project Overview Stats */}
      <ProjectStats />

      {/* Project Timeline (Gantt Chart) */}
      <GanttChart />

      {/* Material Estimation & Market Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaterialCalculator />
        <MarketTrends />
      </div>

      {/* Project Resources & Real Estate Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <ProjectResources />
        <RealEstateAnalysis />
      </div>
    </div>
  );
};

export default Dashboard;
