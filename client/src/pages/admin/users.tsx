import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building,
  MapPin,
  MoreHorizontal,
  Download,
  UserPlus,
  CheckCircle,
  Ban
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { FadeIn } from '../../components/animations';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'super_admin' | 'client';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  company_name?: string;
  address?: string;
  created_at: string;
  last_login?: string;
  projects_count?: number;
  total_spent?: number;
  // Additional properties for compatibility
  username?: string;
  fullName?: string;
  lastLogin?: string;
  createdAt?: string;
  projectsCount?: number;
}

interface UserStats {
  total_users: number;
  active_users: number;
  new_this_month: number;
  clients: number;
  admins: number;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      first_name: 'Ahmed',
      last_name: 'Ben Ali',
      email: 'ahmed.benali@email.com',
      role: 'client',
      status: 'active',
      created_at: '2025-01-15T08:00:00Z',
      last_login: '2025-06-06T10:30:00Z',
      projects_count: 3,
      username: 'ahmed.benali',
      fullName: 'Ahmed Ben Ali',
      lastLogin: '2025-06-06T10:30:00Z',
      createdAt: '2025-01-15T08:00:00Z',
      projectsCount: 3
    },
    {
      id: 2,
      first_name: 'Leila',
      last_name: 'Troudi',
      email: 'leila.troudi@email.com',
      role: 'admin',
      status: 'active',
      created_at: '2025-01-10T08:00:00Z',
      last_login: '2025-06-06T09:15:00Z',
      projects_count: 15,
      username: 'leila.troudi',
      fullName: 'Leila Troudi',
      lastLogin: '2025-06-06T09:15:00Z',
      createdAt: '2025-01-10T08:00:00Z',
      projectsCount: 15
    },
    {
      id: 3,
      first_name: 'Mohamed',
      last_name: 'Sassi',
      email: 'mohamed.sassi@email.com',
      role: 'client',
      status: 'inactive',
      created_at: '2025-02-01T08:00:00Z',
      last_login: '2025-06-04T14:20:00Z',
      projects_count: 1,
      username: 'mohamed.sassi',
      fullName: 'Mohamed Sassi',
      lastLogin: '2025-06-04T14:20:00Z',
      createdAt: '2025-02-01T08:00:00Z',
      projectsCount: 1
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'client' as 'client' | 'admin' | 'super_admin',
    password: ''
  });
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  const handleCreateUser = () => {
    const user: User = {
      id: Date.now(),
      first_name: newUser.fullName.split(' ')[0] || '',
      last_name: newUser.fullName.split(' ').slice(1).join(' ') || '',
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      projects_count: 0,
      username: newUser.username,
      fullName: newUser.fullName,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      projectsCount: 0
    };
    
    setUsers([...users, user]);
    setNewUser({
      username: '',
      fullName: '',
      email: '',
      role: 'client',
      password: ''
    });
    setShowNewUserDialog(false);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    clients: users.filter(u => u.role === 'client').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>            </DialogTrigger>            <DialogContent className="sm:max-w-md">
              <FadeIn>
                <DialogHeader>
                  <DialogTitle>Créer un Utilisateur</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouvel utilisateur à la plateforme
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">Nom d'utilisateur</Label>
                    <Input
                      id="newUsername"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="nom.utilisateur"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFullName">Nom complet</Label>
                    <Input
                      id="newFullName"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      placeholder="Nom Prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>                <div className="space-y-2">
                    <Label htmlFor="newRole">Rôle</Label>
                    <Select value={newUser.role} onValueChange={(value: 'client' | 'admin' | 'super_admin') => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mot de passe temporaire</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateUser} className="flex-1">
                      Créer l'utilisateur
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                      Annuler                    </Button>
                  </div>
                </div>
              </FadeIn>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.clients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou nom d'utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="super_admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(user.fullName || user.first_name + ' ' + user.last_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{user.fullName || `${user.first_name} ${user.last_name}`}</h3>
                      <Badge className={`text-xs ${getRoleColor(user.role)}`} variant="outline">
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' : 'Client'}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`} variant="outline">
                        {user.status === 'active' ? 'Actif' : 
                         user.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>@{user.username || 'N/A'}</span>
                      <span>{user.projectsCount || user.projects_count || 0} projets</span>
                      <span>Créé le {user.createdAt ? formatDate(user.createdAt) : user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                      <span>Dernière connexion: {user.lastLogin ? formatDate(user.lastLogin) : user.last_login ? formatDate(user.last_login) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>                    </AlertDialogTrigger>                    <AlertDialogContent>
                      <FadeIn>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {user.fullName || `${user.first_name} ${user.last_name}`} ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </FadeIn>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
