import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, getDateDiff, isOverdue } from "@/lib/utils";
import { LoadingIndicator } from "@/components/ui/loading-indicator"; 
import { EmptyState } from "@/components/ui/empty-state"; 

type TimeScale = "day" | "week" | "month";

interface Task {
  id: number;
  name: string;
  projectId: number;
  projectName?: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

const GanttChart = () => {
  const [timeScale, setTimeScale] = useState<TimeScale>("week");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Extract tasks from all projects
  const allTasks = projects?.reduce((acc: Task[], project: any) => {
    if (project.tasks) {
      return [
        ...acc,
        ...project.tasks.map((task: any) => ({
          ...task,
          projectName: project.name,
        })),
      ];
    }
    return acc;
  }, []) || [];

  // Sort tasks by start date
  const sortedTasks = [...allTasks].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Generate dates for the header based on the selected time scale
  const generateDates = () => {
    const today = new Date();
    const dates = [];
    let numDays;

    switch (timeScale) {
      case "day":
        numDays = 7;
        break;
      case "week":
        numDays = 7;
        break;
      case "month":
        numDays = 30;
        break;
      default:
        numDays = 7;
    }

    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const dates = generateDates();

  // Format date for display based on time scale
  const formatHeaderDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  // Calculate task position and width on the timeline
  const calculateTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const today = new Date();
    
    // Start from today for the first column
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    // If task starts before our visible range or ends after it, adjust
    if (endDate < firstDate || startDate > lastDate) {
      return {
        display: "none",
      };
    }
    
    // Calculate which column the task starts in
    const startColumnIndex = Math.max(
      0,
      Math.floor(
        (startDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000)
      )
    );
    
    // Calculate task duration in days (within our visible range)
    const visibleStartDate = startDate < firstDate ? firstDate : startDate;
    const visibleEndDate = endDate > lastDate ? lastDate : endDate;
    const durationDays = Math.ceil(
      (visibleEndDate.getTime() - visibleStartDate.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1; // +1 because we include the start day
    
    // Determine color based on status
    let bgColorClass = "bg-primary-100 border-primary-300";
    let progressColorClass = "bg-primary-600";
    
    if (task.status === "completed") {
      bgColorClass = "bg-green-100 border-green-300";
      progressColorClass = "bg-green-600";
    } else if (isOverdue(task.endDate, task.status)) {
      bgColorClass = "bg-red-100 border-red-300";
      progressColorClass = "bg-red-600";
    } else if (task.status === "in_progress") {
      bgColorClass = "bg-blue-100 border-blue-300";
      progressColorClass = "bg-blue-600";
    } else if (task.status === "pending") {
      bgColorClass = "bg-yellow-100 border-yellow-300";
      progressColorClass = "bg-yellow-600";
    }
    
    return {
      gridColumnStart: startColumnIndex + 1, // 1-based index for CSS grid
      gridColumnEnd: startColumnIndex + durationDays + 1, // +1 for grid end
      bgColorClass,
      progressColorClass,
    };
  };

  // Scroll to current day
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0; // Start from today
    }
  }, [timeScale]);

  if (isLoadingProjects) {
    return (
      <Card className="shadow-sm border border-neutral-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-neutral-900">Chronologie des projets</h2>
          </div>
          <LoadingIndicator 
            type="skeleton" 
            text="Chargement des données des projets..." 
            count={5} 
            height="h-12" 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-medium text-neutral-900">Chronologie des projets</h2>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button
              variant={timeScale === "day" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTimeScale("day")}
            >
              Jour
            </Button>
            <Button
              variant={timeScale === "week" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTimeScale("week")}
            >
              Semaine
            </Button>
            <Button
              variant={timeScale === "month" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTimeScale("month")}
            >
              Mois
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2"
        >
          <div className="min-w-max">
            {/* Week Headers */}
            <div className="flex items-center mb-2">
              <div className="w-48 flex-shrink-0"></div>
              <div className="flex-1 grid grid-cols-7">
                {dates.map((date, index) => (
                  <div key={index} className="text-center text-sm text-neutral-500">
                    {formatHeaderDate(date)}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const { gridColumnStart, gridColumnEnd, bgColorClass, progressColorClass, display } = 
                  calculateTaskPosition(task);
                
                if (display === "none") return null;

                return (
                  <div key={task.id} className="flex items-center mb-2">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {task.name}
                      </p>
                      <p className="text-xs text-neutral-500">{task.projectName}</p>
                    </div>
                    <div className="flex-1 h-8 grid grid-cols-7 gap-1">
                      <div
                        className={cn(
                          `${bgColorClass} border rounded-md flex items-center px-2`,
                          "col-start-1 col-end-8" // This will be overridden by inline style
                        )}
                        style={{
                          gridColumnStart,
                          gridColumnEnd,
                        }}
                      >
                        <div className="w-full bg-neutral-200 rounded-full h-1.5">
                          <div
                            className={`${progressColorClass} h-1.5 rounded-full`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState 
                title="Aucune tâche à afficher"
                description="Créez des tâches pour vos projets pour les voir dans le diagramme de Gantt"
                icon="fa-tasks"
                action={{
                  label: "Créer une tâche",
                  onClick: () => window.location.href = '/projects'
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
