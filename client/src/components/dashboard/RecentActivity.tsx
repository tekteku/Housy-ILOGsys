import { useQuery } from "@tanstconst RecentActivity = () => {
  const { data: activities, isLoading, error, isError } = useQuery({
    queryKey: ['/api/activities'],
  });
  
  const { showNotification } = useNotification();react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ErrorAlert } from "@/components/ui/error-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useNotification } from "@/hooks/use-notification";
import { ErrorAlert } from "@/components/ui/error-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useNotification } from "@/hooks/use-notification";

interface Activity {
  id: number;
  actionType: string;
  entityType: string;
  timestamp: string;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  details?: any;
  entity?: {
    id: number;
    name: string;
    type: string;
  };
}

const RecentActivity = () => {
  const { data: activities, isLoading, isError } = useQuery({
    queryKey: ['/api/activities'],
  });

  const { addNotification } = useNotification();

  // Helper function to get icon based on activity type
  const getActivityIcon = (activity: Activity) => {
    const actionMap: Record<string, { bg: string; icon: string }> = {
      create: { bg: "bg-green-100", icon: "fas fa-plus text-green-600" },
      update: { bg: "bg-blue-100", icon: "fas fa-edit text-blue-600" },
      delete: { bg: "bg-red-100", icon: "fas fa-trash text-red-600" },
      complete: { bg: "bg-green-100", icon: "fas fa-check text-green-600" },
      assign: { bg: "bg-purple-100", icon: "fas fa-user-plus text-purple-600" },
      comment: { bg: "bg-blue-100", icon: "fas fa-comment text-blue-600" },
      alert: { bg: "bg-yellow-100", icon: "fas fa-exclamation text-yellow-600" },
      upload: { bg: "bg-purple-100", icon: "fas fa-file-alt text-purple-600" },
    };

    // Default icon if action type is not found
    const defaultIcon = { bg: "bg-gray-100", icon: "fas fa-info-circle text-gray-600" };
    
    return actionMap[activity.actionType] || defaultIcon;
  };

  // Helper function to get activity message
  const getActivityMessage = (activity: Activity) => {
    const { actionType, entityType, details, entity, user } = activity;
    
    let message = "";
    const entityName = entity?.name || details?.taskName || details?.projectName || "élément";
    
    switch (actionType) {
      case "create":
        message = `Nouvel(le) ${entityType} créé(e) : `;
        break;
      case "update":
        message = `${entityType} mis(e) à jour : `;
        break;
      case "delete":
        message = `${entityType} supprimé(e) : `;
        break;
      case "complete":
        message = `Tâche terminée : `;
        break;
      case "assign":
        message = `Ressource assignée à `;
        break;
      case "comment":
        message = `Nouveau commentaire sur `;
        break;
      case "alert":
        message = `Alerte : `;
        break;
      case "upload":
        message = `Nouveau document : `;
        break;
      default:
        message = `Activité sur `;
    }
    
    return (
      <>
        {message} <span className="font-medium">{entityName}</span>
      </>
    );
  };

  // Sample activities data (used if no API data available)
  const sampleActivities: Activity[] = [
    {
      id: 1,
      actionType: "complete",
      entityType: "task",
      timestamp: new Date().toISOString(),
      user: {
        id: 1,
        fullName: "Adnen Ben Zineb",
      },
      entity: {
        id: 101,
        name: "Installation électrique",
        type: "task",
      },
    },
    {
      id: 2,
      actionType: "comment",
      entityType: "project",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 2,
        fullName: "Sonia Maalej",
      },
      entity: {
        id: 201,
        name: "Villa Carthage",
        type: "project",
      },
    },
    {
      id: 3,
      actionType: "alert",
      entityType: "material",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      details: {
        taskName: "Livraison acier",
      },
    },
    {
      id: 4,
      actionType: "alert",
      entityType: "budget",
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      details: {
        taskName: "Dépassement budget peinture",
      },
    },
    {
      id: 5,
      actionType: "upload",
      entityType: "document",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: 3,
        fullName: "Farah Belhaj",
      },
      entity: {
        id: 301,
        name: "Plan révisé étage 2",
        type: "document",
      },
    },
  ];

  // Get formatted time string
  const getTimeString = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
    } else {
      return formatDate(date);
    }
  };

  // Get user name or "Système" for automated activities
  const getUserName = (activity: Activity) => {
    return activity.user?.fullName || "Système";
  };

  return (
    <Card className="shadow-sm border border-neutral-200 h-full">
      <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-900">Activités récentes</h2>
        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {isLoading ? "..." : activities?.length || sampleActivities.length} activité(s)
        </span>
      </div>
      
      <div className="p-3">
        {isError ? (
          <ErrorAlert className="mb-4">
            Une erreur s'est produite lors du chargement des activités. Veuillez réessayer plus tard.
          </ErrorAlert>
        ) : (
          <div className="space-y-1">
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <div key={index} className="p-2 rounded-lg flex items-start space-x-3">
                  <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : activities?.length > 0 ? (
              activities.map((activity: Activity) => {
                const { bg, icon } = getActivityIcon(activity);
                
                return (
                  <div key={activity.id} className="p-2 hover:bg-neutral-50 rounded-lg flex items-start space-x-3">
                    <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`${icon} text-xs`}></i>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {getTimeString(activity.timestamp)} par {getUserName(activity)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>
                Aucune activité récente à afficher.
              </EmptyState>
            )}
          </div>
        )}
        
        {/* View All Button */}
        <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-center">
          <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Voir toutes les activités
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RecentActivity;
