import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Lock,
  Unlock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Key,
  UserPlus,
  UserMinus,
  Crown,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  actions: string[];
  level: 'read' | 'write' | 'admin' | 'super_admin';
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  lastLogin?: string;
  isActive: boolean;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export const PermissionManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users' | 'audit'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    permissions: [] as string[]
  });
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    category: '',
    resource: '',
    actions: [] as string[],
    level: 'read' as Permission['level']
  });

  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  // Fetch permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    }
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users-permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users?include=roles,permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLoading } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/audit-logs?category=permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowCreateRole(false);
      setNewRole({ name: '', description: '', color: '#3B82F6', permissions: [] });
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: any }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleData)
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditingRole(null);
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    }
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (permissionData: any) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionData)
      });
      if (!response.ok) throw new Error('Failed to create permission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      setShowCreatePermission(false);
      setNewPermission({
        name: '',
        description: '',
        category: '',
        resource: '',
        actions: [],
        level: 'read'
      });
    }
  });

  // Bulk assign roles mutation
  const bulkAssignRolesMutation = useMutation({
    mutationFn: async ({ userIds, roleIds, action }: { userIds: string[]; roleIds: string[]; action: 'add' | 'remove' }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users/bulk-roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_ids: userIds, role_ids: roleIds, action })
      });
      if (!response.ok) throw new Error('Failed to assign roles');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-permissions'] });
      setSelectedUsers([]);
    }
  });

  const handleCreateRole = () => {
    createRoleMutation.mutate(newRole);
  };

  const handleCreatePermission = () => {
    createPermissionMutation.mutate(newPermission);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const getRoleColor = (color: string) => {
    return {
      backgroundColor: color + '20',
      borderColor: color,
      color: color
    };
  };

  const getPermissionLevelBadge = (level: Permission['level']) => {
    const configs = {
      read: { color: 'bg-green-100 text-green-800', label: 'Lecture' },
      write: { color: 'bg-blue-100 text-blue-800', label: 'Écriture' },
      admin: { color: 'bg-orange-100 text-orange-800', label: 'Admin' },
      super_admin: { color: 'bg-red-100 text-red-800', label: 'Super Admin' }
    };
    const config = configs[level];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (rolesLoading || permissionsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Gestion des Permissions
          </h1>
          <p className="text-gray-600 mt-1">Gérez les rôles, permissions et accès utilisateurs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateRole(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rôle
          </Button>
          <Button variant="outline" onClick={() => setShowCreatePermission(true)}>
            <Key className="h-4 w-4 mr-2" />
            Nouvelle Permission
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-1">
            {[
              { id: 'roles', label: 'Rôles', icon: Crown },
              { id: 'permissions', label: 'Permissions', icon: Key },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'audit', label: 'Audit', icon: Eye }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="project">Projet</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.filter(role => 
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((role) => (
            <Card key={role.id} className="border-l-4" style={{ borderLeftColor: role.color }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5" style={{ color: role.color }} />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingRole(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button size="sm" variant="outline" onClick={() => handleDeleteRole(role.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Utilisateurs:</span>
                    <Badge variant="outline">{role.userCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Permissions:</span>
                    <Badge variant="outline">{role.permissions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut:</span>
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  {role.isSystem && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Lock className="h-3 w-3" />
                      Rôle système
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions?.filter(permission => 
                  permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  permission.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-600">{permission.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{permission.category}</Badge>
                    </TableCell>
                    <TableCell>{permission.resource}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {permission.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getPermissionLevelBadge(permission.level)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {permission.isSystem ? (
                          <Lock className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Unlock className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">
                          {permission.isSystem ? 'Système' : 'Personnalisé'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setEditingPermission(permission)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!permission.isSystem && (
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {selectedUsers.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assigner Rôle
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserMinus className="h-4 w-4 mr-1" />
                      Retirer Rôle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUsers.length === users?.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(users?.map(u => u.id) || []);
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôles</TableHead>
                    <TableHead>Permissions Directes</TableHead>
                    <TableHead>Dernière Connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge 
                              key={role.id} 
                              variant="outline"
                              style={getRoleColor(role.color)}
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.permissions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Jamais</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier rôles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="h-4 w-4 mr-2" />
                              Gérer permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Journal d'Audit des Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-sm text-gray-600">ID: {log.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{log.details}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{log.ipAddress}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleName">Nom du rôle</Label>
              <Input
                id="roleName"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="Ex: Gestionnaire de projet"
              />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Description du rôle et de ses responsabilités"
              />
            </div>
            <div>
              <Label htmlFor="roleColor">Couleur</Label>
              <Input
                id="roleColor"
                type="color"
                value={newRole.color}
                onChange={(e) => setNewRole({...newRole, color: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateRole} className="flex-1" disabled={createRoleMutation.isPending}>
                {createRoleMutation.isPending ? 'Création...' : 'Créer le rôle'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog open={showCreatePermission} onOpenChange={setShowCreatePermission}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une Nouvelle Permission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="permissionName">Nom de la permission</Label>
              <Input
                id="permissionName"
                value={newPermission.name}
                onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                placeholder="Ex: manage_projects"
              />
            </div>
            <div>
              <Label htmlFor="permissionDescription">Description</Label>
              <Textarea
                id="permissionDescription"
                value={newPermission.description}
                onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
                placeholder="Description de ce que permet cette permission"
              />
            </div>
            <div>
              <Label htmlFor="permissionCategory">Catégorie</Label>
              <Select value={newPermission.category} onValueChange={(value) => setNewPermission({...newPermission, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="project">Projet</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="permissionLevel">Niveau</Label>
              <Select value={newPermission.level} onValueChange={(value: Permission['level']) => setNewPermission({...newPermission, level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Lecture</SelectItem>
                  <SelectItem value="write">Écriture</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePermission} className="flex-1" disabled={createPermissionMutation.isPending}>
                {createPermissionMutation.isPending ? 'Création...' : 'Créer la permission'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreatePermission(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionManagementPage;
