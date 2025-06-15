import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap,
  Users,
  BookOpen,
  Video,
  FileText,
  Award,
  Clock,
  Play,
  Pause,
  Download,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Settings,
  Star
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'technical' | 'management' | 'quality' | 'compliance';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'video' | 'document' | 'interactive' | 'assessment';
  mandatory: boolean;
  completionRate: number;
  enrolledCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  instructor?: string;
  materials: string[];
}

interface UserProgress {
  userId: number;
  userName: string;
  email: string;
  role: string;
  completedModules: number;
  totalModules: number;
  totalHours: number;
  averageScore: number;
  lastActivity: string;
  certificates: string[];
  currentModule?: string;
}

interface TrainingStats {
  totalModules: number;
  totalUsers: number;
  averageCompletion: number;
  totalHours: number;
  certificatesIssued: number;
  activeTrainings: number;
  mandatoryCompletionRate: number;
  monthlyProgress: { month: string; completed: number; enrolled: number }[];
}

interface Certificate {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  validityPeriod: number; // months
  issuedCount: number;
  icon: string;
}

const TrainingSupport: React.FC = () => {
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      
      // Simuler données de formation (à remplacer par vraies API)
      const mockStats: TrainingStats = {
        totalModules: 45,
        totalUsers: 120,
        averageCompletion: 78.5,
        totalHours: 2340,
        certificatesIssued: 89,
        activeTrainings: 34,
        mandatoryCompletionRate: 92.3,
        monthlyProgress: [
          { month: 'Jan', completed: 145, enrolled: 180 },
          { month: 'Fév', completed: 167, enrolled: 195 },
          { month: 'Mar', completed: 189, enrolled: 210 },
          { month: 'Avr', completed: 203, enrolled: 230 },
          { month: 'Mai', completed: 225, enrolled: 245 },
          { month: 'Jun', completed: 241, enrolled: 260 }
        ]
      };

      const mockModules: TrainingModule[] = [
        {
          id: '1',
          title: 'Sécurité sur les chantiers de construction',
          description: 'Formation complète sur les règles de sécurité, l\'utilisation des EPI et la prévention des accidents',
          category: 'safety',
          duration: 120,
          difficulty: 'beginner',
          type: 'video',
          mandatory: true,
          completionRate: 95.2,
          enrolledCount: 118,
          averageRating: 4.8,
          createdAt: '2024-01-15',
          updatedAt: '2024-02-20',
          instructor: 'Mohamed Triki',
          materials: ['Manuel de sécurité', 'Check-list EPI', 'Vidéo démonstration']
        },
        {
          id: '2',
          title: 'Techniques de maçonnerie moderne',
          description: 'Méthodes avancées de construction en maçonnerie, nouveaux matériaux et techniques',
          category: 'technical',
          duration: 180,
          difficulty: 'intermediate',
          type: 'interactive',
          mandatory: false,
          completionRate: 67.3,
          enrolledCount: 45,
          averageRating: 4.5,
          createdAt: '2024-02-01',
          updatedAt: '2024-03-15',
          instructor: 'Amira Gharbi',
          materials: ['Guide technique', 'Exercices pratiques', 'Plans d\'exemple']
        },
        {
          id: '3',
          title: 'Gestion de projet BIM',
          description: 'Introduction au Building Information Modeling et son application dans les projets',
          category: 'management',
          duration: 240,
          difficulty: 'advanced',
          type: 'video',
          mandatory: false,
          completionRate: 43.8,
          enrolledCount: 32,
          averageRating: 4.7,
          createdAt: '2024-03-01',
          updatedAt: '2024-03-30',
          instructor: 'Karim Bouzid',
          materials: ['Logiciel BIM', 'Projets d\'exemple', 'Documentation technique']
        },
        {
          id: '4',
          title: 'Contrôle qualité et normes',
          description: 'Procédures de contrôle qualité, normes tunisiennes et internationales',
          category: 'quality',
          duration: 90,
          difficulty: 'intermediate',
          type: 'document',
          mandatory: true,
          completionRate: 88.7,
          enrolledCount: 95,
          averageRating: 4.3,
          createdAt: '2024-01-20',
          updatedAt: '2024-02-25',
          instructor: 'Fatma Mansouri',
          materials: ['Guide des normes', 'Fiches de contrôle', 'Exemples d\'audit']
        },
        {
          id: '5',
          title: 'Conformité réglementaire',
          description: 'Réglementations tunisiennes en construction, permis et autorisations',
          category: 'compliance',
          duration: 150,
          difficulty: 'intermediate',
          type: 'assessment',
          mandatory: true,
          completionRate: 91.4,
          enrolledCount: 105,
          averageRating: 4.2,
          createdAt: '2024-02-10',
          updatedAt: '2024-03-10',
          instructor: 'Ahmed Bouaziz',
          materials: ['Textes réglementaires', 'Procédures', 'Formulaires types']
        }
      ];

      const mockUserProgress: UserProgress[] = [
        {
          userId: 1,
          userName: 'Mohamed Triki',
          email: 'mohamed.triki@housy.tn',
          role: 'Chef de projet',
          completedModules: 8,
          totalModules: 10,
          totalHours: 24.5,
          averageScore: 92.3,
          lastActivity: '2024-01-10',
          certificates: ['Sécurité Niveau 1', 'Gestion de projet'],
          currentModule: 'Techniques avancées de construction'
        },
        {
          userId: 2,
          userName: 'Amira Gharbi',
          email: 'amira.gharbi@housy.tn',
          role: 'Architecte',
          completedModules: 12,
          totalModules: 15,
          totalHours: 36.2,
          averageScore: 88.7,
          lastActivity: '2024-01-09',
          certificates: ['BIM Certification', 'Design Avancé'],
          currentModule: 'Matériaux écologiques'
        },
        {
          userId: 3,
          userName: 'Karim Bouzid',
          email: 'karim.bouzid@housy.tn',
          role: 'Ingénieur',
          completedModules: 6,
          totalModules: 12,
          totalHours: 18.8,
          averageScore: 85.2,
          lastActivity: '2024-01-08',
          certificates: ['Sécurité Niveau 1'],
          currentModule: 'Calculs de structures'
        },
        {
          userId: 4,
          userName: 'Fatma Mansouri',
          email: 'fatma.mansouri@housy.tn',
          role: 'Contrôleur qualité',
          completedModules: 15,
          totalModules: 18,
          totalHours: 42.3,
          averageScore: 94.1,
          lastActivity: '2024-01-11',
          certificates: ['Qualité Expert', 'Audit Interne', 'Sécurité Niveau 2'],
          currentModule: 'Nouvelles normes ISO'
        }
      ];

      const mockCertificates: Certificate[] = [
        {
          id: '1',
          name: 'Sécurité Niveau 1',
          description: 'Certification de base en sécurité sur chantier',
          requirements: ['Formation sécurité de base', 'Test pratique', 'Score minimum 80%'],
          validityPeriod: 24,
          issuedCount: 45,
          icon: '🛡️'
        },
        {
          id: '2',
          name: 'Sécurité Niveau 2',
          description: 'Certification avancée en sécurité et prévention',
          requirements: ['Sécurité Niveau 1', 'Formation avancée', 'Expérience 2 ans', 'Score minimum 85%'],
          validityPeriod: 36,
          issuedCount: 12,
          icon: '🏆'
        },
        {
          id: '3',
          name: 'BIM Certification',
          description: 'Maîtrise des outils BIM et modélisation 3D',
          requirements: ['Formation BIM complète', 'Projet pratique', 'Score minimum 75%'],
          validityPeriod: 24,
          issuedCount: 18,
          icon: '🏗️'
        },
        {
          id: '4',
          name: 'Qualité Expert',
          description: 'Expert en contrôle qualité et audit',
          requirements: ['Formations qualité', 'Audit pratique', 'Score minimum 90%'],
          validityPeriod: 36,
          issuedCount: 8,
          icon: '✅'
        }
      ];

      setStats(mockStats);
      setTrainingModules(mockModules);
      setUserProgress(mockUserProgress);
      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Erreur lors du chargement des données de formation:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = trainingModules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Play className="w-4 h-4" />;
      case 'assessment': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const exportTrainingReport = async () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      modules: trainingModules,
      userProgress,
      certificates
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-formation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Formation & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestion de la formation professionnelle et certification des équipes Housy
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau module
          </Button>
          <Button onClick={exportTrainingReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter rapport
          </Button>
        </div>
      </div>

      {/* Statistiques de formation */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Modules disponibles
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.totalModules}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-blue-600">
                  {stats.activeTrainings} formations actives
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Taux de completion
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.averageCompletion.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600">
                  Obligatoires: {stats.mandatoryCompletionRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Heures de formation
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.totalHours.toLocaleString()}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-purple-600">
                  {stats.totalUsers} apprenants actifs
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Certificats délivrés
                  </p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.certificatesIssued}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-2">
                <span className="text-sm text-yellow-600">
                  {certificates.length} types disponibles
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="all">Toutes les catégories</option>
              <option value="safety">Sécurité</option>
              <option value="technical">Technique</option>
              <option value="management">Gestion</option>
              <option value="quality">Qualité</option>
              <option value="compliance">Conformité</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules de formation */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Modules de formation ({filteredModules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredModules.map((module) => (
                  <div key={module.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(module.type)}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {module.title}
                            </h4>
                          </div>
                          {module.mandatory && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Badge className={getCategoryColor(module.category)}>
                            {module.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.duration} min
                          </span>
                          <span className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {module.averageRating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {module.completionRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {module.enrolledCount} inscrits
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${module.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Instructeur: {module.instructor}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Voir détails
                        </Button>
                        <Button size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress des utilisateurs et certificats */}
        <div className="space-y-6">
          {/* Top apprenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Top apprenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProgress.slice(0, 4).map((user) => (
                  <div
                    key={user.userId}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {user.userName}
                        </h5>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {((user.completedModules / user.totalModules) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-green-500 rounded-full"
                          style={{ 
                            width: `${(user.completedModules / user.totalModules) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{user.completedModules}/{user.totalModules} modules</span>
                      <span>Score: {user.averageScore.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certificats disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Certificats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{cert.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {cert.name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          Validité: {cert.validityPeriod} mois
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {cert.issuedCount} délivrés
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {cert.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Prérequis:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {cert.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profil de formation - {selectedUser.userName}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rôle
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Progression
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedUser.completedModules}/{selectedUser.totalModules} modules
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Score moyen
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.averageScore.toFixed(1)}%</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Certificats obtenus
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.certificates.map((cert, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedUser.currentModule && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Module en cours
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.currentModule}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Assigner formation
                </Button>
                <Button className="flex-1">
                  Voir détails complets
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal création module */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Créer un nouveau module
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre du module
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Ex: Formation sécurité avancée"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700">
                  <option value="safety">Sécurité</option>
                  <option value="technical">Technique</option>
                  <option value="management">Gestion</option>
                  <option value="quality">Qualité</option>
                  <option value="compliance">Conformité</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700">
                    <option value="video">Vidéo</option>
                    <option value="document">Document</option>
                    <option value="interactive">Interactif</option>
                    <option value="assessment">Évaluation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                    placeholder="60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Description du module..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mandatory"
                  className="mr-2"
                />
                <label htmlFor="mandatory" className="text-sm text-gray-700 dark:text-gray-300">
                  Formation obligatoire
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button className="flex-1">
                  Créer module
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingSupport;
