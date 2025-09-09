import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientPatternsMonthOnMonthTableProps {
  data: ClientPatternsData[];
}

interface MonthlyMembershipStats {
  month: string;
  sortKey: string;
  membershipName: string;
  totalMembers: number;
  avgAttendedClasses: number;
  revenueFromAttended: number;
  revenueFromBooked: number;
  revenueFromProjected: number;
  utilizationRate: number;
  attendanceRate: number;
}

export const ClientPatternsMonthOnMonthTable: React.FC<ClientPatternsMonthOnMonthTableProps> = ({ data }) => {
  
  const monthlyData = useMemo(() => {
    console.log('Processing month-on-month data:', data.length, 'records');
    
    const monthlyStats: Record<string, MonthlyMembershipStats> = {};

    data.forEach(item => {
      if (!item.startDate || !item.membershipPackageName) return;

      let date: Date;
      
      // Handle different date formats
      if (item.startDate.includes('/')) {
        const parts = item.startDate.split(' ')[0].split('/');
        if (parts.length === 3) {
          // Try DD/MM/YYYY format first
          const [day, month, year] = parts;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // If invalid, try MM/DD/YYYY format
          if (isNaN(date.getTime())) {
            date = new Date(parseInt(year), parseInt(day) - 1, parseInt(month));
          }
        } else {
          date = new Date(item.startDate);
        }
      } else {
        date = new Date(item.startDate);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', item.startDate);
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Create unique key for month + membership combination
      const key = `${monthKey}-${item.membershipPackageName}`;
      
      if (!monthlyStats[key]) {
        monthlyStats[key] = {
          month: monthName,
          sortKey: monthKey,
          membershipName: item.membershipPackageName,
          totalMembers: 0,
          avgAttendedClasses: 0,
          revenueFromAttended: 0,
          revenueFromBooked: 0,
          revenueFromProjected: 0,
          utilizationRate: 0,
          attendanceRate: 0,
        };
      }
      
      const stat = monthlyStats[key];
      stat.totalMembers++;
      
      // Calculate averages and sums
      stat.avgAttendedClasses += item.attendedSessionsCount || 0;
      stat.revenueFromAttended += (item.attendedSessionsCount || 0) * (item.pricePerSessionAttended || 0);
      stat.revenueFromBooked += (item.totalSessionsBooked || 0) * (item.pricePerSessionBooked || 0);
      stat.revenueFromProjected += (item.projectedTotalSessions || 0) * (item.pricePerProjectedSession || 0);
      stat.utilizationRate += item.membershipUtilizationRate || 0;
      stat.attendanceRate += item.attendanceRate || 0;
    });

    // Convert to array and calculate final averages
    return Object.values(monthlyStats).map(stat => ({
      ...stat,
      avgAttendedClasses: stat.totalMembers > 0 ? stat.avgAttendedClasses / stat.totalMembers : 0,
      utilizationRate: stat.totalMembers > 0 ? stat.utilizationRate / stat.totalMembers : 0,
      attendanceRate: stat.totalMembers > 0 ? stat.attendanceRate / stat.totalMembers : 0,
    })).sort((a, b) => {
      // First sort by month
      const monthCompare = a.sortKey.localeCompare(b.sortKey);
      if (monthCompare !== 0) return monthCompare;
      // Then sort by membership name
      return a.membershipName.localeCompare(b.membershipName);
    });
  }, [data]);

  console.log('Month-on-month data prepared:', monthlyData.length, 'entries');

  // Calculate totals for the totals row
  const totals = useMemo(() => {
    return monthlyData.reduce((acc, row) => ({
      totalMembers: acc.totalMembers + row.totalMembers,
      avgAttendedClasses: acc.avgAttendedClasses + (row.avgAttendedClasses * row.totalMembers),
      revenueFromAttended: acc.revenueFromAttended + row.revenueFromAttended,
      revenueFromBooked: acc.revenueFromBooked + row.revenueFromBooked,
      revenueFromProjected: acc.revenueFromProjected + row.revenueFromProjected,
      utilizationRate: acc.utilizationRate + (row.utilizationRate * row.totalMembers),
      attendanceRate: acc.attendanceRate + (row.attendanceRate * row.totalMembers),
    }), {
      totalMembers: 0,
      avgAttendedClasses: 0,
      revenueFromAttended: 0,
      revenueFromBooked: 0,
      revenueFromProjected: 0,
      utilizationRate: 0,
      attendanceRate: 0,
    });
  }, [monthlyData]);

  const totalsRow = useMemo(() => {
    return {
      month: 'TOTALS',
      membershipName: 'All Memberships',
      totalMembers: totals.totalMembers,
      avgAttendedClasses: totals.totalMembers > 0 ? totals.avgAttendedClasses / totals.totalMembers : 0,
      revenueFromAttended: totals.revenueFromAttended,
      revenueFromBooked: totals.revenueFromBooked,
      revenueFromProjected: totals.revenueFromProjected,
      utilizationRate: totals.totalMembers > 0 ? totals.utilizationRate / totals.totalMembers : 0,
      attendanceRate: totals.totalMembers > 0 ? totals.attendanceRate / totals.totalMembers : 0,
    };
  }, [totals]);

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Month-on-Month Membership Analysis
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
            {monthlyData.length} Entries
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-20">
              <TableRow className="bg-gray-50 border-none h-12">
                <TableHead className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-50 z-10 min-w-[100px]">Month</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 min-w-[200px]">Membership</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Members</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[120px]">Avg Classes</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[120px]">Rev Attended</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[120px]">Rev Booked</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[120px]">Rev Projected</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Utilization</TableHead>
                <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((row, index) => (
                <TableRow 
                  key={`${row.month}-${row.membershipName}`}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 h-10"
                >
                  <TableCell className="font-semibold text-gray-900 text-xs px-4 sticky left-0 bg-white z-10 border-r">{row.month}</TableCell>
                  <TableCell className="text-xs px-3 font-medium truncate max-w-[200px]" title={row.membershipName}>
                    {row.membershipName}
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{formatNumber(row.totalMembers)}</TableCell>
                  <TableCell className="text-xs px-3 text-center font-medium">{row.avgAttendedClasses.toFixed(1)}</TableCell>
                  <TableCell className="text-xs px-3 text-right font-semibold text-emerald-600">{formatCurrency(row.revenueFromAttended)}</TableCell>
                  <TableCell className="text-xs px-3 text-right font-semibold text-blue-600">{formatCurrency(row.revenueFromBooked)}</TableCell>
                  <TableCell className="text-xs px-3 text-right font-semibold text-purple-600">{formatCurrency(row.revenueFromProjected)}</TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.utilizationRate >= 80 ? 'text-green-600' : row.utilizationRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.utilizationRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-xs px-3 text-center">
                    <span className={`font-semibold ${row.attendanceRate >= 80 ? 'text-green-600' : row.attendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                      {row.attendanceRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-gray-100 border-t-2 border-gray-300 font-bold hover:bg-gray-100">
                <TableCell className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-100 z-10 border-r">{totalsRow.month}</TableCell>
                <TableCell className="text-xs px-3 font-bold">{totalsRow.membershipName}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{formatNumber(totalsRow.totalMembers)}</TableCell>
                <TableCell className="text-xs px-3 text-center font-bold">{totalsRow.avgAttendedClasses.toFixed(1)}</TableCell>
                <TableCell className="text-xs px-3 text-right font-bold text-emerald-600">{formatCurrency(totalsRow.revenueFromAttended)}</TableCell>
                <TableCell className="text-xs px-3 text-right font-bold text-blue-600">{formatCurrency(totalsRow.revenueFromBooked)}</TableCell>
                <TableCell className="text-xs px-3 text-right font-bold text-purple-600">{formatCurrency(totalsRow.revenueFromProjected)}</TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.utilizationRate >= 80 ? 'text-green-600' : totalsRow.utilizationRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.utilizationRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-xs px-3 text-center">
                  <span className={`font-bold ${totalsRow.attendanceRate >= 80 ? 'text-green-600' : totalsRow.attendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                    {totalsRow.attendanceRate.toFixed(1)}%
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