import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, MapPin, Calendar, Users } from 'lucide-react';
import { ClientPatternsData } from '@/hooks/useClientPatternsData';

interface ClientPatternsFilterSectionProps {
  data: ClientPatternsData[];
  selectedLocation: string;
  selectedDateRange: string;
  selectedMembershipType: string;
  onLocationChange: (location: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  onMembershipTypeChange: (membershipType: string) => void;
}

export const ClientPatternsFilterSection: React.FC<ClientPatternsFilterSectionProps> = ({
  data,
  selectedLocation,
  selectedDateRange,
  selectedMembershipType,
  onLocationChange,
  onDateRangeChange,
  onMembershipTypeChange,
}) => {
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(data.map(item => item.locationName).filter(Boolean))];
    return ['All Locations', ...uniqueLocations.sort()];
  }, [data]);

  const membershipTypes = useMemo(() => {
    const uniqueTypes = [...new Set(data.map(item => item.type).filter(Boolean))];
    return ['All Types', ...uniqueTypes.sort()];
  }, [data]);

  const dateRanges = [
    'All Time',
    'Last 30 Days',
    'Last 60 Days',
    'Last 90 Days',
    'This Month',
    'Last Month',
    'This Quarter',
    'Last Quarter',
    'This Year',
    'Last Year'
  ];

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Client Patterns Filters
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membership Type
            </label>
            <Select value={selectedMembershipType} onValueChange={onMembershipTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                {membershipTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};