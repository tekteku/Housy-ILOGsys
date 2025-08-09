import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  FileText,
  DollarSign,
  Settings
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FadeIn } from '../../components/animations';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'project' | 'quotation' | 'client' | 'system' | 'payment';
  is_read: boolean;
  created_at: string;
  related_id?: number;
  related_type?: string;
  action_url?: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  new_projects: boolean;
  quotation_updates: boolean;
  client_messages: boolean;
  system_alerts: boolean;
  payment_notifications: boolean;
}

const AdminNotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    }
  });

  const notifications = Array.isArray(notificationsResponse?.data) ? notificationsResponse.data : [];
  // Fetch notification settings
  const { data: settingsResponse } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/settings');
      if (!response.ok) throw new Error('Failed to fetch notification settings');
      return response.json();
    }
  });

  const settings = settingsResponse?.data;
  // Fetch notification statistics
  const { data: statsResponse } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/stats');
      if (!response.ok) throw new Error('Failed to fetch notification stats');
      return response.json();
    }
  });

  const stats = statsResponse?.data;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to update notification settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return <Building className="h-4 w-4" />;
      case 'quotation': return <FileText className="h-4 w-4" />;
      case 'client': return <User className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    const matchesRead = readFilter === 'all' || 
                       (readFilter === 'read' && notification.is_read) ||
                       (readFilter === 'unread' && !notification.is_read);
    
    return matchesSearch && matchesType && matchesCategory && matchesRead;
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setIsDetailsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications Center</h1>
        <div className="flex gap-2">
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unread || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="quotation">Quotations</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredNotifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryIcon(notification.category)}
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTypeColor(notification.type)} flex items-center gap-1`}>
                          {getTypeIcon(notification.type)}
                          {notification.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(notification.category)}
                          {notification.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No notifications found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>      {/* Notification Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <FadeIn>
              <DialogHeader>
                <DialogTitle>Notification Details</DialogTitle>
              </DialogHeader>
              {selectedNotification && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedNotification.category)}
                    <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
                    <Badge className={`${getTypeColor(selectedNotification.type)} flex items-center gap-1`}>
                      {getTypeIcon(selectedNotification.type)}
                      {selectedNotification.type}
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedNotification.message}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Category</Label>
                      <p className="capitalize">{selectedNotification.category}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Created</Label>
                      <p>{new Date(selectedNotification.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status</Label>
                      <p>{selectedNotification.is_read ? 'Read' : 'Unread'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Type</Label>
                      <p className="capitalize">{selectedNotification.type}</p>
                    </div>
                  </div>
                  
                  {selectedNotification.action_url && (
                    <div className="pt-4">
                      <Button asChild>
                        <a href={selectedNotification.action_url}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Related Item
                        </a>
                      </Button>
                    </div>
                  )}                </div>
              )}
            </FadeIn>
          </DialogContent>
      </Dialog>      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-md">
            <FadeIn>
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
              </DialogHeader>
              {settings && (
                <NotificationSettings 
                  settings={settings} 
                  onUpdate={(newSettings) => updateSettingsMutation.mutate(newSettings)}
                  onClose={() => setIsSettingsDialogOpen(false)}                />
              )}
            </FadeIn>
          </DialogContent>
      </Dialog>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings: React.FC<{
  settings: NotificationSettings;
  onUpdate: (settings: Partial<NotificationSettings>) => void;
  onClose: () => void;
}> = ({ settings, onUpdate, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="delivery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="delivery" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              id="email"
              checked={localSettings.email_notifications}
              onCheckedChange={() => handleToggle('email_notifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push">Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              id="push"
              checked={localSettings.push_notifications}
              onCheckedChange={() => handleToggle('push_notifications')}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="projects">New Projects</Label>
              <p className="text-sm text-gray-500">Notifications for new project requests</p>
            </div>
            <Switch
              id="projects"
              checked={localSettings.new_projects}
              onCheckedChange={() => handleToggle('new_projects')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quotations">Quotation Updates</Label>
              <p className="text-sm text-gray-500">Updates on quotation status changes</p>
            </div>
            <Switch
              id="quotations"
              checked={localSettings.quotation_updates}
              onCheckedChange={() => handleToggle('quotation_updates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="messages">Client Messages</Label>
              <p className="text-sm text-gray-500">New messages from clients</p>
            </div>
            <Switch
              id="messages"
              checked={localSettings.client_messages}
              onCheckedChange={() => handleToggle('client_messages')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system">System Alerts</Label>
              <p className="text-sm text-gray-500">Important system notifications</p>
            </div>
            <Switch
              id="system"
              checked={localSettings.system_alerts}
              onCheckedChange={() => handleToggle('system_alerts')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payments">Payment Notifications</Label>
              <p className="text-sm text-gray-500">Payment updates and reminders</p>
            </div>
            <Switch
              id="payments"
              checked={localSettings.payment_notifications}
              onCheckedChange={() => handleToggle('payment_notifications')}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
