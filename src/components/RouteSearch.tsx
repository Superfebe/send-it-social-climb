
import { useState } from 'react';
import { Search, Filter, MapPin, Mountain, Download, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RouteImportService } from '@/services/routeImportService';

interface RouteSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  climbType: string;
  gradeMin: string;
  gradeMax: string;
  area: string;
}

export function RouteSearch({ onSearch }: RouteSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    climbType: '',
    gradeMin: '',
    gradeMax: '',
    area: ''
  });
  
  const [isImporting, setIsImporting] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    // Convert "all" values back to empty strings for the actual filter
    const actualValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      climbType: '',
      gradeMin: '',
      gradeMax: '',
      area: ''
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const handleImportFromOpenBeta = async () => {
    if (!filters.query.trim()) {
      return;
    }

    setIsImporting(true);
    try {
      await RouteImportService.importRoutesFromOpenBeta(filters.query);
      // Refresh the search results
      onSearch(filters);
    } finally {
      setIsImporting(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search routes by name..."
          value={filters.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Import Button */}
      {filters.query && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportFromOpenBeta}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <Download className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {isImporting ? 'Importing...' : 'Import from OpenBeta'}
          </Button>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.climbType || 'all'} onValueChange={(value) => handleFilterChange('climbType', value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
            <SelectItem value="trad">Trad</SelectItem>
            <SelectItem value="boulder">Boulder</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
            <SelectItem value="aid">Aid</SelectItem>
            <SelectItem value="ice">Ice</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.gradeMin || 'all'} onValueChange={(value) => handleFilterChange('gradeMin', value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="5.6">5.6</SelectItem>
            <SelectItem value="5.7">5.7</SelectItem>
            <SelectItem value="5.8">5.8</SelectItem>
            <SelectItem value="5.9">5.9</SelectItem>
            <SelectItem value="5.10a">5.10a</SelectItem>
            <SelectItem value="5.10b">5.10b</SelectItem>
            <SelectItem value="5.10c">5.10c</SelectItem>
            <SelectItem value="5.10d">5.10d</SelectItem>
            <SelectItem value="5.11a">5.11a</SelectItem>
            <SelectItem value="5.11b">5.11b</SelectItem>
            <SelectItem value="5.11c">5.11c</SelectItem>
            <SelectItem value="5.11d">5.11d</SelectItem>
            <SelectItem value="5.12a">5.12a</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.gradeMax || 'all'} onValueChange={(value) => handleFilterChange('gradeMax', value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Max" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="5.6">5.6</SelectItem>
            <SelectItem value="5.7">5.7</SelectItem>
            <SelectItem value="5.8">5.8</SelectItem>
            <SelectItem value="5.9">5.9</SelectItem>
            <SelectItem value="5.10a">5.10a</SelectItem>
            <SelectItem value="5.10b">5.10b</SelectItem>
            <SelectItem value="5.10c">5.10c</SelectItem>
            <SelectItem value="5.10d">5.10d</SelectItem>
            <SelectItem value="5.11a">5.11a</SelectItem>
            <SelectItem value="5.11b">5.11b</SelectItem>
            <SelectItem value="5.11c">5.11c</SelectItem>
            <SelectItem value="5.11d">5.11d</SelectItem>
            <SelectItem value="5.12a">5.12a</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.query && (
            <Badge variant="secondary" className="text-xs">
              "{filters.query}"
            </Badge>
          )}
          {filters.climbType && (
            <Badge variant="secondary" className="text-xs capitalize">
              {filters.climbType}
            </Badge>
          )}
          {(filters.gradeMin || filters.gradeMax) && (
            <Badge variant="secondary" className="text-xs">
              {filters.gradeMin || '?'} - {filters.gradeMax || '?'}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
