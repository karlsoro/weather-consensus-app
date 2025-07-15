'use client';

import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface LocationInputProps {
  currentLocation: string;
  onZipCodeSubmit: (zipCode: string) => void;
  onUseCurrentLocation: () => void;
}

export default function LocationInput({ 
  currentLocation, 
  onZipCodeSubmit, 
  onUseCurrentLocation 
}: LocationInputProps) {
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim()) {
      onZipCodeSubmit(zipCode.trim());
      setZipCode('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-gray-700 font-medium">Current Location:</span>
          <span className="text-gray-900">{currentLocation}</span>
        </div>
        <button
          onClick={onUseCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Use Current Location
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Enter ZIP code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
} 