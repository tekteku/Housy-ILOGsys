// filepath: c:\\Users\\TaherCh\\Desktop\\Essay\\HousyTunisia\\HousyTunisia\\client\\src\\pages\\projects.tsx
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
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter projects based on search term and status filter
  const filteredProjects = projects
    .filter((project: Project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((project: Project) => {
      if (filter === "all") return true;
      return project.status === filter;
    });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const key = sortConfig.key;
    const valA = a[key];
    const valB = b[key];

    // Handle undefined values: undefined values are considered "greater" and placed at the end.
    if (valA === undefined && valB !== undefined) {
      return 1; // valA is greater
    }
    if (valA !== undefined && valB === undefined) {
      return -1; // valB is greater (so valA comes first)
    }
    if (valA === undefined && valB === undefined) {
      return 0; // Both are undefined, considered equal
    }

    // At this point, valA and valB are known to be non-undefined.
    // Use non-null assertion operator (!) to inform TypeScript.
    if (valA! < valB!) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA! > valB!) {
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
    <div className="p-8 md:p-12 space-y-10 bg-[#f4f6fa] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#162032]">
            Projets (Updated)
          </h1>
          <p className="text-[#b0b8c1] mt-2">
            Liste et gestion mise à jour de vos projets
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center rounded-xl px-6 py-3 text-base">
            <i className="fas fa-plus mr-2"></i>
            Nouveau projet
          </Button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher un projet..."
          className="rounded-xl shadow-sm border border-neutral-200 px-4 py-3 bg-white"
        />
        {/* Add filter and sort controls here if needed */}
      </div>
      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">        <ResponsiveTable
          columns={columns}
          data={sortedProjects}
          isLoading={isLoading}
          onSort={handleSort}
          emptyMessage="Aucun projet trouvé."
        />
      </div>
    </div>
  );
};

export default Projects;
