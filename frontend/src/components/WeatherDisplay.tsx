'use client';

import { useState } from 'react';
import { WeatherData, ConsensusWeatherData } from '@/types/weather';
import WeatherCard from './WeatherCard';
import ForecastCard from './ForecastCard';

interface WeatherDisplayProps {
  weatherData: WeatherData[];
  consensusData: ConsensusWeatherData | null;
}

export default function WeatherDisplay({ 
  weatherData, 
  consensusData
}: WeatherDisplayProps) {
  const [selectedSource, setSelectedSource] = useState<string>('consensus');
  const [useFahrenheit, setUseFahrenheit] = useState(true);

  const availableSources = [
    { value: 'consensus', label: 'Consensus' },
    ...weatherData.map(data => ({ 
      value: data.source, 
      label: data.source 
    }))
  ];

  const selectedData = selectedSource === 'consensus' 
    ? consensusData 
    : weatherData.find(data => data.source === selectedSource);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-blue-50 rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Data Source:</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {availableSources.map(source => (
                <option key={source.value} value={source.value} className="text-gray-900">
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Temperature:</span>
            <button
              onClick={() => setUseFahrenheit(false)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                !useFahrenheit 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUseFahrenheit(true)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                useFahrenheit 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Main Weather Display */}
      {selectedData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather */}
          <div className="lg:col-span-2">
            <WeatherCard 
              weather={selectedData} 
              useFahrenheit={useFahrenheit}
              isConsensus={selectedSource === 'consensus'}
            />
          </div>

          {/* Individual Sources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">All Sources</h3>
            {weatherData.map((data) => (
              <div key={data.source} className="bg-blue-50 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{data.source}</h4>
                  <span className="text-sm text-gray-900 font-medium">
                    {useFahrenheit ? `${data.current.temp_f.toFixed(1)}°F` : `${data.current.temp_c.toFixed(1)}°C`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={data.current.condition.icon} 
                    alt={data.current.condition.text}
                    className="w-8 h-8"
                  />
                  <span className="text-sm text-gray-700">{data.current.condition.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {selectedData?.forecast && selectedData.forecast.length > 0 && (
        <ForecastCard 
          forecast={selectedData.forecast} 
          useFahrenheit={useFahrenheit}
        />
      )}
    </div>
  );
} 