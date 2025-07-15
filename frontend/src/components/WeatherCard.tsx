'use client';

import { WeatherData, ConsensusWeatherData } from '@/types/weather';
import { 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sun,
  CloudRain,
  CloudSnow
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData | ConsensusWeatherData;
  useFahrenheit: boolean;
  isConsensus: boolean;
}

export default function WeatherCard({ weather, useFahrenheit, isConsensus }: WeatherCardProps) {
  const temp = useFahrenheit ? weather.current.temp_f : weather.current.temp_c;
  const feelsLike = useFahrenheit ? weather.current.feelslike_f : weather.current.feelslike_c;
  const windSpeed = useFahrenheit ? weather.current.wind_mph : weather.current.wind_kph;
  const visibility = useFahrenheit ? weather.current.visibility_miles : weather.current.visibility_km;
  const pressure = useFahrenheit ? weather.current.pressure_in : weather.current.pressure_mb;

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className="w-6 h-6 text-blue-500" />;
    } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
      return <CloudSnow className="w-6 h-6 text-blue-300" />;
    } else {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-blue-50 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {weather.location.name}
            {weather.location.region && `, ${weather.location.region}`}
          </h2>
          <p className="text-gray-600">{weather.location.country}</p>
        </div>
        {isConsensus && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Consensus
          </div>
        )}
      </div>

      {/* Main Weather Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature and Condition */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {getWeatherIcon(weather.current.condition.text)}
            <div>
              <div className="text-5xl font-bold text-gray-800">
                {temp.toFixed(1)}°{useFahrenheit ? 'F' : 'C'}
              </div>
              <div className="text-lg text-gray-600">
                {weather.current.condition.text}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Feels like {feelsLike.toFixed(1)}°{useFahrenheit ? 'F' : 'C'}
          </div>
        </div>

        {/* Weather Details */}
        <div className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">Humidity</span>
            </div>
            <span className="font-medium text-gray-900">{weather.current.humidity}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Wind</span>
            </div>
            <span className="font-medium text-gray-900">
              {Math.round(windSpeed)} {useFahrenheit ? 'mph' : 'km/h'} {weather.current.wind_dir}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Visibility</span>
            </div>
            <span className="font-medium text-gray-900">
              {Math.round(visibility)} {useFahrenheit ? 'mi' : 'km'}
            </span>
          </div>

          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Pressure</span>
            </div>
            <span className="font-medium text-gray-900">
              {pressure.toFixed(1)} {useFahrenheit ? 'inHg' : 'mb'}
            </span>
          </div>

          {weather.current.uv > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-700">UV Index</span>
              </div>
              <span className="font-medium text-gray-900">{weather.current.uv}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(weather.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
} 