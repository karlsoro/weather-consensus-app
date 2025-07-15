import axios from 'axios';
import { WeatherData, WeatherAPIResponse, ConsensusWeatherData, Location } from '../types/weather';
import { OpenWeatherService } from './openWeatherService';
import { WeatherAPIService } from './weatherAPIService';
import { AccuWeatherService } from './accuWeatherService';

export class WeatherService {
  private openWeatherService: OpenWeatherService | null = null;
  private weatherAPIService: WeatherAPIService | null = null;
  private accuWeatherService: AccuWeatherService | null = null;

  constructor() {
    // Ensure dotenv is loaded
    require('dotenv').config();
  }

  private getOpenWeatherService(): OpenWeatherService {
    console.log('WeatherService: getOpenWeatherService called');
    if (!this.openWeatherService) {
      console.log('WeatherService: Creating new OpenWeatherService instance');
      try {
        this.openWeatherService = new OpenWeatherService();
        console.log('WeatherService: OpenWeatherService created successfully');
      } catch (error) {
        console.error('WeatherService: Error creating OpenWeatherService:', error);
        throw error;
      }
    }
    return this.openWeatherService;
  }

  private getWeatherAPIService(): WeatherAPIService {
    console.log('WeatherService: getWeatherAPIService called');
    if (!this.weatherAPIService) {
      console.log('WeatherService: Creating new WeatherAPIService instance');
      this.weatherAPIService = new WeatherAPIService();
    }
    return this.weatherAPIService;
  }

  private getAccuWeatherService(): AccuWeatherService {
    console.log('WeatherService: getAccuWeatherService called');
    if (!this.accuWeatherService) {
      console.log('WeatherService: Creating new AccuWeatherService instance');
      this.accuWeatherService = new AccuWeatherService();
    }
    return this.accuWeatherService;
  }

  async getWeatherByLocation(location: Location): Promise<WeatherAPIResponse[]> {
    console.log('WeatherService: Starting weather fetch for all services');
    
    console.log('WeatherService: About to create OpenWeather promise');
    let openWeatherPromise;
    try {
      const openWeatherService = this.getOpenWeatherService();
      console.log('WeatherService: OpenWeather service obtained successfully');
      openWeatherPromise = openWeatherService.getWeather(location);
      console.log('WeatherService: OpenWeather promise created');
    } catch (error) {
      console.error('WeatherService: Error creating OpenWeather promise:', error);
      openWeatherPromise = Promise.reject(error);
    }
    
    console.log('WeatherService: About to create WeatherAPI promise');
    const weatherAPIPromise = this.getWeatherAPIService().getWeather(location);
    console.log('WeatherService: WeatherAPI promise created');
    
    // console.log('WeatherService: About to create AccuWeather promise');
    // const accuWeatherPromise = this.getAccuWeatherService().getWeather(location);
    // console.log('WeatherService: AccuWeather promise created');
    
    const promises = [openWeatherPromise, weatherAPIPromise];

    console.log('WeatherService: All promises created, waiting for results...');

    try {
      const results = await Promise.allSettled(promises);
      console.log('WeatherService: All promises completed, processing results...');
      
      const responses: WeatherAPIResponse[] = [];

      results.forEach((result, index) => {
        const sources = ['OpenWeather', 'WeatherAPI'];
        console.log(`WeatherService: Processing ${sources[index]} result:`, result.status);
        
        if (result.status === 'fulfilled' && result.value.success) {
          console.log(`WeatherService: ${sources[index]} succeeded`);
          responses.push(result.value);
        } else {
          console.log(`WeatherService: ${sources[index]} failed:`, result.status === 'rejected' ? result.reason : 'Unknown error');
          responses.push({
            success: false,
            error: result.status === 'rejected' ? result.reason : 'Unknown error',
            source: sources[index]
          });
        }
      });

      return responses;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getWeatherByZipCode(zipCode: string, country: string = 'US'): Promise<WeatherAPIResponse[]> {
    // First, get location data from zip code
    const location = await this.getLocationFromZipCode(zipCode, country);
    return this.getWeatherByLocation(location);
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherAPIResponse[]> {
    const location: Location = {
      name: 'Unknown',
      country: 'Unknown',
      lat,
      lon
    };
    return this.getWeatherByLocation(location);
  }

  private async getLocationFromZipCode(zipCode: string, country: string): Promise<Location> {
    try {
      // Use OpenWeather's geocoding API to get location data from zip code
      const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${country}&appid=${process.env.OPENWEATHER_API_KEY}`
      );

      return {
        name: response.data.name,
        country: response.data.country,
        lat: response.data.lat,
        lon: response.data.lon,
        zipCode
      };
    } catch (error) {
      console.error('Error getting location from zip code:', error);
      throw new Error('Unable to get location from zip code');
    }
  }

  calculateConsensus(weatherData: WeatherAPIResponse[]): ConsensusWeatherData | null {
    const successfulData = weatherData.filter(w => w.success && w.data);
    
    if (successfulData.length === 0) {
      return null;
    }

    const firstData = successfulData[0].data!;
    const sources = successfulData.map(w => w.source);
    
    // Calculate consensus temperature (average of all sources)
    const temps_c = successfulData.map(w => w.data!.current.temp_c);
    const temps_f = successfulData.map(w => w.data!.current.temp_f);
    
    const consensus_temp_c = temps_c.reduce((a, b) => a + b, 0) / temps_c.length;
    const consensus_temp_f = temps_f.reduce((a, b) => a + b, 0) / temps_f.length;

    // Use the first successful data as base, but update temperature with consensus
    const consensusData: ConsensusWeatherData = {
      location: firstData.location,
      current: {
        ...firstData.current,
        temp_c: Math.round(consensus_temp_c * 10) / 10,
        temp_f: Math.round(consensus_temp_f * 10) / 10
      },
      forecast: firstData.forecast,
      sources,
      consensus_temp_c: Math.round(consensus_temp_c * 10) / 10,
      consensus_temp_f: Math.round(consensus_temp_f * 10) / 10,
      timestamp: new Date().toISOString()
    };

    return consensusData;
  }
} 