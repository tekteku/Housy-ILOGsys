import React, { useState, useEffect } from 'react';
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
  Ban,
  Upload,
  FileText,
  BarChart3,
  Settings,
  History,
  Bell,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  RefreshCw,
  TrendingUp,
  Activity,
  Globe,
  Clock
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
  AlertDialogFooter,  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

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
  // New properties for enhanced functionality
  permissions?: string[];
  department?: string;
  manager_id?: number;
  notes?: string;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
}

interface UserStats {
  total_users: number;
  active_users: number;
  new_this_month: number;
  clients: number;
  admins: number;
  suspended_users: number;
  inactive_users: number;
  verified_users: number;
  last_30_days_logins: number;
  average_projects_per_user: number;
  total_revenue: number;
}

interface BulkAction {
  type: 'activate' | 'suspend' | 'delete' | 'change_role' | 'export' | 'send_notification';
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresConfirmation?: boolean;
}

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUserHistory, setShowUserHistory] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'client' as 'client' | 'admin' | 'super_admin',
    password: '',
    company_name: '',
    department: '',
    permissions: [] as string[]
  });

  const queryClient = useQueryClient();

  // Enhanced bulk actions
  const bulkActions: BulkAction[] = [
    {
      type: 'activate',
      label: 'Activer sélectionnés',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'default'
    },
    {
      type: 'suspend',
      label: 'Suspendre sélectionnés',
      icon: <UserX className="h-4 w-4" />,
      variant: 'secondary',
      requiresConfirmation: true
    },
    {
      type: 'change_role',
      label: 'Changer le rôle',
      icon: <Shield className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      type: 'send_notification',
      label: 'Envoyer notification',
      icon: <Bell className="h-4 w-4" />,
      variant: 'default'
    },
    {
      type: 'export',
      label: 'Exporter sélectionnés',
      icon: <Download className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      type: 'delete',
      label: 'Supprimer sélectionnés',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      requiresConfirmation: true
    }
  ];

  // Fetch users with filters
  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users', { search: searchTerm, role: roleFilter, status: statusFilter }],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return response.json();
    },
    enabled: true
  });

  // Fetch user statistics
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      return response.json();
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
    }
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, userIds, params }: { action: string; userIds: number[]; params?: any }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, user_ids: userIds, params })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      setSelectedUsers([]);
    }
  });

  // Export users mutation
  const exportUsersMutation = useMutation({
    mutationFn: async ({ format, userIds, filters }: { format: string; userIds?: number[]; filters?: any }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, user_ids: userIds, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to export users');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  });

  // Create user mutation with validation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
      setShowNewUserDialog(false);
      setNewUser({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'client',
        password: '',
        company_name: '',
        department: '',
        permissions: []
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: any }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    }
  });

  const users = usersResponse?.data || [];
  const stats = statsResponse?.data || {
    total_users: 0,
    active_users: 0,
    new_this_month: 0,
    clients: 0,
    admins: 0,
    suspended_users: 0,
    inactive_users: 0,
    verified_users: 0,
    last_30_days_logins: 0,
    average_projects_per_user: 0,
    total_revenue: 0
  };

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = users.filter((user: User) => {
      const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a: User, b: User) => {
      let aValue = a[sortBy as keyof User] || '';
      let bValue = b[sortBy as keyof User] || '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection helpers
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((user: User) => user.id));
    }
  };

  // Action handlers
  const handleBulkAction = (action: BulkAction) => {
    if (selectedUsers.length === 0) return;

    switch (action.type) {
      case 'activate':
        bulkActionMutation.mutate({ action: 'activate', userIds: selectedUsers });
        break;
      case 'suspend':
        bulkActionMutation.mutate({ action: 'suspend', userIds: selectedUsers });
        break;
      case 'delete':
        if (confirm('Êtes-vous sûr de vouloir supprimer ces utilisateurs ?')) {
          bulkActionMutation.mutate({ action: 'delete', userIds: selectedUsers });
        }
        break;
      case 'export':
        exportUsersMutation.mutate({ format: exportFormat, userIds: selectedUsers });
        break;
      case 'send_notification':
        // TODO: Implement notification sending
        break;
      case 'change_role':
        // TODO: Implement role change dialog
        break;
    }
  };

  const handleExportAll = () => {
    exportUsersMutation.mutate({ 
      format: exportFormat, 
      filters: { search: searchTerm, role: roleFilter, status: statusFilter }
    });
  };

  const handleCreateUser = () => {
    // Validation
    if (!newUser.email || !newUser.fullName || !newUser.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createUserMutation.mutate({
      username: newUser.username,
      full_name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      password: newUser.password,
      company_name: newUser.company_name,
      department: newUser.department,
      permissions: newUser.permissions
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Enhanced stats cards
  const enhancedStatsCards = [
    {
      title: 'Total Utilisateurs',
      value: stats?.total_users?.toLocaleString() || '0',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: `+${stats?.new_this_month || 0} ce mois`,
      trendPositive: true
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats?.active_users?.toLocaleString() || '0',
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      trend: `${Math.round(((stats?.active_users || 0) / (stats?.total_users || 1)) * 100)}% du total`,
      trendPositive: true
    },
    {
      title: 'Connexions (30j)',
      value: stats?.last_30_days_logins?.toLocaleString() || '0',
      icon: <Activity className="h-6 w-6 text-purple-600" />,
      trend: 'Derniers 30 jours',
      trendPositive: true
    },
    {
      title: 'Revenus Total',
      value: `€${stats?.total_revenue?.toLocaleString() || '0'}`,
      icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
      trend: `€${Math.round((stats?.total_revenue || 0) / (stats?.total_users || 1))} par utilisateur`,
      trendPositive: true
    }
  ];

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleUserStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  // Real-time stats effect
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  // Loading state
  if (usersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (usersError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-600">
              Impossible de charger les utilisateurs. Vérifiez votre connexion ou vos permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          </Button>          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                    Annuler                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {enhancedStatsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className={`text-xs mt-1 ${card.trendPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend}
                  </p>
                </div>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
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

      {/* Actions en lot et contrôles */}
      {selectedUsers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {selectedUsers.length} utilisateur(s) sélectionné(s)
                </span>
              </div>
              <div className="flex gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.type}
                    size="sm"
                    variant={action.variant || 'default'}
                    onClick={() => handleBulkAction(action)}
                    className="flex items-center gap-1"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des utilisateurs avec pagination */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Utilisateurs ({filteredAndSortedUsers.length})</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Page {currentPage} sur {totalPages} • {paginatedUsers.length} affichés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAllUsers}
            >
              {selectedUsers.length === paginatedUsers.length ? (
                <Square className="h-4 w-4" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
              Tout sélectionner
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-1" />
              Exporter tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedUsers.map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                  </div>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {(user.fullName || user.first_name + ' ' + user.last_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{user.fullName || `${user.first_name} ${user.last_name}`}</h3>
                      <Badge className={`text-xs ${getRoleColor(user.role)}`} variant="outline">
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' : 'Client'}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`} variant="outline">
                        {user.status === 'active' ? 'Actif' : 
                         user.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                      </Badge>
                      {user.email_verified && (
                        <Badge className="text-xs bg-green-100 text-green-800" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                      {user.two_factor_enabled && (
                        <Badge className="text-xs bg-blue-100 text-blue-800" variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          2FA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>@{user.username || 'N/A'}</span>
                      <span>{user.projectsCount || user.projects_count || 0} projets</span>
                      <span>Créé le {user.createdAt ? formatDate(user.createdAt) : user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                      <span>Dernière connexion: {user.lastLogin ? formatDate(user.lastLogin) : user.last_login ? formatDate(user.last_login) : 'N/A'}</span>
                      {user.total_spent && (
                        <span className="font-medium text-green-600">€{user.total_spent.toLocaleString()}</span>
                      )}
                    </div>
                    {user.company_name && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Building className="h-3 w-3" />
                        <span>{user.company_name}</span>
                        {user.department && <span> • {user.department}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                    className={user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    disabled={updateStatusMutation.isPending}
                  >
                    {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowUserHistory(true)}>
                        <History className="h-4 w-4 mr-2" />
                        Historique
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Réinitialiser mot de passe
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Afficher</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">par page</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <Button
                      size="sm"
                      variant={currentPage === totalPages ? "default" : "outline"}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
