import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/use-notification";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
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
import { PageTransition, FadeIn, StaggeredList, AnimatedButton } from "@/components/animations";

const Dashboard = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { showNotification } = useNotification();
  
  // Set document title
  useEffect(() => {
    document.title = "Tableau de bord | Housy";
  }, []);

  // Fonction pour gérer la création d'une nouvelle demande
  const handleNewProjectRequest = () => {
    navigate('/client/request');
    showNotification({
      title: "Nouvelle demande",
      description: "Remplissez le formulaire pour créer votre demande de projet"
    });
  };

  // Show role-specific dashboard
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  // Fallback to original dashboard if role is not recognized
  return (
    <PageTransition>
      <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
        {/* Header with Actions */}
        <FadeIn direction="down" delay={0.1}>
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
              <AnimatedButton variant="secondary" size="md">
                <i className="fas fa-download mr-2"></i>
                Rapports
              </AnimatedButton>
              <AnimatedButton 
                variant="primary" 
                size="md" 
                onClick={handleNewProjectRequest}
                className="hover:scale-[1.02] transition-transform duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Nouvelle demande
              </AnimatedButton>
            </div>
          </div>
        </FadeIn>

        {/* Project Overview Stats */}
        <FadeIn direction="up" delay={0.2}>
          <StatCardsSection />
        </FadeIn>
        
        {/* Dashboard Cards Grid - New mixed layout */}
        <FadeIn direction="up" delay={0.3}>
          <DashboardCardsGrid />
        </FadeIn>
        
        {/* Chart Analysis Section */}
        <FadeIn direction="up" delay={0.4}>
          <ChartCardsSection />
        </FadeIn>
        
        {/* Budget Comparison Section */}
        <FadeIn direction="up" delay={0.5}>
          <BudgetComparisonSection />
        </FadeIn>
        
        {/* Detailed Project Stats */}
        <FadeIn direction="up" delay={0.6}>
          <ProjectStats />
        </FadeIn>

        {/* Project Timeline (Gantt Chart) */}
        <FadeIn direction="up" delay={0.7}>
          <GanttChart />
        </FadeIn>

        {/* Material Estimation & Market Trends Section */}
        <StaggeredList staggerDelay={0.2} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <MaterialCalculator />
          <MarketTrends />
        </StaggeredList>

        {/* Project Resources & Real Estate Analysis Section */}
        <StaggeredList staggerDelay={0.15} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <RecentActivityEnhanced />
          <ProjectResources />
          <RealEstateAnalysis />
        </StaggeredList>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
