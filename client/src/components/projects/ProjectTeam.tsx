import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Briefcase,
  MessageCircle,
  MoreHorizontal,
  Search,
  Filter,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: 'architecture' | 'construction' | 'engineering' | 'quality' | 'management' | 'logistics';
  level: 'junior' | 'intermediate' | 'senior' | 'lead' | 'manager';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  location: string;
  skills: string[];
  certifications: string[];
  projectsCompleted: number;
  currentWorkload: number; // percentage
  hourlyRate: number;
  totalHours: number;
  performance: {
    rating: number;
    tasksCompleted: number;
    tasksOnTime: number;
    clientSatisfaction: number;
  };
  availability: 'available' | 'busy' | 'unavailable' | 'vacation';
  bio?: string;
}

interface ProjectTeamProps {
  projectId: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Ahmed Ben Ali',
    email: 'ahmed.benali@housy.tn',
    phone: '+216 98 123 456',
    role: 'Chef de Projet',
    department: 'management',
    level: 'manager',
    avatar: '/avatars/ahmed.jpg',
    joinedAt: '2023-06-15T00:00:00Z',
    lastActive: '2024-01-22T14:30:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Gestion de projet', 'Leadership', 'Planification', 'Budgétisation'],
    certifications: ['PMP', 'Agile Certified'],
    projectsCompleted: 24,
    currentWorkload: 85,
    hourlyRate: 65,
    totalHours: 320,
    performance: {
      rating: 4.8,
      tasksCompleted: 156,
      tasksOnTime: 148,
      clientSatisfaction: 4.9
    },
    availability: 'busy',
    bio: 'Chef de projet expérimenté avec plus de 8 ans d\'expérience dans le secteur de la construction résidentielle et commerciale.'
  },
  {
    id: '2',
    name: 'Mohamed Triki',
    email: 'mohamed.triki@housy.tn',
    phone: '+216 97 234 567',
    role: 'Conducteur de Travaux',
    department: 'construction',
    level: 'senior',
    avatar: '/avatars/mohamed.jpg',
    joinedAt: '2022-03-10T00:00:00Z',
    lastActive: '2024-01-22T16:45:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Coordination chantier', 'Sécurité', 'Gros œuvre', 'Planning'],
    certifications: ['CSCS', 'Sécurité Chantier'],
    projectsCompleted: 18,
    currentWorkload: 75,
    hourlyRate: 45,
    totalHours: 280,
    performance: {
      rating: 4.6,
      tasksCompleted: 89,
      tasksOnTime: 82,
      clientSatisfaction: 4.7
    },
    availability: 'available',
    bio: 'Conducteur de travaux spécialisé dans les projets résidentiels avec une expertise en coordination multi-corps d\'état.'
  },
  {
    id: '3',
    name: 'Fatma Sassi',
    email: 'fatma.sassi@housy.tn',
    phone: '+216 95 345 678',
    role: 'Architecte',
    department: 'architecture',
    level: 'senior',
    avatar: '/avatars/fatma.jpg',
    joinedAt: '2021-09-20T00:00:00Z',
    lastActive: '2024-01-22T11:20:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Design architectural', 'AutoCAD', 'Revit', 'Sustainable Design'],
    certifications: ['Ordre des Architectes', 'LEED AP'],
    projectsCompleted: 32,
    currentWorkload: 60,
    hourlyRate: 55,
    totalHours: 240,
    performance: {
      rating: 4.9,
      tasksCompleted: 124,
      tasksOnTime: 119,
      clientSatisfaction: 4.8
    },
    availability: 'available',
    bio: 'Architecte passionnée par le design durable et l\'intégration harmonieuse dans l\'environnement urbain tunisien.'
  },
  {
    id: '4',
    name: 'Salim Khediri',
    email: 'salim.khediri@housy.tn',
    phone: '+216 94 456 789',
    role: 'Ingénieur Électricien',
    department: 'engineering',
    level: 'intermediate',
    avatar: '/avatars/salim.jpg',
    joinedAt: '2022-11-05T00:00:00Z',
    lastActive: '2024-01-22T09:15:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Installation électrique', 'Domotique', 'Énergie solaire', 'Normes NF'],
    certifications: ['Habilitation électrique', 'QualiPV'],
    projectsCompleted: 15,
    currentWorkload: 80,
    hourlyRate: 40,
    totalHours: 200,
    performance: {
      rating: 4.5,
      tasksCompleted: 67,
      tasksOnTime: 61,
      clientSatisfaction: 4.6
    },
    availability: 'busy',
    bio: 'Ingénieur électricien spécialisé dans les installations modernes et les solutions énergétiques durables.'
  },
  {
    id: '5',
    name: 'Karim Mansouri',
    email: 'karim.mansouri@housy.tn',
    phone: '+216 96 567 890',
    role: 'Responsable Logistique',
    department: 'logistics',
    level: 'intermediate',
    avatar: '/avatars/karim.jpg',
    joinedAt: '2023-01-15T00:00:00Z',
    lastActive: '2024-01-22T15:30:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Gestion des stocks', 'Approvisionnement', 'Transport', 'Négociation'],
    certifications: ['Logistique et Transport'],
    projectsCompleted: 12,
    currentWorkload: 65,
    hourlyRate: 35,
    totalHours: 180,
    performance: {
      rating: 4.3,
      tasksCompleted: 45,
      tasksOnTime: 42,
      clientSatisfaction: 4.4
    },
    availability: 'available',
    bio: 'Responsable logistique efficace dans l\'optimisation des flux de matériaux et la coordination des livraisons.'
  },
  {
    id: '6',
    name: 'Leila Bouaziz',
    email: 'leila.bouaziz@housy.tn',
    phone: '+216 93 678 901',
    role: 'Contrôleuse Qualité',
    department: 'quality',
    level: 'senior',
    avatar: '/avatars/leila.jpg',
    joinedAt: '2022-07-01T00:00:00Z',
    lastActive: '2024-01-22T13:45:00Z',
    location: 'Tunis, Tunisie',
    skills: ['Contrôle qualité', 'Normes ISO', 'Inspection', 'Documentation'],
    certifications: ['ISO 9001', 'Contrôle Technique'],
    projectsCompleted: 20,
    currentWorkload: 70,
    hourlyRate: 42,
    totalHours: 220,
    performance: {
      rating: 4.7,
      tasksCompleted: 98,
      tasksOnTime: 94,
      clientSatisfaction: 4.8
    },
    availability: 'available',
    bio: 'Experte en contrôle qualité avec une attention méticuleuse aux détails et aux standards de construction.'
  }
];

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const getDepartmentColor = (department: TeamMember['department']) => {
    switch (department) {
      case 'architecture':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'construction':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'engineering':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'quality':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'management':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getAvailabilityColor = (availability: TeamMember['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'vacation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getLevelBadge = (level: TeamMember['level']) => {
    const colors = {
      junior: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      senior: 'bg-green-100 text-green-800',
      lead: 'bg-purple-100 text-purple-800',
      manager: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.junior;
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesAvailability = filterAvailability === 'all' || member.availability === filterAvailability;
    
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  const totalMembers = teamMembers.length;
  const availableMembers = teamMembers.filter(m => m.availability === 'available').length;
  const averageRating = teamMembers.reduce((acc, m) => acc + m.performance.rating, 0) / teamMembers.length;
  const totalHours = teamMembers.reduce((acc, m) => acc + m.totalHours, 0);

  const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getDepartmentColor(member.department)}>
                    {member.department}
                  </Badge>
                  <Badge className={getLevelBadge(member.level)}>
                    {member.level}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getAvailabilityColor(member.availability)}>
                {member.availability}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.location}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{member.performance.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{member.projectsCompleted} projets</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{member.totalHours}h</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Charge de travail</span>
              <span>{member.currentWorkload}%</span>
            </div>
            <Progress value={member.currentWorkload} className="h-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Compétences principales</p>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{member.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedMember(member)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Contacter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedMember(member)}
            >
              Profil détaillé
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Team Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
              <p className="text-sm text-muted-foreground">Membres équipe</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{availableMembers}</p>
              <p className="text-sm text-muted-foreground">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{totalHours}</p>
              <p className="text-sm text-muted-foreground">Heures totales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Équipe du Projet
              </CardTitle>
              <CardDescription>
                Gestion et coordination de l'équipe projet
              </CardDescription>
            </div>
            <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter membre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un membre disponible pour ce projet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">Youssef Hamdi - Maçon</SelectItem>
                      <SelectItem value="user2">Sarra Lakhal - Architecte d'intérieur</SelectItem>
                      <SelectItem value="user3">Nabil Souissi - Plombier</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rôle dans le projet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membre équipe</SelectItem>
                      <SelectItem value="specialist">Spécialiste</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Notes sur l'affectation..." />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddMemberModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={() => setIsAddMemberModalOpen(false)}>
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des membres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous départements</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="engineering">Ingénierie</SelectItem>
                  <SelectItem value="quality">Qualité</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="logistics">Logistique</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes disponibilités</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="busy">Occupé</SelectItem>
                  <SelectItem value="unavailable">Indisponible</SelectItem>
                  <SelectItem value="vacation">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun membre d'équipe trouvé</p>
          </CardContent>
        </Card>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                  <AvatarFallback>
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations de contact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedMember.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Note générale:</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {selectedMember.performance.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tâches terminées:</span>
                      <span>{selectedMember.performance.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de ponctualité:</span>
                      <span>
                        {Math.round((selectedMember.performance.tasksOnTime / selectedMember.performance.tasksCompleted) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Biographie</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.bio || 'Aucune biographie disponible.'}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map(skill => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.certifications.map(cert => (
                    <Badge key={cert} className="bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Gérer les permissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
