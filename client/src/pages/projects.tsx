import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getDateDiff, isOverdue } from "@/lib/utils";

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

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Actif</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Terminé</Badge>;
      case "on_hold":
        return <Badge className="bg-yellow-500">En pause</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Annulé</Badge>;
      default:
        return <Badge className="bg-neutral-500">{status}</Badge>;
    }
  };

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
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
        </div>
        <div className="flex gap-2">
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
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              Une erreur est survenue lors du chargement des projets.
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center text-neutral-500">
              Aucun projet ne correspond à votre recherche.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="hidden md:table-cell">Période</TableHead>
                  <TableHead className="hidden md:table-cell">Tâches</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Progression</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project: Project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-neutral-500">
                          {project.clientName && `Client: ${project.clientName}`}
                          {project.location && `, ${project.location}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(project.budget)}
                      </div>
                      {project.summary && (
                        <div className="text-sm text-neutral-500">
                          Dépensé: {formatCurrency(project.summary.budgetStatus.spent)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
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
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.summary ? (
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
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(project.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <Progress value={project.progress} className="h-2" />
                        <div className="text-xs text-neutral-500 text-right">
                          {Math.round(project.progress)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <i className="fas fa-eye text-neutral-500"></i>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <i className="fas fa-edit text-neutral-500"></i>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
