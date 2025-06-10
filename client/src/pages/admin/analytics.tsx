import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign,
  Calendar,
  PieChart,
  Activity,
  Building,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalProjects: number;
    activeClients: number;
    completedProjects: number;
    pendingQuotations: number;
    conversionRate: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    projects: number;
  }>;
  projectsByCategory: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  clientGrowth: Array<{
    month: string;
    newClients: number;
    totalClients: number;
  }>;
  quotationStats: Array<{
    status: string;
    count: number;
    value: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center text-gray-500">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('fr-TN', { 
                    style: 'currency', 
                    currency: 'TND' 
                  }).format(analytics.overview.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.totalProjects}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.overview.activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.overview.pendingQuotations}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.overview.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue & Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' 
                      ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(Number(value))
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Projects'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#82ca9d" name="Projects" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Projects by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={analytics.projectsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.projectsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.clientGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newClients" stroke="#8884d8" name="New Clients" />
                <Line type="monotone" dataKey="totalClients" stroke="#82ca9d" name="Total Clients" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quotation Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.quotationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' 
                      ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(Number(value))
                      : value,
                    name === 'value' ? 'Value' : 'Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Count" />
                <Bar dataKey="value" fill="#82ca9d" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Category Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Projects</th>
                  <th className="text-left p-3">Total Value</th>
                  <th className="text-left p-3">Avg. Project Value</th>
                  <th className="text-left p-3">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {analytics.projectsByCategory.map((category, index) => {
                  const avgValue = category.value / category.count;
                  const totalProjects = analytics.projectsByCategory.reduce((sum, cat) => sum + cat.count, 0);
                  const marketShare = (category.count / totalProjects) * 100;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{category.category}</td>
                      <td className="p-3">{category.count}</td>
                      <td className="p-3 font-medium text-green-600">
                        {new Intl.NumberFormat('fr-TN', { 
                          style: 'currency', 
                          currency: 'TND' 
                        }).format(category.value)}
                      </td>
                      <td className="p-3">
                        {new Intl.NumberFormat('fr-TN', { 
                          style: 'currency', 
                          currency: 'TND' 
                        }).format(avgValue)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${marketShare}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{marketShare.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.projectsByCategory
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="text-sm font-medium text-green-600">
                      {new Intl.NumberFormat('fr-TN', { 
                        style: 'currency', 
                        currency: 'TND',
                        notation: 'compact'
                      }).format(category.value)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Most Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.projectsByCategory
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="text-sm font-medium text-blue-600">
                      {category.count} projects
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Quotations</span>
                <span className="text-sm font-medium text-orange-600">
                  {analytics.overview.pendingQuotations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion Rate</span>
                <span className={`text-sm font-medium ${
                  analytics.overview.conversionRate < 30 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {analytics.overview.conversionRate}%
                </span>
              </div>
              {analytics.quotationStats
                .filter(stat => stat.status === 'rejected')
                .map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">Rejected Quotes</span>
                    <span className="text-sm font-medium text-red-600">
                      {stat.count}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
