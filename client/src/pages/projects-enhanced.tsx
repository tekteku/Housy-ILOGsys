import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, getDateDiff, isOverdue } from "@/lib/utils";
import { useNotification } from "@/hooks/use-notification";

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

  const { showNotification } = useNotification();

  // Set document title
  useEffect(() => {
    document.title = "Projets | Housy";
  }, []);

  // Fetch projects data
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Filter projects based on search term and status filter
  const filteredProjects = projects
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
    : [];

  // Sort projects
  const sortedProjects = filteredProjects ? [...filteredProjects].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  }) : [];
    
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
      cellClassName: "text-right",
      renderCell: (project: Project) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleViewProject(project)}>
            <i className="fas fa-eye text-neutral-500"></i>
          </Button>
          <Button variant="ghost" size="icon">
            <i className="fas fa-edit text-neutral-500"></i>
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500">
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            Projets
          </h1>
          <p className="text-neutral-500 mt-1">
            Gérez tous vos projets de construction
          </p>
        </div>
        <Button className="flex items-center">
          <i className="fas fa-plus mr-2"></i>
          Nouveau projet
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchInput
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            suggestions={["Projets résidentiels", "Projets commerciaux", "Projets en retard"]}
            onSuggestionClick={(suggestion) => setSearchTerm(suggestion)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Actifs
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Terminés
          </Button>
          <Button
            variant={filter === "on_hold" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("on_hold")}
          >
            En pause
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-0">
          <ResponsiveTable
            data={sortedProjects}
            columns={columns}
            isLoading={isLoading}
            error={error ? "Impossible de charger les projets. Veuillez réessayer plus tard." : undefined}
            emptyMessage="Aucun projet ne correspond à votre recherche."
            emptyIcon="fa-building"
            emptyAction={{
              label: "Créer un projet",
              onClick: () => showNotification({ 
                title: "Fonctionnalité à venir", 
                description: "La création de projets sera disponible prochainement.",
                variant: "info" 
              })
            }}
            onRowClick={handleViewProject}
            sortKey={sortConfig.key}
            sortDirection={sortConfig.direction}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
