import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, User, DollarSign, Clock, Target } from 'lucide-react';

interface ProjectInfoProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    location: string;
    manager: string;
    category: string;
    progress: number;
    client: string;
    objectives: string[];
    specifications: string[];
  };
}

export default function ProjectInfo({ project }: ProjectInfoProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'basse':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'terminé':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'en attente':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'annulé':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Aperçu du Projet
          </CardTitle>
          <CardDescription>
            Informations générales et détails du projet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Titre du Projet
                </label>
                <p className="text-lg font-semibold">{project.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Statut
                  </label>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Priorité
                  </label>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Chef de Projet
                  </label>
                  <p className="font-medium">{project.manager}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Client
                  </label>
                  <p className="font-medium">{project.client}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Localisation
                  </label>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Budget Total
                  </label>
                  <p className="font-medium">{project.budget.toLocaleString()} TND</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier du Projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date de Début
                </label>
                <p className="font-medium">
                  {new Date(project.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-red-500" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date de Fin Prévue
                </label>
                <p className="font-medium">
                  {new Date(project.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
              Progression
            </label>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {project.progress}% complété
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Objectifs du Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Spécifications Techniques</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {project.specifications.map((spec, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{spec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
