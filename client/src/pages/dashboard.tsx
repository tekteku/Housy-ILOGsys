import { useEffect } from "react";
import ProjectStats from "@/components/dashboard/ProjectStats";
import GanttChart from "@/components/dashboard/GanttChart";
import MaterialCalculator from "@/components/dashboard/MaterialCalculator";
import MarketTrends from "@/components/dashboard/MarketTrends";
import ProjectResources from "@/components/dashboard/ProjectResources";
import RecentActivityEnhanced from "@/components/dashboard/RecentActivityEnhanced";
import RealEstateAnalysis from "@/components/dashboard/RealEstateAnalysis";
import StatCardsSection from "@/components/dashboard/StatCardsSection";
import ChartCardsSection from "@/components/dashboard/ChartCardsSection";
import BudgetComparisonSection from "@/components/dashboard/BudgetComparisonSection";
import DashboardCardsGrid from "@/components/dashboard/DashboardCardsGrid";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Set document title
  useEffect(() => {
    document.title = "Tableau de bord | Housy";
  }, []);

  return (
    <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#162032]">
            Tableau de bord
          </h1>
          <p className="text-[#b0b8c1] mt-2">
            Vue d'ensemble de vos projets et activités
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center rounded-xl px-6 py-3 text-base">
            <i className="fas fa-download mr-2"></i>
            Rapports
          </Button>
          <Button className="flex items-center rounded-xl px-6 py-3 text-base">
            <i className="fas fa-plus mr-2"></i>
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Project Overview Stats */}
      <StatCardsSection />
      
      {/* Dashboard Cards Grid - New mixed layout */}
      <DashboardCardsGrid />
      
      {/* Chart Analysis Section */}
      <ChartCardsSection />
      
      {/* Budget Comparison Section */}
      <BudgetComparisonSection />
      
      {/* Detailed Project Stats */}
      <ProjectStats />

      {/* Project Timeline (Gantt Chart) */}
      <GanttChart />

      {/* Material Estimation & Market Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <MaterialCalculator />
        <MarketTrends />
      </div>

      {/* Project Resources & Real Estate Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <RecentActivityEnhanced />
        <ProjectResources />
        <RealEstateAnalysis />
      </div>
    </div>
  );
};

export default Dashboard;
