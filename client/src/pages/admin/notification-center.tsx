import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Users,
  Calendar,
  Clock,
  Send,
  Plus,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Star,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Globe,
  Target,
  RefreshCw,
  BarChart3,
  Edit
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recipients: string[];
  channels: ('email' | 'push' | 'in_app' | 'sms')[];
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  readBy: string[];
  clickCount: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: Notification['type'];
  category: string;
  variables: string[];
  isActive: boolean;
  usage_count: number;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'webhook';
  config: any;
  isActive: boolean;
  isDefault: boolean;
}

interface NotificationStats {
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  by_channel: Record<string, number>;
  by_type: Record<string, number>;
}

export const NotificationCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'channels' | 'stats'>('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    priority: 'medium' as Notification['priority'],
    category: '',
    recipients: [] as string[],
    channels: ['in_app'] as Notification['channels'],
    scheduledAt: ''
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'info' as Notification['type'],
    category: '',
    variables: [] as string[]
  });

  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['admin-notifications', statusFilter, typeFilter],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });
      const response = await fetch(`/api/admin/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Fetch templates
  const { data: templates } = useQuery<NotificationTemplate[]>({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/notification-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch channels
  const { data: channels } = useQuery<NotificationChannel[]>({
    queryKey: ['notification-channels'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/notification-channels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch channels');
      return response.json();
    }
  });

  // Fetch stats
  const { data: stats } = useQuery<NotificationStats>({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/notification-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });
      if (!response.ok) throw new Error('Failed to create notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowCreateNotification(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        category: '',
        recipients: [],
        channels: ['in_app'],
        scheduledAt: ''
      });
    }
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, notificationIds }: { action: string; notificationIds: string[] }) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notification_ids: notificationIds })
      });
      if (!response.ok) throw new Error('Failed to perform bulk action');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setSelectedNotifications([]);
    }
  });

  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      info: <Info className="h-4 w-4 text-blue-500" />,
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      error: <AlertTriangle className="h-4 w-4 text-red-500" />,
      system: <Settings className="h-4 w-4 text-gray-500" />
    };
    return icons[type];
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const configs = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Moyenne' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Haute' },
      critical: { color: 'bg-red-100 text-red-800', label: 'Critique' }
    };
    const config = configs[priority];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: Notification['status']) => {
    const configs = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Programmé' },
      sent: { color: 'bg-green-100 text-green-800', label: 'Envoyé' },
      delivered: { color: 'bg-emerald-100 text-emerald-800', label: 'Délivré' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Échec' }
    };
    const config = configs[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      email: <Mail className="h-4 w-4" />,
      push: <Smartphone className="h-4 w-4" />,
      in_app: <Monitor className="h-4 w-4" />,
      sms: <MessageSquare className="h-4 w-4" />
    };
    return icons[channel as keyof typeof icons];
  };

  const handleCreateNotification = () => {
    createNotificationMutation.mutate(newNotification);
  };

  const handleBulkAction = (action: string) => {
    if (selectedNotifications.length === 0) return;
    bulkActionMutation.mutate({ action, notificationIds: selectedNotifications });
  };

  if (notificationsLoading) {
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
            <Bell className="h-8 w-8 text-blue-600" />
            Centre de Notifications
          </h1>
          <p className="text-gray-600 mt-1">Gérez et envoyez des notifications multi-canal</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <BellRing className={`h-4 w-4 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <span className="text-sm text-gray-600">Temps réel</span>
          </div>
          <Button onClick={() => setShowCreateNotification(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Envoyé</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total_sent.toLocaleString()}</p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de Livraison</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivery_rate}%</p>
                  <p className="text-xs text-gray-500">{stats.delivered.toLocaleString()} délivrés</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'Ouverture</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.open_rate}%</p>
                  <p className="text-xs text-gray-500">{stats.opened.toLocaleString()} ouvertures</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux de Clic</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.click_rate}%</p>
                  <p className="text-xs text-gray-500">{stats.clicked.toLocaleString()} clics</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Canaux
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher des notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="scheduled">Programmé</SelectItem>
                      <SelectItem value="sent">Envoyé</SelectItem>
                      <SelectItem value="delivered">Délivré</SelectItem>
                      <SelectItem value="failed">Échec</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Succès</SelectItem>
                      <SelectItem value="warning">Avertissement</SelectItem>
                      <SelectItem value="error">Erreur</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    {selectedNotifications.length} notification(s) sélectionnée(s)
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('send')}>
                      <Send className="h-4 w-4 mr-1" />
                      Envoyer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                      <Archive className="h-4 w-4 mr-1" />
                      Archiver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications List */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedNotifications.length === notifications?.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNotifications(notifications?.map(n => n.id) || []);
                          } else {
                            setSelectedNotifications([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Notification</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Canaux</TableHead>
                    <TableHead>Destinataires</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications?.filter(notification =>
                    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNotifications([...selectedNotifications, notification.id]);
                            } else {
                              setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          {getTypeIcon(notification.type)}
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(notification.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {notification.channels.map((channel) => (
                            <div key={channel} className="p-1 bg-gray-100 rounded">
                              {getChannelIcon(channel)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{notification.recipients.length}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(notification.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
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
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer maintenant
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Programmer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
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
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de Notifications</h3>
            <Button onClick={() => setShowCreateTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{template.subject}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant="secondary">{template.usage_count} utilisations</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels?.map((channel) => (
              <Card key={channel.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.type)}
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                    <Switch checked={channel.isActive} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline">{channel.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Défaut:</span>
                      <Badge variant={channel.isDefault ? "default" : "secondary"}>
                        {channel.isDefault ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques par Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.by_channel).map(([channel, count]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(channel)}
                          <span className="capitalize">{channel}</span>
                        </div>
                        <Badge variant="outline">{count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques par Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type as Notification['type'])}
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge variant="outline">{count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Notification Dialog */}
      <Dialog open={showCreateNotification} onOpenChange={setShowCreateNotification}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une Nouvelle Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notificationTitle">Titre</Label>
              <Input
                id="notificationTitle"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                placeholder="Titre de la notification"
              />
            </div>
            <div>
              <Label htmlFor="notificationMessage">Message</Label>
              <Textarea
                id="notificationMessage"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                placeholder="Contenu de la notification"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notificationType">Type</Label>
                <Select value={newNotification.type} onValueChange={(value: Notification['type']) => setNewNotification({...newNotification, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                    <SelectItem value="error">Erreur</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notificationPriority">Priorité</Label>
                <Select value={newNotification.priority} onValueChange={(value: Notification['priority']) => setNewNotification({...newNotification, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Canaux de diffusion</Label>
              <div className="flex gap-4 mt-2">
                {['in_app', 'email', 'push', 'sms'].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel}
                      checked={newNotification.channels.includes(channel as any)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewNotification({
                            ...newNotification,
                            channels: [...newNotification.channels, channel as any]
                          });
                        } else {
                          setNewNotification({
                            ...newNotification,
                            channels: newNotification.channels.filter(c => c !== channel)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={channel} className="capitalize flex items-center gap-1">
                      {getChannelIcon(channel)}
                      {channel.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateNotification} className="flex-1" disabled={createNotificationMutation.isPending}>
                {createNotificationMutation.isPending ? 'Création...' : 'Créer la notification'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateNotification(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenterPage;
