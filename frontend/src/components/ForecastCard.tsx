'use client';

import { ForecastDay } from '@/types/weather';
import { Calendar } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastDay[];
  useFahrenheit: boolean;
}

export default function ForecastCard({ forecast, useFahrenheit }: ForecastCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">5-Day Forecast</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {forecast.map((day, index) => {
          const maxTemp = useFahrenheit ? day.day.maxtemp_f : day.day.maxtemp_c;
          const minTemp = useFahrenheit ? day.day.mintemp_f : day.day.mintemp_c;
          const windSpeed = useFahrenheit ? day.day.maxwind_mph : day.day.maxwind_kph;

          return (
            <div key={index} className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-gray-800 mb-2">
                {formatDate(day.date)}
              </div>
              
              <div className="mb-3">
                <img 
                  src={day.day.condition.icon} 
                  alt={day.day.condition.text}
                  className="w-12 h-12 mx-auto mb-2"
                />
                <div className="text-xs text-gray-600">{day.day.condition.text}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High</span>
                  <span className="font-medium text-red-600">
                    {maxTemp.toFixed(1)}°{useFahrenheit ? 'F' : 'C'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low</span>
                  <span className="font-medium text-blue-600">
                    {minTemp.toFixed(1)}°{useFahrenheit ? 'F' : 'C'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Wind</span>
                  <span className="font-medium text-gray-800">
                    {Math.round(windSpeed)} {useFahrenheit ? 'mph' : 'km/h'}
                  </span>
                </div>

                {day.day.totalprecip_mm > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rain</span>
                    <span className="font-medium text-blue-600">
                      {Math.round(day.day.totalprecip_mm)}mm
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 