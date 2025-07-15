'use client';

import { useState, useEffect } from 'react';
import WeatherDisplay from '@/components/WeatherDisplay';
import LocationInput from '@/components/LocationInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import { WeatherData, ConsensusWeatherData } from '@/types/weather';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [consensusData, setConsensusData] = useState<ConsensusWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude, name: 'Current Location' });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York
          setLocation({ lat: 40.7128, lon: -74.0060, name: 'New York, NY' });
          fetchWeatherData(40.7128, -74.0060);
        }
      );
    } else {
      // Default to New York if geolocation is not supported
      setLocation({ lat: 40.7128, lon: -74.0060, name: 'New York, NY' });
      fetchWeatherData(40.7128, -74.0060);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/weather/coordinates?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      
      if (data.success) {
        setWeatherData(data.data.individual.filter((w: { success: boolean; data?: WeatherData }) => w.success && w.data).map((w: { success: boolean; data?: WeatherData }) => w.data!));
        setConsensusData(data.data.consensus);
      } else {
        setError('Failed to fetch weather data');
      }
    } catch (err) {
      setError('Failed to connect to weather service');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZipCodeSubmit = async (zipCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/weather/zipcode?zip=${zipCode}`);
      const data = await response.json();
      
      if (data.success) {
        setWeatherData(data.data.individual.filter((w: { success: boolean; data?: WeatherData }) => w.success && w.data).map((w: { success: boolean; data?: WeatherData }) => w.data!));
        setConsensusData(data.data.consensus);
        
        // Update location name from the first successful response
        const firstData = data.data.individual.find((w: { success: boolean; data?: WeatherData }) => w.success && w.data)?.data;
        if (firstData) {
          setLocation({
            lat: firstData.location.lat,
            lon: firstData.location.lon,
            name: `${firstData.location.name}, ${firstData.location.country}`
          });
        }
      } else {
        setError('Failed to fetch weather data for this zip code');
      }
    } catch (err) {
      setError('Failed to connect to weather service');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌤️ Weather Consensus</h1>
          <p className="text-gray-600">Get weather data from multiple sources</p>
        </header>

        <LocationInput 
          currentLocation={location?.name || 'Loading...'}
          onZipCodeSubmit={handleZipCodeSubmit}
          onUseCurrentLocation={getCurrentLocation}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {weatherData.length > 0 && (
          <WeatherDisplay 
            weatherData={weatherData}
            consensusData={consensusData}
          />
        )}
      </div>
    </div>
  );
}
