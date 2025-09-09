import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientPatternsTypeAnalysisTableProps {
  data: ClientPatternsData[];
}

interface TypeAnalysisStats {
  type: string;
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  avgRevenue: number;
  totalAttendedSessions: number;
  avgAttendedSessions: number;
  totalBookedSessions: number;
  avgBookedSessions: number;
  avgUtilizationRate: number;
  avgAttendanceRate: number;
  avgValueRealizationScore: number;
  churnedMembers: number;
  churnRate: number;
}

export const ClientPatternsTypeAnalysisTable: React.FC<ClientPatternsTypeAnalysisTableProps> = ({ data }) => {
  
  const typeAnalysis = useMemo(() => {
    console.log('Processing type analysis data:', data.length, 'records');
    
    const typeStats: Record<string, TypeAnalysisStats> = {};

    data.forEach(item => {
      const type = item.type || 'Unknown';
      
      if (!typeStats[type]) {
        typeStats[type] = {
          type,
          totalMembers: 0,
          activeMembers: 0,
          totalRevenue: 0,
          avgRevenue: 0,
          totalAttendedSessions: 0,
          avgAttendedSessions: 0,
          totalBookedSessions: 0,
          avgBookedSessions: 0,
          avgUtilizationRate: 0,
          avgAttendanceRate: 0,
          avgValueRealizationScore: 0,
          churnedMembers: 0,
          churnRate: 0,
        };
      }
      
      const stat = typeStats[type];
      stat.totalMembers++;
      
      // Count active members
      if (item.membershipStatus === 'Active') {
        stat.activeMembers++;
      }
      
      // Count churned members
      if (item.membershipStatus && 
          (item.membershipStatus.toLowerCase().includes('expired') || 
           item.membershipStatus.toLowerCase().includes('cancelled') ||
           item.membershipStatus.toLowerCase().includes('churned') ||
           item.daysUntilExpiry < 0)) {
        stat.churnedMembers++;
      }
      
      // Accumulate revenue and sessions
      stat.totalRevenue += item.totalAmountPaid || 0;
      stat.totalAttendedSessions += item.attendedSessionsCount || 0;
      stat.totalBookedSessions += item.totalSessionsBooked || 0;
      
      // Accumulate rates for averaging
      stat.avgUtilizationRate += item.membershipUtilizationRate || 0;
      stat.avgAttendanceRate += item.attendanceRate || 0;
      stat.avgValueRealizationScore += item.valueRealizationScore || 0;
    });

    // Calculate averages and final metrics
    return Object.values(typeStats).map(stat => ({
      ...stat,
      avgRevenue: stat.totalMembers > 0 ? stat.totalRevenue / stat.totalMembers : 0,
      avgAttendedSessions: stat.totalMembers > 0 ? stat.totalAttendedSessions / stat.totalMembers : 0,
      avgBookedSessions: stat.totalMembers > 0 ? stat.totalBookedSessions / stat.totalMembers : 0,
      avgUtilizationRate: stat.totalMembers > 0 ? stat.avgUtilizationRate / stat.totalMembers : 0,
      avgAttendanceRate: stat.totalMembers > 0 ? stat.avgAttendanceRate / stat.totalMembers : 0,
      avgValueRealizationScore: stat.totalMembers > 0 ? stat.avgValueRealizationScore / stat.totalMembers : 0,
      churnRate: stat.totalMembers > 0 ? (stat.churnedMembers / stat.totalMembers) * 100 : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by total revenue descending
  }, [data]);

  console.log('Type analysis data prepared:', typeAnalysis.length, 'types');

  // Calculate totals for the totals row
  const totals = useMemo(() => {
    return typeAnalysis.reduce((acc, row) => ({
      totalMembers: acc.totalMembers + row.totalMembers,
      activeMembers: acc.activeMembers + row.activeMembers,
      totalRevenue: acc.totalRevenue + row.totalRevenue,
      totalAttendedSessions: acc.totalAttendedSessions + row.totalAttendedSessions,
      totalBookedSessions: acc.totalBookedSessions + row.totalBookedSessions,
      churnedMembers: acc.churnedMembers + row.churnedMembers,
      avgUtilizationRate: acc.avgUtilizationRate + (row.avgUtilizationRate * row.totalMembers),
      avgAttendanceRate: acc.avgAttendanceRate + (row.avgAttendanceRate * row.totalMembers),
      avgValueRealizationScore: acc.avgValueRealizationScore + (row.avgValueRealizationScore * row.totalMembers),
    }), {
      totalMembers: 0,
      activeMembers: 0,
      totalRevenue: 0,
      totalAttendedSessions: 0,
      totalBookedSessions: 0,
      churnedMembers: 0,
      avgUtilizationRate: 0,
      avgAttendanceRate: 0,
      avgValueRealizationScore: 0,
    });
  }, [typeAnalysis]);

  const totalsRow = useMemo(() => {
    return {
      type: 'ALL TYPES',
      totalMembers: totals.totalMembers,
      activeMembers: totals.activeMembers,
      totalRevenue: totals.totalRevenue,
      avgRevenue: totals.totalMembers > 0 ? totals.totalRevenue / totals.totalMembers : 0,
      totalAttendedSessions: totals.totalAttendedSessions,
      avgAttendedSessions: totals.totalMembers > 0 ? totals.totalAttendedSessions / totals.totalMembers : 0,
      totalBookedSessions: totals.totalBookedSessions,
      avgBookedSessions: totals.totalMembers > 0 ? totals.totalBookedSessions / totals.totalMembers : 0,
      avgUtilizationRate: totals.totalMembers > 0 ? totals.avgUtilizationRate / totals.totalMembers : 0,
      avgAttendanceRate: totals.totalMembers > 0 ? totals.avgAttendanceRate / totals.totalMembers : 0,
      avgValueRealizationScore: totals.totalMembers > 0 ? totals.avgValueRealizationScore / totals.totalMembers : 0,
      churnedMembers: totals.churnedMembers,
      churnRate: totals.totalMembers > 0 ? (totals.churnedMembers / totals.totalMembers) * 100 : 0,
    };
  }, [totals]);

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Membership Type Analysis
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
            {typeAnalysis.length} Types
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gray-50 border-none h-12">
                <TableHead className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-50 z-10 min-w-[150px]">Type</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Members</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Active</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[120px]">Total Rev</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[100px]">Avg Rev</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Attended</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Booked</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Utilization</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Attendance</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Value Score</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Churn Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typeAnalysis.map((row, index) => (
                <TableRow 
                  key={row.type}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 h-10"
                >
                  <TableCell className="font-semibold text-gray-900 text-xs px-4 sticky left-0 bg-white z-10 border-r">
                    <Badge variant="outline" className="text-xs">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.totalMembers)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium text-green-600">{formatNumber(row.activeMembers)}</TableCell>
                  <TableCell className="text-xs px-3 text-right font-semibold text-emerald-600">{formatCurrency(row.totalRevenue)}</TableCell>
                  <TableCell className="text-xs px-3 text-right font-medium">{formatCurrency(row.avgRevenue)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{row.avgAttendedSessions.toFixed(1)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{row.avgBookedSessions.toFixed(1)}</TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.avgUtilizationRate >= 80 ? 'text-green-600' : row.avgUtilizationRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.avgUtilizationRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.avgAttendanceRate >= 80 ? 'text-green-600' : row.avgAttendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.avgAttendanceRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.avgValueRealizationScore >= 70 ? 'text-green-600' : row.avgValueRealizationScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.avgValueRealizationScore.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.churnRate <= 20 ? 'text-green-600' : row.churnRate <= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.churnRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-gray-100 border-t-2 border-gray-300 font-bold hover:bg-gray-100">
                <TableCell className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-100 z-10 border-r">
                  <Badge variant="outline" className="text-xs font-bold">
                    {totalsRow.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.totalMembers)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold text-green-600">{formatNumber(totalsRow.activeMembers)}</TableCell>
                <TableCell className="text-xs px-3 text-right font-bold text-emerald-600">{formatCurrency(totalsRow.totalRevenue)}</TableCell>
                <TableCell className="text-xs px-3 text-right font-bold">{formatCurrency(totalsRow.avgRevenue)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{totalsRow.avgAttendedSessions.toFixed(1)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{totalsRow.avgBookedSessions.toFixed(1)}</TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.avgUtilizationRate >= 80 ? 'text-green-600' : totalsRow.avgUtilizationRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.avgUtilizationRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.avgAttendanceRate >= 80 ? 'text-green-600' : totalsRow.avgAttendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.avgAttendanceRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.avgValueRealizationScore >= 70 ? 'text-green-600' : totalsRow.avgValueRealizationScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.avgValueRealizationScore.toFixed(0)}
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.churnRate <= 20 ? 'text-green-600' : totalsRow.churnRate <= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.churnRate.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};