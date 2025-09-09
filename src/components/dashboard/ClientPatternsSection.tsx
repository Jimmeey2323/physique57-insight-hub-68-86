import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';
import { ClientPatternsFilterSection } from './ClientPatternsFilterSection';
import { ClientPatternsMetricCards } from './ClientPatternsMetricCards';
import { ClientPatternsMonthOnMonthTable } from './ClientPatternsMonthOnMonthTable';
import { ClientPatternsChurnedTable } from './ClientPatternsChurnedTable';
import { ClientPatternsTypeAnalysisTable } from './ClientPatternsTypeAnalysisTable';
import { ClientPatternsInteractiveCharts } from './ClientPatternsInteractiveCharts';

interface ClientPatternsSectionProps {
  data: ClientPatternsData[];
}

export const ClientPatternsSection: React.FC<ClientPatternsSectionProps> = ({ data }) => {
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');
  const [selectedMembershipType, setSelectedMembershipType] = useState('All Types');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const locationMatch = selectedLocation === 'All Locations' || item.locationName === selectedLocation;
      const membershipMatch = selectedMembershipType === 'All Types' || item.type === selectedMembershipType;
      
      if (selectedDateRange === 'All Time') {
        return locationMatch && membershipMatch;
      }
      
      // Add date filtering logic here if needed
      return locationMatch && membershipMatch;
    });
  }, [data, selectedLocation, selectedDateRange, selectedMembershipType]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <ClientPatternsFilterSection
        data={data}
        selectedLocation={selectedLocation}
        selectedDateRange={selectedDateRange}
        selectedMembershipType={selectedMembershipType}
        onLocationChange={setSelectedLocation}
        onDateRangeChange={setSelectedDateRange}
        onMembershipTypeChange={setSelectedMembershipType}
      />

      <ClientPatternsMetricCards data={filteredData} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="month-on-month">Month-on-Month</TabsTrigger>
          <TabsTrigger value="churned">Churned Members</TabsTrigger>
          <TabsTrigger value="type-analysis">Type Analysis</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientPatternsMonthOnMonthTable data={filteredData} />
            <ClientPatternsTypeAnalysisTable data={filteredData} />
          </div>
        </TabsContent>

        <TabsContent value="month-on-month" className="space-y-6">
          <ClientPatternsMonthOnMonthTable data={filteredData} />
        </TabsContent>

        <TabsContent value="churned" className="space-y-6">
          <ClientPatternsChurnedTable data={filteredData} />
        </TabsContent>

        <TabsContent value="type-analysis" className="space-y-6">
          <ClientPatternsTypeAnalysisTable data={filteredData} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <ClientPatternsInteractiveCharts data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};