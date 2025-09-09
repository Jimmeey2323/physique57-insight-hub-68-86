import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientPatternsChurnedTableProps {
  data: ClientPatternsData[];
}

interface ChurnedMemberStats {
  memberId: string;
  memberName: string;
  memberEmail: string;
  membershipName: string;
  type: string;
  startDate: string;
  endDate: string;
  membershipLengthDays: number;
  totalAmountPaid: number;
  attendedSessions: number;
  totalSessions: number;
  utilizationRate: number;
  attendanceRate: number;
  churnReason: string;
  valueRealizationScore: number;
  lastActivityDate: string;
}

export const ClientPatternsChurnedTable: React.FC<ClientPatternsChurnedTableProps> = ({ data }) => {
  
  const churnedMembers = useMemo(() => {
    console.log('Processing churned members data:', data.length, 'records');
    
    // Filter for churned/expired members
    const churnedData = data.filter(item => 
      item.membershipStatus && 
      (item.membershipStatus.toLowerCase().includes('expired') || 
       item.membershipStatus.toLowerCase().includes('cancelled') ||
       item.membershipStatus.toLowerCase().includes('churned') ||
       item.daysUntilExpiry < 0)
    );

    // Group by member to get unique churned members
    const memberMap: Record<string, ChurnedMemberStats> = {};

    churnedData.forEach(item => {
      if (!item.memberId) return;

      if (!memberMap[item.memberId]) {
        memberMap[item.memberId] = {
          memberId: item.memberId,
          memberName: item.memberName || '',
          memberEmail: item.memberEmail || '',
          membershipName: item.membershipPackageName || '',
          type: item.type || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          membershipLengthDays: item.membershipLengthDays || 0,
          totalAmountPaid: item.totalAmountPaid || 0,
          attendedSessions: item.attendedSessionsCount || 0,
          totalSessions: item.totalSessionsBooked || 0,
          utilizationRate: item.membershipUtilizationRate || 0,
          attendanceRate: item.attendanceRate || 0,
          churnReason: item.cancellationReason || 'Unknown',
          valueRealizationScore: item.valueRealizationScore || 0,
          lastActivityDate: item.sessionStart || item.createdAt || '',
        };
      } else {
        // Update with latest data if this record has more recent information
        const current = memberMap[item.memberId];
        if (item.totalAmountPaid > current.totalAmountPaid) {
          current.totalAmountPaid = item.totalAmountPaid;
        }
        if (item.attendedSessionsCount > current.attendedSessions) {
          current.attendedSessions = item.attendedSessionsCount;
        }
        if (item.totalSessionsBooked > current.totalSessions) {
          current.totalSessions = item.totalSessionsBooked;
        }
        // Update activity date if more recent
        if (item.sessionStart && item.sessionStart > current.lastActivityDate) {
          current.lastActivityDate = item.sessionStart;
        }
      }
    });

    return Object.values(memberMap).sort((a, b) => {
      // Sort by end date (most recent first)
      return new Date(b.endDate || 0).getTime() - new Date(a.endDate || 0).getTime();
    });
  }, [data]);

  console.log('Churned members data prepared:', churnedMembers.length, 'members');

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalChurned = churnedMembers.length;
    const totalRevenueLost = churnedMembers.reduce((sum, member) => sum + member.totalAmountPaid, 0);
    const avgUtilization = totalChurned > 0 ? 
      churnedMembers.reduce((sum, member) => sum + member.utilizationRate, 0) / totalChurned : 0;
    const avgValueRealization = totalChurned > 0 ?
      churnedMembers.reduce((sum, member) => sum + member.valueRealizationScore, 0) / totalChurned : 0;

    return {
      totalChurned,
      totalRevenueLost,
      avgUtilization,
      avgValueRealization
    };
  }, [churnedMembers]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Churned</p>
                <p className="text-2xl font-bold text-red-700">{formatNumber(summaryStats.totalChurned)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Revenue Lost</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(summaryStats.totalRevenueLost)}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-yellow-700">{summaryStats.avgUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Value Score</p>
                <p className="text-2xl font-bold text-purple-700">{summaryStats.avgValueRealization.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Churned Members Table */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Churned Memberships Analysis
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
              {churnedMembers.length} Members
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-20">
                <TableRow className="bg-gray-50 border-none h-12">
                  <TableHead className="font-bold text-gray-900 text-xs px-4 sticky left-0 bg-gray-50 z-10 min-w-[150px]">Member</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 min-w-[200px]">Membership</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[80px]">Type</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Duration</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-right min-w-[120px]">Revenue</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Sessions</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Utilization</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Attendance</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[100px]">Value Score</TableHead>
                  <TableHead className="font-bold text-gray-900 text-xs px-3 text-center min-w-[150px]">Churn Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churnedMembers.map((member, index) => (
                  <TableRow 
                    key={member.memberId}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 h-10"
                  >
                    <TableCell className="font-semibold text-gray-900 text-xs px-4 sticky left-0 bg-white z-10 border-r">
                      <div>
                        <div className="font-medium">{member.memberName}</div>
                        <div className="text-gray-500 text-xs">{member.memberEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs px-3 font-medium truncate max-w-[200px]" title={member.membershipName}>
                      {member.membershipName}
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <Badge variant="outline" className="text-xs">
                        {member.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center font-medium">{member.membershipLengthDays} days</TableCell>
                    <TableCell className="text-xs px-3 text-right font-semibold text-red-600">{formatCurrency(member.totalAmountPaid)}</TableCell>
                    <TableCell className="text-xs px-3 text-center font-medium">{member.attendedSessions}/{member.totalSessions}</TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <span className={`font-semibold ${member.utilizationRate >= 70 ? 'text-green-600' : member.utilizationRate >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                        {member.utilizationRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <span className={`font-semibold ${member.attendanceRate >= 80 ? 'text-green-600' : member.attendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
                        {member.attendanceRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center">
                      <span className={`font-semibold ${member.valueRealizationScore >= 70 ? 'text-green-600' : member.valueRealizationScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {member.valueRealizationScore.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs px-3 text-center truncate max-w-[150px]" title={member.churnReason}>
                      {member.churnReason || 'Not specified'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};