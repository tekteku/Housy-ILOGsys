import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { LoadingSpinner } from '../../components/animations/LoadingAnimations';
import { FadeIn } from '../../components/animations';

interface Quotation {
  id: number;
  quote_number: string;
  client_id: number;
  client_name: string;
  client_email: string;
  project_title: string;
  category: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  valid_until: string;
  description: string;
  items: QuotationItem[];
}

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Helper functions for status styling
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft': return <Edit className="h-4 w-4" />;
    case 'sent': return <Send className="h-4 w-4" />;
    case 'accepted': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    case 'expired': return <Clock className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const AdminQuotationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const queryClient = useQueryClient();  // Fetch quotations
  const { data: quotationsResponse, isLoading } = useQuery({
    queryKey: ['admin-quotations'],
    queryFn: async () => {
      const response = await fetch('/api/quotations');
      if (!response.ok) throw new Error('Failed to fetch quotations');
      const result = await response.json();
      return result;
    }
  });

  // Ensure quotations is always an array - extract from data property
  const quotations = Array.isArray(quotationsResponse?.data) ? quotationsResponse.data : [];
  // Fetch quotation statistics
  const { data: statsResponse } = useQuery({
    queryKey: ['quotation-stats'],
    queryFn: async () => {
      const response = await fetch('/api/quotations/stats');
      if (!response.ok) throw new Error('Failed to fetch quotation stats');
      const result = await response.json();
      return result;
    }
  });

  // Extract stats from response data
  const stats = statsResponse?.data;

  // Update quotation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/quotations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update quotation status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation-stats'] });
    }
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete quotation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation-stats'] });
    }  });
  const filteredQuotations = quotations.filter((quotation: Quotation) => {
    if (!quotation) return false;
    
    const matchesSearch = (quotation.quote_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quotation.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quotation.project_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteMutation.mutate(id);
    }
  };  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" color="#3B82F6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quotations Management</h1>        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Quotation</DialogTitle>
            </DialogHeader>
            <CreateQuotationForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.accepted || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('fr-TN', { 
                      style: 'currency', 
                      currency: 'TND' 
                    }).format(stats.total_value || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search quotations by number, client, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Quote Number</th>
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Project</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Valid Until</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation: Quotation) => (
                  <tr key={quotation.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{quotation.quote_number}</td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{quotation.client_name}</div>
                        <div className="text-sm text-gray-500">{quotation.client_email}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{quotation.project_title}</div>
                        <div className="text-sm text-gray-500">{quotation.category}</div>
                      </div>
                    </td>
                    <td className="p-2 font-bold text-blue-600">
                      {new Intl.NumberFormat('fr-TN', { 
                        style: 'currency', 
                        currency: 'TND' 
                      }).format(quotation.total_amount)}
                    </td>
                    <td className="p-2">
                      <Badge className={`${getStatusColor(quotation.status)} flex items-center gap-1`}>
                        {getStatusIcon(quotation.status)}
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-gray-500">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-sm text-gray-500">
                      {new Date(quotation.valid_until).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select onValueChange={(status) => handleStatusUpdate(quotation.id, status)}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Send</SelectItem>
                            <SelectItem value="accepted">Accept</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>      {/* Quotation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <QuotationDetailsView quotation={selectedQuotation} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Quotation Form Component
const CreateQuotationForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    project_title: '',
    category: '',
    description: '',
    valid_until: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }]
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create quotation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotations'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_id">Client</Label>
          <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {/* Add client options here */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {/* Add category options here */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="project_title">Project Title</Label>
        <Input
          id="project_title"
          value={formData.project_title}
          onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="valid_until">Valid Until</Label>
        <Input
          id="valid_until"
          type="date"
          value={formData.valid_until}
          onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Quotation Items</Label>
          <Button type="button" onClick={addItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-6">
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                step="0.01"
                placeholder="Unit Price"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
              />
            </div>
            <div className="col-span-1 flex items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  items: prev.items.filter((_, i) => i !== index)
                }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
        </Button>
      </div>
    </form>
  );
};

// Quotation Details View Component
const QuotationDetailsView: React.FC<{ quotation: Quotation }> = ({ quotation }) => {
  const totalAmount = quotation.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{quotation.quote_number}</h3>
          <p className="text-gray-600">{quotation.project_title}</p>
        </div>
        <Badge className={`${getStatusColor(quotation.status)} flex items-center gap-1`}>
          {getStatusIcon(quotation.status)}
          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
        </Badge>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p>{quotation.client_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p>{quotation.client_email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p>{quotation.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p>{new Date(quotation.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Valid Until</Label>
                <p>{new Date(quotation.valid_until).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {quotation.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{quotation.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Unit Price</th>
                <th className="text-left p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.unit_price)}</td>
                  <td className="p-2 font-medium">{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
              <tr className="border-t-2 font-bold">
                <td colSpan={3} className="p-2 text-right">Total Amount:</td>
                <td className="p-2 text-blue-600 text-lg">
                  {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuotationsPage;
