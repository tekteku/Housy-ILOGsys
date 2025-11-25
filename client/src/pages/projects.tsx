// filepath: c:\\Users\\TaherCh\\Desktop\\Essay\\Housy\\Housy\\client\\src\\pages\\projects.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getDateDiff, isOverdue } from "@/lib/utils";
import { useNotification } from "@/hooks/use-notification";
import { getEnhancedProjects } from "@/lib/mega-data-service";

// Animation imports
import { PageTransition, FadeIn, StaggeredList, AnimatedButton, InteractiveCardStack } from "@/components/animations";

interface Project {
  id: number;
  name: string;
  description?: string;
  clientName?: string;
  location?: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: string;
  progress: number;
  summary?: {
    taskCompletion: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    budgetStatus: {
      total: number;
      spent: number;
      remaining: number;
    };
  };
}

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{key: keyof Project, direction: 'asc' | 'desc'}>({
    key: 'name',
    direction: 'asc'
  });
  const [location, navigate] = useLocation();

  const { showNotification } = useNotification();

  // Set document title
  useEffect(() => {
    document.title = "Projets | Housy";
  }, []);

  // Fonction pour gérer la création d'une nouvelle demande
  const handleNewProjectRequest = () => {
    navigate('/client/request');
    showNotification({
      title: "Nouvelle demande",
      description: "Remplissez le formulaire pour créer votre demande de projet",
      variant: "info"
    });
  };
  // Fetch projects data using enhanced API
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['enhanced-projects'],
    queryFn: () => getEnhancedProjects(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  console.log('ProjectsPage - isLoading:', isLoading);
  console.log('ProjectsPage - error:', error);
  console.log('ProjectsPage - enhanced projects data:', projects);

  // Filter projects based on search term and status filter
  const filteredProjects = Array.isArray(projects)
    ? projects
        .filter((project: Project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .filter((project: Project) => {
          if (filter === "all") return true;
          return project.status === filter;
        })
    : []; // Default to an empty array if projects is not an array

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
    
  // Handle sort
  const handleSort = (key: keyof Project, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  // Click handler for viewing project
  const handleViewProject = (project: Project) => {
    window.location.href = `/project-details?id=${project.id}`;
  };

  // Table columns configuration
  const columns = [
    {
      header: "Projet",
      accessorKey: "name" as keyof Project,
      sortable: true,
      renderCell: (project: Project) => (
        <div>
          <div className="font-medium">{project.name}</div>
          <div className="text-sm text-neutral-500">
            {project.clientName && `Client: ${project.clientName}`}
            {project.location && `, ${project.location}`}
          </div>
        </div>
      )
    },
    {
      header: "Budget",
      accessorKey: "budget" as keyof Project,
      sortable: true,
      renderCell: (project: Project) => (
        <div>
          <div className="font-medium">
            {formatCurrency(project.budget)}
          </div>
          {project.summary && (
            <div className="text-sm text-neutral-500">
              Dépensé: {formatCurrency(project.summary.budgetStatus.spent)}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Période",
      accessorKey: "startDate" as keyof Project,
      isHiddenOnMobile: true,
      sortable: true,
      renderCell: (project: Project) => (
        <div>
          <div className="text-sm">
            {formatDate(project.startDate)}
            {project.endDate && ` - ${formatDate(project.endDate)}`}
          </div>
          {project.endDate && (
            <div className="text-xs text-neutral-500">
              {getDateDiff(project.startDate, project.endDate)} jours
            </div>
          )}
        </div>
      )
    },
    {
      header: "Tâches",
      accessorKey: "summary" as keyof Project,
      isHiddenOnMobile: true,
      renderCell: (project: Project) => (
        project.summary ? (
          <div>
            <div className="text-sm">
              {project.summary.completedTasks}/{project.summary.totalTasks} terminées
            </div>
            {project.summary.overdueTasks > 0 && (
              <div className="text-xs text-red-500">
                {project.summary.overdueTasks} en retard
              </div>
            )}
          </div>
        ) : (
          "-"
        )
      )
    },
    {
      header: "Statut",
      accessorKey: "status" as keyof Project,
      renderCell: (project: Project) => (
        <StatusBadge status={project.status} />
      )
    },
    {
      header: "Progression",
      accessorKey: "progress" as keyof Project,
      isHiddenOnMobile: true,
      sortable: true,
      renderCell: (project: Project) => (
        <div className="space-y-1">
          <Progress value={project.progress} className="h-2" />
          <div className="text-xs text-neutral-500 text-right">
            {Math.round(project.progress)}%
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Project,
      headerClassName: "text-right",
      cellClassName: "text-right",      renderCell: (project: Project) => (
        <div className="flex justify-end gap-2">
          <AnimatedButton variant="ghost" size="icon" onClick={() => handleViewProject(project)}>
            <i className="fas fa-eye text-neutral-500"></i>
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="icon">
            <i className="fas fa-edit text-neutral-500"></i>
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="icon" className="text-red-500">
            <i className="fas fa-trash"></i>
          </AnimatedButton>
        </div>
      )
    }  ];
  return (
    <PageTransition>
      <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
        {/* Header */}
        <FadeIn direction="down" delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#162032]">
                Projets
              </h1>
              <p className="text-[#b0b8c1] mt-2">
                Liste et gestion de vos projets
              </p>
            </div>
            <div className="flex gap-4">
              <AnimatedButton 
                variant="outline" 
                className="flex items-center rounded-xl px-6 py-3 text-base hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={handleNewProjectRequest}
              >
                <i className="fas fa-plus mr-2"></i>
                Nouvelle demande
              </AnimatedButton>
            </div>
          </div>
        </FadeIn>        
        {/* Search and Filters */}
        <FadeIn direction="up" delay={0.2}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un projet..."
              className="rounded-xl shadow-sm border border-neutral-200 px-4 py-3 bg-white"
            />
            
            {/* Filter Buttons */}
            <StaggeredList className="flex gap-2">
              <AnimatedButton
                variant={filter === "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Tous
              </AnimatedButton>
              <AnimatedButton
                variant={filter === "En cours" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("En cours")}
              >
                En cours
              </AnimatedButton>
              <AnimatedButton
                variant={filter === "Terminé" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("Terminé")}
              >
                Terminés
              </AnimatedButton>
              <AnimatedButton
                variant={filter === "En attente" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter("En attente")}
              >
                En attente
              </AnimatedButton>
            </StaggeredList>
          </div>
        </FadeIn>        
        {/* Projects Table */}
        <FadeIn direction="up" delay={0.3}>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <i className="fas fa-exclamation-triangle text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-neutral-500 mb-4">
                  Impossible de charger les projets. Veuillez réessayer.
                </p>
                <AnimatedButton onClick={() => window.location.reload()}>
                  Réessayer
                </AnimatedButton>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveTable
                columns={columns}
                data={sortedProjects}
                isLoading={isLoading}
                onSort={handleSort}
                emptyMessage="Aucun projet trouvé."
              />
            )}
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Projects;
