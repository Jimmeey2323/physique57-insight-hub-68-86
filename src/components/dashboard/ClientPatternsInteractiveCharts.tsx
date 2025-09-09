import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ClientPatternsInteractiveChartsProps {
  data: ClientPatternsData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#87d068', '#ffc0cb'];

export const ClientPatternsInteractiveCharts: React.FC<ClientPatternsInteractiveChartsProps> = ({ data }) => {
  
  // Revenue by Type Chart Data
  const revenueByTypeData = useMemo(() => {
    const typeRevenue: Record<string, number> = {};
    data.forEach(item => {
      const type = item.type || 'Unknown';
      typeRevenue[type] = (typeRevenue[type] || 0) + (item.totalAmountPaid || 0);
    });
    
    return Object.entries(typeRevenue)
      .map(([type, revenue]) => ({ type, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8); // Top 8 types
  }, [data]);

  // Member Status Distribution
  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const uniqueMembers = new Set();
    
    data.forEach(item => {
      if (!uniqueMembers.has(item.memberId)) {
        uniqueMembers.add(item.memberId);
        const status = item.membershipStatus || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  }, [data]);

  // Monthly Utilization Trend
  const utilizationTrendData = useMemo(() => {
    const monthlyStats: Record<string, { month: string, utilization: number, attendance: number, count: number }> = {};
    
    data.forEach(item => {
      if (!item.startDate) return;
      
      let date: Date;
      if (item.startDate.includes('/')) {
        const parts = item.startDate.split(' ')[0].split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (isNaN(date.getTime())) {
            date = new Date(parseInt(year), parseInt(day) - 1, parseInt(month));
          }
        } else {
          date = new Date(item.startDate);
        }
      } else {
        date = new Date(item.startDate);
      }
      
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { month: monthName, utilization: 0, attendance: 0, count: 0 };
      }
      
      monthlyStats[monthKey].utilization += item.membershipUtilizationRate || 0;
      monthlyStats[monthKey].attendance += item.attendanceRate || 0;
      monthlyStats[monthKey].count++;
    });
    
    return Object.values(monthlyStats)
      .map(stat => ({
        month: stat.month,
        utilization: stat.count > 0 ? stat.utilization / stat.count : 0,
        attendance: stat.count > 0 ? stat.attendance / stat.count : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [data]);

  // Engagement Level Distribution
  const engagementData = useMemo(() => {
    const engagementCounts: Record<string, number> = {};
    const uniqueMembers = new Set();
    
    data.forEach(item => {
      if (!uniqueMembers.has(item.memberId)) {
        uniqueMembers.add(item.memberId);
        const engagement = item.memberEngagementLevel || 'Unknown';
        engagementCounts[engagement] = (engagementCounts[engagement] || 0) + 1;
      }
    });
    
    return Object.entries(engagementCounts).map(([level, count]) => ({ level, count }));
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue by Type Chart */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue by Membership Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="type" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Member Status Distribution */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Member Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatNumber(value as number), 'Members']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Trend */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Utilization & Attendance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [`${(value as number).toFixed(1)}%`, name]}
                  labelStyle={{ color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Utilization"
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  name="Attendance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Level Distribution */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Member Engagement Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="level" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatNumber(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Members']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f97316" 
                  fill="#fed7aa" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};