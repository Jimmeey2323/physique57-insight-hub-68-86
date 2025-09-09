import React, { useMemo } from 'react';
import { MetricCard } from './MetricCard';
import { Users, TrendingUp, Calendar, Target, AlertTriangle, Award } from 'lucide-react';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ClientPatternsMetricCardsProps {
  data: ClientPatternsData[];
}

export const ClientPatternsMetricCards: React.FC<ClientPatternsMetricCardsProps> = ({ data }) => {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return Array(6).fill(null).map((_, index) => ({
        data: {
          title: ['Total Members', 'Active Members', 'Avg Attendance Rate', 'Total Revenue', 'High Risk Members', 'Avg Utilization'][index],
          value: '0',
          icon: 'members',
          change: 0,
          description: 'No data available',
          calculation: 'Data loading...'
        }
      }));
    }

    const totalMembers = new Set(data.map(item => item.memberId)).size;
    const activeMembers = new Set(data.filter(item => item.membershipStatus === 'Active').map(item => item.memberId)).size;
    const totalRevenue = data.reduce((sum, item) => sum + (item.totalAmountPaid || 0), 0);
    const avgAttendanceRate = data.length > 0 ? data.reduce((sum, item) => sum + (item.attendanceRate || 0), 0) / data.length : 0;
    const avgUtilizationRate = data.length > 0 ? data.reduce((sum, item) => sum + (item.membershipUtilizationRate || 0), 0) / data.length : 0;
    const highRiskMembers = new Set(data.filter(item => item.churnRiskAssessment === 'High Risk').map(item => item.memberId)).size;

    return [
      { data: { title: 'Total Members', value: formatNumber(totalMembers), icon: 'members', change: 0, description: 'Total unique members across all memberships', calculation: 'Count of unique member IDs' }},
      { data: { title: 'Active Members', value: formatNumber(activeMembers), icon: 'members', change: totalMembers > 0 ? ((activeMembers / totalMembers) * 100) - 70 : 0, description: 'Currently active members', calculation: 'Members with Active status' }},
      { data: { title: 'Avg Attendance Rate', value: `${avgAttendanceRate.toFixed(1)}%`, icon: 'revenue', change: avgAttendanceRate - 75, description: 'Sessions attended vs booked', calculation: 'Average attendance rate across all members' }},
      { data: { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: 'revenue', change: 0, description: 'From all memberships', calculation: 'Sum of total amount paid by all members' }},
      { data: { title: 'High Risk Members', value: formatNumber(highRiskMembers), icon: 'members', change: -(highRiskMembers / Math.max(totalMembers, 1)) * 100, description: 'Churn risk assessment', calculation: 'Members with High Risk churn assessment' }},
      { data: { title: 'Avg Utilization', value: `${avgUtilizationRate.toFixed(1)}%`, icon: 'revenue', change: avgUtilizationRate - 80, description: 'Membership utilization rate', calculation: 'Average membership utilization across all members' }},
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          data={metric.data}
        />
      ))}
    </div>
  );
};