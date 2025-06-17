import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface AIModelSelectorProps {
  onModelChange: (modelId: string) => void;
  currentModel?: string;
  className?: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  category: 'cloud' | 'local';
  adminOnly?: boolean;
  performance: 'fast' | 'balanced' | 'precise';
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({ 
  onModelChange, 
  currentModel = 'auto',
  className = "" 
}) => {
  const { user } = useAuth();
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration des modèles disponibles (SANS révéler responsabilités)
  const allModels: AIModel[] = [
    {
      id: 'auto',
      name: 'Auto (Recommandé)',
      description: 'Sélection automatique du meilleur modèle selon la tâche',
      category: 'cloud',
      performance: 'balanced'
    },
    {
      id: 'llama3.1',
      name: 'Llama 3.1',
      description: 'Modèle polyvalent et performant',
      category: 'local',
      adminOnly: true,
      performance: 'precise'
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      description: 'Optimisé pour les calculs et analyses',
      category: 'local',
      adminOnly: true,
      performance: 'precise'
    },
    {
      id: 'qwen2.5-coder',
      name: 'Qwen 2.5 Coder',
      description: 'Excellent pour les tâches techniques',
      category: 'local',
      performance: 'fast'
    },
    {
      id: 'qwen',
      name: 'Qwen',
      description: 'Modèle généraliste performant',
      category: 'local',
      performance: 'balanced'
    },
    {
      id: 'claude',
      name: 'Claude (Anthropic)',
      description: 'IA conversationnelle avancée',
      category: 'cloud',
      performance: 'precise'
    },
    {
      id: 'openai',
      name: 'GPT (OpenAI)',
      description: 'Modèle polyvalent et créatif',
      category: 'cloud',
      performance: 'balanced'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Raisonnement avancé et logique',
      category: 'cloud',
      performance: 'precise'
    }
  ];

  useEffect(() => {
    // Filtrer les modèles selon les permissions utilisateur
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    
    const filtered = allModels.filter(model => {
      if (model.adminOnly && !isAdmin) {
        return false;
      }
      return true;
    });

    setAvailableModels(filtered);
    setIsLoading(false);
  }, [user]);

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case 'fast': return 'bg-green-100 text-green-800';
      case 'balanced': return 'bg-blue-100 text-blue-800';
      case 'precise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'local': return 'bg-orange-100 text-orange-800';
      case 'cloud': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Assistant IA</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Select value={currentModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un assistant" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id} className="p-3">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{model.name}</span>
                    <div className="flex gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryBadgeColor(model.category)}`}
                      >
                        {model.category === 'local' ? 'Local' : 'Cloud'}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPerformanceBadgeColor(model.performance)}`}
                      >
                        {model.performance === 'fast' ? 'Rapide' : 
                         model.performance === 'balanced' ? 'Équilibré' : 'Précis'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 text-left">
                    {model.description}
                  </p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Note pour les utilisateurs non-admin */}
        {user?.role !== 'admin' && user?.role !== 'super_admin' && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Les modèles locaux sont réservés aux administrateurs
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AIModelSelector;
