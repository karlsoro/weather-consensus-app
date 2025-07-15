'use client';

import { ConsensusWeatherData } from '@/types/weather';
import { TrendingUp, Users } from 'lucide-react';

interface ConsensusCardProps {
  consensus: ConsensusWeatherData;
  useFahrenheit: boolean;
}

export default function ConsensusCard({ consensus, useFahrenheit }: ConsensusCardProps) {
  const temp = useFahrenheit ? consensus.consensus_temp_f : consensus.consensus_temp_c;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Consensus Data</h3>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {temp.toFixed(1)}°{useFahrenheit ? 'F' : 'C'}
          </div>
          <div className="text-sm text-gray-700">Average from {consensus.sources.length} sources</div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Data Sources:</h4>
          <div className="space-y-1">
            {consensus.sources.map((source, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{source}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>Consensus calculated from multiple weather APIs</span>
        </div>
      </div>
    </div>
  );
} 