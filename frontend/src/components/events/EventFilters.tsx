'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, Tag, Monitor, DollarSign, SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface EventFiltersData {
  search: string;
  eventMode: string;
  priceRange: string;
  dateRange: string;
}

interface EventFiltersProps {
  onFilterChange: (filters: EventFiltersData) => void;
  categories?: string[]; // Kept optional for backward compat if needed, but unused
}

const eventModes = [
  { value: '', label: 'All Modes' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
  { value: '0-500', label: 'Under ৳500' },
  { value: '500-1000', label: '৳500 - ৳1000' },
  { value: '1000+', label: 'Over ৳1000' },
];

const dateRanges = [
  { value: '', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'next_month', label: 'Next Month' },
];

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<EventFiltersData>({
    search: '',
    eventMode: '',
    priceRange: '',
    dateRange: '',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilter = (key: keyof EventFiltersData, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: EventFiltersData = {
      search: '',
      eventMode: '',
      priceRange: '',
      dateRange: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setShowMobileFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="w-full">
      {/* Modern Filter Container */}
      <div className="bg-white rounded-2xl md:rounded-full shadow-lg shadow-gray-200/50 border border-gray-100 p-2 md:p-3 relative z-20">
        <div className="flex flex-col md:flex-row gap-2">

          {/* Search Input - Main Focus */}
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-blue-50 text-[#004aad] w-8 h-8 rounded-full transition-all group-focus-within:bg-[#004aad] group-focus-within:text-white">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search for events, topics..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full h-12 md:h-14 pl-14 pr-4 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border-0 rounded-xl md:rounded-full text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004aad]/20 transition-all font-medium text-base"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#ff7620]"></span>
            )}
          </button>

          {/* Desktop Filters Rows - Clean Dropdowns */}
          <div className="hidden md:flex gap-2 items-center">
            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mx-1"></div>

            {/* Event Mode Filter (formerly Type) */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#004aad] transition-colors">
                <Monitor className="w-4 h-4" />
              </div>
              <select
                value={filters.eventMode}
                onChange={(e) => updateFilter('eventMode', e.target.value)}
                className="h-14 pl-9 pr-8 bg-transparent hover:bg-gray-50 border-0 rounded-lg text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer transition-colors appearance-none min-w-[120px]"
              >
                {eventModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.value === '' ? 'Mode' : mode.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Price Filter */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#004aad] transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <select
                value={filters.priceRange}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
                className="h-14 pl-9 pr-8 bg-transparent hover:bg-gray-50 border-0 rounded-lg text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer transition-colors appearance-none min-w-[120px]"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.value === '' ? 'Price' : range.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#004aad] transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="h-14 pl-9 pr-8 bg-transparent hover:bg-gray-50 border-0 rounded-lg text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer transition-colors appearance-none min-w-[120px]"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.value === '' ? 'Date' : range.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button (Desktop) */}
          <button className="hidden md:flex items-center justify-center bg-[#004aad] hover:bg-[#003882] text-white w-14 h-14 rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95">
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* Active Filters Summary & Clear */}
        {hasActiveFilters && (
          <div className="hidden md:flex items-center gap-2 mt-2 px-4 pb-1 animate-fade-in">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters.eventMode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                  {eventModes.find(t => t.value === filters.eventMode)?.label}
                  <button onClick={() => updateFilter('eventMode', '')}><X className="w-3 h-3 hover:text-purple-900" /></button>
                </span>
              )}
              {filters.priceRange && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                  {priceRanges.find(r => r.value === filters.priceRange)?.label}
                  <button onClick={() => updateFilter('priceRange', '')}><X className="w-3 h-3 hover:text-green-900" /></button>
                </span>
              )}
              {filters.dateRange && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
                  {dateRanges.find(r => r.value === filters.dateRange)?.label}
                  <button onClick={() => updateFilter('dateRange', '')}><X className="w-3 h-3 hover:text-orange-900" /></button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 ml-2 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filters Modal/Expandable */}
      {showMobileFilters && (
        <div className="md:hidden mt-3 bg-white rounded-2xl p-5 shadow-xl border border-gray-100 animate-slide-in-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#004aad]" />
              Refine Search
            </h3>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Mode
                </label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filters.eventMode}
                    onChange={(e) => updateFilter('eventMode', e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#004aad] focus:border-transparent outline-none appearance-none"
                  >
                    {eventModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filters.priceRange}
                    onChange={(e) => updateFilter('priceRange', e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#004aad] focus:border-transparent outline-none appearance-none"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>


            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#004aad] focus:border-transparent outline-none appearance-none"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 text-white font-bold bg-[#004aad] rounded-xl hover:bg-[#003882] shadow-lg shadow-blue-900/20 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
