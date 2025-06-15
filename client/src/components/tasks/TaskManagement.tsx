import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Flag,
  MessageCircle,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  projectId: string;
  phase?: string;
  tags: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface TaskManagementProps {
  projectId: string;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Record<string, TaskComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/project/${projectId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      const data = await response.json();
      setComments(prev => ({ ...prev, [taskId]: data }));
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, projectId })
      });
      
      if (response.ok) {
        fetchTasks();
        setShowTaskForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        fetchComments(taskId);
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, commentsCount: task.commentsCount + 1 }
            : task
        ));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  const exportTasks = async (format: 'csv' | 'pdf') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        projectId,
        status: selectedStatus !== 'all' ? selectedStatus : '',
        priority: selectedPriority !== 'all' ? selectedPriority : '',
        assignee: selectedAssignee !== 'all' ? selectedAssignee : '',
        search: searchQuery
      });

      const response = await fetch(`/api/tasks/export?${queryParams}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${projectId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'all' || task.assignedTo === selectedAssignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'blocked': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'blocked': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des tâches
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTasks.length} tâche(s) trouvée(s)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle tâche
          </button>
          
          <button
            onClick={() => exportTasks('csv')}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          
          <button
            onClick={() => exportTasks('pdf')}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher des tâches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Tous les statuts</option>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="blocked">Bloqué</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Toutes les priorités</option>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Élevée</option>
          <option value="urgent">Urgente</option>
        </select>

        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Tous les assignés</option>
          {/* Ajouter les options d'assignés dynamiquement */}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'list' ? 'Kanban' : 'Liste'}
          </button>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {task.title}
                  </h3>
                  
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {task.status}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-3 h-3" />
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {task.assignedToName}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {task.commentsCount} commentaire(s)
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTask(task)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune tâche trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Créez une nouvelle tâche ou modifiez vos filtres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
