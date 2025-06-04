import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/hooks/use-notification';
import { formatDate, cn } from '@/lib/utils';
import { Users, UserPlus, Mail, Phone, Calendar, Award, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TeamMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  skills: string[];
  workload: number; // Percentage
  availability: 'available' | 'busy' | 'unavailable';
  currentTasks: number;
  completedTasks: number;
  performance: {
    rating: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  lastActivity: string;
  permissions: string[];
}

interface TeamRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

interface TeamManagementProps {
  projectId: number;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  // Fetch team data
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team-management', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/team`);
      if (!response.ok) throw new Error('Failed to fetch team data');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch available roles
  const { data: roles } = useQuery<TeamRole[]>({
    queryKey: ['team-roles'],
    queryFn: async () => {
      const response = await fetch('/api/team/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const result = await response.json();
      return result.data;
    },
  });

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      const response = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (!response.ok) throw new Error('Failed to add team member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-management', projectId] });
      setIsAddMemberOpen(false);
      showNotification({
        title: 'Membre ajouté',
        description: 'Le membre a été ajouté à l\'équipe avec succès',
        variant: 'success',
      });
    },
    onError: () => {
      showNotification({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout du membre à l\'équipe',
        variant: 'destructive',
      });
    },
  });

  // Update member status mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: number; updates: any }) => {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update team member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-management', projectId] });
      showNotification({
        title: 'Membre mis à jour',
        description: 'Les informations du membre ont été mises à jour',
        variant: 'success',
      });
    },
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove team member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-management', projectId] });
      showNotification({
        title: 'Membre retiré',
        description: 'Le membre a été retiré de l\'équipe',
        variant: 'success',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    const roleConfig = roles?.find(r => r.name.toLowerCase() === role.toLowerCase());
    return roleConfig?.color || 'bg-blue-100 text-blue-800';
  };

  const getPerformanceRating = (rating: number) => {
    if (rating >= 4.5) return { label: 'Excellent', color: 'text-green-600' };
    if (rating >= 4.0) return { label: 'Très bien', color: 'text-blue-600' };
    if (rating >= 3.5) return { label: 'Bien', color: 'text-yellow-600' };
    if (rating >= 3.0) return { label: 'Moyen', color: 'text-orange-600' };
    return { label: 'À améliorer', color: 'text-red-600' };
  };

  // Filter team members
  const filteredMembers = teamData?.members?.filter((member: TeamMember) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total membres</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamData?.members?.length || 0}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membres actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamData?.members?.filter((m: TeamMember) => m.status === 'active').length || 0}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Charge moyenne</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamData?.averageWorkload || 0}%
                </p>
              </div>
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance moyenne</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamData?.averagePerformance || 0}/5
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion d'équipe</CardTitle>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter membre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
                </DialogHeader>
                <AddMemberForm
                  onSubmit={(data) => addMemberMutation.mutate(data)}
                  isLoading={addMemberMutation.isPending}
                  roles={roles || []}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.name.toLowerCase()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="on_leave">En congé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member: TeamMember) => {
              const performanceRating = getPerformanceRating(member.performance.rating);
              
              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
                            getAvailabilityColor(member.availability)
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{member.position}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className={getStatusColor(member.status)}>
                          {member.status === 'active' ? 'Actif' :
                           member.status === 'inactive' ? 'Inactif' : 'En congé'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Rôle:</span>
                        <Badge variant="outline" className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Charge de travail:</span>
                        <span className="font-medium">{member.workload}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                        <span className={cn("font-medium", performanceRating.color)}>
                          {member.performance.rating}/5
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Tâches: {member.completedTasks}/{member.currentTasks + member.completedTasks}</span>
                      <span>Dernière activité: {formatDate(member.lastActivity)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMember(member)}
                        className="flex-1"
                      >
                        Détails
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      {member.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${member.phone}`, '_blank')}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun membre d'équipe trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={(updates) => {
            updateMemberMutation.mutate({ memberId: selectedMember.id, updates });
            setSelectedMember(null);
          }}
          onRemove={() => {
            removeMemberMutation.mutate(selectedMember.id);
            setSelectedMember(null);
          }}
          roles={roles || []}
        />
      )}
    </div>
  );
};

// Add Member Form Component
const AddMemberForm: React.FC<{
  onSubmit: (data: any) => void;
  isLoading: boolean;
  roles: TeamRole[];
}> = ({ onSubmit, isLoading, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    skills: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      joinDate: new Date().toISOString(),
      status: 'active',
      workload: 0,
      availability: 'available',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="role">Rôle</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="position">Poste</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
        <Textarea
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
          placeholder="JavaScript, React, Node.js..."
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Ajout...' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

// Member Detail Modal Component
const MemberDetailModal: React.FC<{
  member: TeamMember;
  onClose: () => void;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  roles: TeamRole[];
}> = ({ member, onClose, onUpdate, onRemove, roles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: member.status,
    role: member.role,
    position: member.position,
    workload: member.workload,
    availability: member.availability,
  });

  const handleUpdate = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du membre - {member.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Member Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-lg">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-gray-600">{member.position}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
              {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
              <p className="text-sm text-gray-500">Membre depuis {formatDate(member.joinDate)}</p>
            </div>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Statut</Label>
                <Select value={editData.status} onValueChange={(value: any) => setEditData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="on_leave">En congé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Disponibilité</Label>
                <Select value={editData.availability} onValueChange={(value: any) => setEditData(prev => ({ ...prev, availability: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="busy">Occupé</SelectItem>
                    <SelectItem value="unavailable">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rôle</Label>
                <Select value={editData.role} onValueChange={(value) => setEditData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Charge de travail (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.workload}
                  onChange={(e) => setEditData(prev => ({ ...prev, workload: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Statut</Label>
                <Badge className={getStatusColor(member.status)}>
                  {member.status === 'active' ? 'Actif' :
                   member.status === 'inactive' ? 'Inactif' : 'En congé'}
                </Badge>
              </div>
              <div>
                <Label>Charge de travail</Label>
                <p className="text-lg font-semibold">{member.workload}%</p>
              </div>
              <div>
                <Label>Performance</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{member.performance.rating}/5</span>
                  <Badge variant="outline">
                    {getPerformanceRating(member.performance.rating).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Tâches</Label>
                <p className="text-lg font-semibold">
                  {member.completedTasks}/{member.currentTasks + member.completedTasks}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          <div>
            <Label>Compétences</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {member.skills.map((skill, index) => (
                <Badge key={index} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>

          {/* Performance Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{member.performance.onTimeDelivery}%</p>
              <p className="text-sm text-gray-600">Livraisons à temps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{member.performance.qualityScore}%</p>
              <p className="text-sm text-gray-600">Score qualité</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{member.performance.rating}/5</p>
              <p className="text-sm text-gray-600">Évaluation globale</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="destructive" onClick={onRemove}>
              Retirer de l'équipe
            </Button>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdate}>
                    Sauvegarder
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamManagement;
