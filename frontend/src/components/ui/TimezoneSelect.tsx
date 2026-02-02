'use client';

import React, { useMemo } from 'react';

interface TimezoneSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function TimezoneSelect({ value, onChange, className, ...props }: TimezoneSelectProps) {
  const timezones = useMemo(() => {
    // Get all supported timezones
    // Fallback list if Intl is not supported (rare in modern browsers)
    let tzList: string[] = [];
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      // @ts-ignore - supportedValuesOf might not be in TS definition yet
      tzList = Intl.supportedValuesOf('timeZone');
    } else {
        // Basic fallback list
        tzList = [
            'UTC', 'Asia/Dhaka', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 
            'Europe/London', 'Europe/Paris', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Darwin',
            'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo'
        ];
    }

    return tzList.map(tz => {
      try {
        const now = new Date();
        // Get offset string like "GMT+6"
        const part = new Intl.DateTimeFormat('en-US', { 
            timeZone: tz, 
            timeZoneName: 'shortOffset' 
        }).formatToParts(now).find(p => p.type === 'timeZoneName');
        
        const offset = part ? part.value : '';
        return { 
          value: tz, 
          label: `(${offset}) ${tz.replace(/_/g, ' ')}`,
          offset: offset // For sorting could be useful
        };
      } catch (e) {
        return { value: tz, label: tz.replace(/_/g, ' ') };
      }
    });
  }, []);

  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${className}`}
      {...props}
    >
      <option value="" disabled>Select Timezone</option>
      {timezones.map((tz) => (
        <option key={tz.value} value={tz.value}>
          {tz.label}
        </option>
      ))}
    </select>
  );
}
