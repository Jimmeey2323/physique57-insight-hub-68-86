import React, { useMemo } from 'react';
import { ClientPatternsSection } from '@/components/dashboard/ClientPatternsSection';
import { Footer } from '@/components/ui/footer';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { useClientPatternsData } from '@/hooks/useClientPatternsData';
import { formatNumber, formatCurrency } from '@/utils/formatters';

const ClientPatterns = () => {
  const { data } = useClientPatternsData();

  const heroMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];

    const totalMembers = new Set(data.map(item => item.memberId)).size;
    const activeMembers = new Set(data.filter(item => item.membershipStatus === 'Active').map(item => item.memberId)).size;
    const totalRevenue = data.reduce((sum, item) => sum + (item.totalAmountPaid || 0), 0);
    const avgUtilization = data.length > 0 ? data.reduce((sum, item) => sum + (item.membershipUtilizationRate || 0), 0) / data.length : 0;

    return [
      {
        location: 'All Locations',
        label: 'Total Members',
        value: formatNumber(totalMembers)
      },
      {
        location: 'All Locations', 
        label: 'Active Members',
        value: formatNumber(activeMembers)
      },
      {
        location: 'All Locations',
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue)
      },
      {
        location: 'All Locations',
        label: 'Avg Utilization',
        value: `${avgUtilization.toFixed(1)}%`
      }
    ];
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <ModernHeroSection 
        title="Client Patterns & Behaviour"
        subtitle="Comprehensive analysis of client membership patterns, attendance behaviors, and engagement insights"
        variant="client"
        metrics={heroMetrics}
        onExport={() => console.log('Exporting client patterns data...')}
      />
      <main>
        <ClientPatternsSection data={data} />
      </main>
      <Footer />
    </div>
  );
};

export default ClientPatterns;