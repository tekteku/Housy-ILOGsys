import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNotification } from '@/hooks/use-notification';
import { formatDate, cn } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  description?: string;
  targetDate: string;
  actualDate?: string;
  isCompleted: boolean;
  isOverdue: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'phase' | 'delivery' | 'payment' | 'approval' | 'inspection';
  projectId: number;
  dependencies?: number[];
  completionPercentage: number;
  notes?: string;
  assignedTo?: string;
  budget?: number;
  actualCost?: number;
}

interface ProgressData {
  overall: number;
  phases: Array<{
    id: number;
    name: string;
    progress: number;
    status: string;
    startDate: string;
    endDate: string;
    milestones: Milestone[];
  }>;
  upcomingMilestones: Milestone[];
  overdueMilestones: Milestone[];
  completedMilestones: Milestone[];
  kpis: {
    onTimeDelivery: number;
    budgetUtilization: number;
    qualityScore: number;
    teamEfficiency: number;
  };
}

interface ProgressTrackingProps {
  projectId: number;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ projectId }) => {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [showMilestoneDetails, setShowMilestoneDetails] = useState<number | null>(null);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Fetch progress data
  const { data: progressData, isLoading, error } = useQuery<ProgressData>({
    queryKey: ['progress-tracking', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress data');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Complete milestone mutation
  const completeMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, notes }: { milestoneId: number; notes?: string }) => {
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, completedAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to complete milestone');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progress-tracking', projectId] });
      showNotification({
        title: 'Jalon terminé',
        description: `Le jalon "${data.milestone.name}" a été marqué comme terminé`,
        variant: 'success',
      });
    },
    onError: () => {
      showNotification({
        title: 'Erreur',
        description: 'Erreur lors de la finalisation du jalon',
        variant: 'destructive',
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase': return 'fa-layer-group';
      case 'delivery': return 'fa-truck';
      case 'payment': return 'fa-credit-card';
      case 'approval': return 'fa-stamp';
      case 'inspection': return 'fa-search';
      default: return 'fa-flag';
    }
  };

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.isCompleted) return { status: 'completed', color: 'text-green-600', icon: CheckCircle };
    if (milestone.isOverdue) return { status: 'overdue', color: 'text-red-600', icon: AlertTriangle };
    return { status: 'pending', color: 'text-yellow-600', icon: Clock };
  };

  // Generate milestone notifications
  useEffect(() => {
    if (!progressData) return;

    // Check for upcoming milestones (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    progressData.upcomingMilestones.forEach(milestone => {
      const targetDate = new Date(milestone.targetDate);
      if (targetDate <= threeDaysFromNow && !milestone.isCompleted) {
        showNotification({
          title: 'Jalon à venir',
          description: `Le jalon "${milestone.name}" est prévu pour le ${formatDate(milestone.targetDate)}`,
          variant: 'info',
          duration: 10000,
        });
      }
    });

    // Check for overdue milestones
    progressData.overdueMilestones.forEach(milestone => {
      if (!milestone.isCompleted) {
        showNotification({
          title: 'Jalon en retard',
          description: `Le jalon "${milestone.name}" est en retard depuis le ${formatDate(milestone.targetDate)}`,
          variant: 'destructive',
          duration: 15000,
        });
      }
    });
  }, [progressData, showNotification]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>Erreur lors du chargement des données de progression</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression globale</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData.overall}%</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={progressData.overall} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Livraisons à temps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData.kpis.onTimeDelivery}%</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisation budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData.kpis.budgetUtilization}%</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficacité équipe</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progressData.kpis.teamEfficiency}%</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression des phases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progressData.phases.map((phase) => (
            <div key={phase.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{phase.name}</h3>
                  <Badge variant="outline" className={cn(
                    phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {phase.status === 'completed' ? 'Terminée' :
                     phase.status === 'in_progress' ? 'En cours' : 'En attente'}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{phase.progress}%</span>
                  <p className="text-xs text-gray-500">
                    {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                  </p>
                </div>
              </div>
              
              <Progress value={phase.progress} className="mb-3" />
              
              {/* Phase Milestones */}
              {phase.milestones.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Jalons ({phase.milestones.filter(m => m.isCompleted).length}/{phase.milestones.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                    >
                      <i className={`fas fa-chevron-${selectedPhase === phase.id ? 'up' : 'down'} text-sm`} />
                    </Button>
                  </div>
                  
                  {selectedPhase === phase.id && (
                    <div className="grid gap-2 mt-3">
                      {phase.milestones.map((milestone) => {
                        const status = getMilestoneStatus(milestone);
                        return (
                          <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <status.icon className={cn("h-4 w-4", status.color)} />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.name}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getPriorityColor(milestone.priority)} variant="outline">
                                    {milestone.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    <i className={`fas ${getTypeIcon(milestone.type)} mr-1`} />
                                    {formatDate(milestone.targetDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {!milestone.isCompleted && (
                              <Button
                                size="sm"
                                onClick={() => completeMilestoneMutation.mutate({ milestoneId: milestone.id })}
                                disabled={completeMilestoneMutation.isPending}
                              >
                                Terminer
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Milestone Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Jalons à venir</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.upcomingMilestones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun jalon à venir</p>
            ) : (
              <div className="space-y-3">
                {progressData.upcomingMilestones.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(milestone.targetDate)}</p>
                    </div>
                    <Badge className={getPriorityColor(milestone.priority)} variant="outline">
                      {milestone.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Jalons en retard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.overdueMilestones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun jalon en retard</p>
            ) : (
              <div className="space-y-3">
                {progressData.overdueMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.name}</p>
                      <p className="text-xs text-red-600">En retard depuis {formatDate(milestone.targetDate)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeMilestoneMutation.mutate({ milestoneId: milestone.id })}
                      disabled={completeMilestoneMutation.isPending}
                    >
                      Terminer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Récemment terminés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.completedMilestones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun jalon terminé récemment</p>
            ) : (
              <div className="space-y-3">
                {progressData.completedMilestones.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.name}</p>
                      <p className="text-xs text-green-600">
                        Terminé {milestone.actualDate ? formatDate(milestone.actualDate) : ''}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressTracking;
