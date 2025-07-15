import axios from 'axios';
import { WeatherData, WeatherAPIResponse, Location, CurrentWeather, WeatherCondition, ForecastDay, DayForecast, HourForecast } from '../types/weather';

export class AccuWeatherService {
  private apiKey: string;
  private baseUrl = 'https://dataservice.accuweather.com';

  constructor() {
    this.apiKey = process.env.ACCUWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('AccuWeather API key not found');
    }
  }

  async getWeather(location: Location): Promise<WeatherAPIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('AccuWeather API key not configured');
      }

      console.log(`AccuWeather: Fetching weather for ${location.lat},${location.lon}`);

      // First, get location key and location data
      const locationResult = await this.getLocationKey(location.lat, location.lon);
      const locationKey = locationResult.key;
      const accuLocation = locationResult.location;

      // Get current conditions
      const currentResponse = await axios.get(
        `${this.baseUrl}/currentconditions/v1/${locationKey}?apikey=${this.apiKey}&details=true`
      );

      // Get 5-day forecast
      const forecastResponse = await axios.get(
        `${this.baseUrl}/forecasts/v1/daily/5day/${locationKey}?apikey=${this.apiKey}&details=true&metric=true`
      );

      const currentData = currentResponse.data[0];
      const forecastData = forecastResponse.data;

      const weatherData: WeatherData = {
        location: {
          name: accuLocation.EnglishName || location.name,
          country: accuLocation.Country?.EnglishName || location.country,
          lat: accuLocation.GeoPosition?.Latitude || location.lat,
          lon: accuLocation.GeoPosition?.Longitude || location.lon
        },
        current: this.transformCurrentWeather(currentData),
        forecast: this.transformForecast(forecastData),
        source: 'AccuWeather',
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: weatherData,
        source: 'AccuWeather'
      };
    } catch (error) {
      console.error('AccuWeather API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'AccuWeather'
      };
    }
  }

  private async getLocationKey(lat: number, lon: number): Promise<{ key: string; location: any }> {
    try {
      console.log(`AccuWeather: Getting location key for ${lat},${lon}`);
      const response = await axios.get(
        `${this.baseUrl}/locations/v1/cities/geoposition/search?apikey=${this.apiKey}&q=${lat},${lon}`
      );
      
      if (!response.data || !response.data.Key) {
        throw new Error('No location key found in AccuWeather response');
      }
      
      console.log(`AccuWeather: Location key found: ${response.data.Key}`);
      console.log(`AccuWeather: Location data:`, {
        city: response.data.EnglishName,
        country: response.data.Country?.EnglishName,
        lat: response.data.GeoPosition?.Latitude,
        lon: response.data.GeoPosition?.Longitude
      });
      
      return {
        key: response.data.Key,
        location: response.data
      };
    } catch (error: any) {
      console.error('Error getting location key:', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        throw new Error('AccuWeather API key is invalid or expired');
      }
      throw new Error('Unable to get location key from AccuWeather');
    }
  }

  private transformCurrentWeather(data: any): CurrentWeather {
    return {
      temp_c: data.Temperature.Metric.Value,
      temp_f: data.Temperature.Imperial.Value,
      condition: {
        text: data.WeatherText,
        icon: this.getAccuWeatherIcon(data.WeatherIcon),
        code: data.WeatherIcon
      },
      humidity: data.RelativeHumidity,
      wind_kph: data.Wind.Speed.Metric.Value,
      wind_mph: data.Wind.Speed.Imperial.Value,
      wind_degree: data.Wind.Direction.Degrees,
      wind_dir: data.Wind.Direction.English,
      pressure_mb: data.Pressure.Metric.Value,
      pressure_in: data.Pressure.Imperial.Value,
      feelslike_c: data.ApparentTemperature.Metric.Value,
      feelslike_f: data.ApparentTemperature.Imperial.Value,
      uv: data.UVIndex || 0,
      visibility_km: data.Visibility.Metric.Value,
      visibility_miles: data.Visibility.Imperial.Value
    };
  }

  private transformForecast(data: any): ForecastDay[] {
    console.log('AccuWeather forecast data structure:', JSON.stringify(data, null, 2));
    
    if (!data.DailyForecasts || !Array.isArray(data.DailyForecasts)) {
      console.error('AccuWeather: No DailyForecasts found in response');
      return [];
    }

    return data.DailyForecasts.map((day: any, index: number) => {
      console.log(`AccuWeather: Processing day ${index}:`, JSON.stringify(day, null, 2));
      
      try {
        return {
          date: day.Date,
          day: {
            maxtemp_c: day.Temperature?.Maximum?.Value || 0,
            maxtemp_f: ((day.Temperature?.Maximum?.Value || 0) * 9/5) + 32,
            mintemp_c: day.Temperature?.Minimum?.Value || 0,
            mintemp_f: ((day.Temperature?.Minimum?.Value || 0) * 9/5) + 32,
            avgtemp_c: ((day.Temperature?.Maximum?.Value || 0) + (day.Temperature?.Minimum?.Value || 0)) / 2,
            avgtemp_f: (((day.Temperature?.Maximum?.Value || 0) + (day.Temperature?.Minimum?.Value || 0)) / 2 * 9/5) + 32,
            maxwind_kph: day.Day?.Wind?.Speed?.Value || 0,
            maxwind_mph: ((day.Day?.Wind?.Speed?.Value || 0) * 0.621371),
            totalprecip_mm: day.Day?.TotalLiquid?.Value || 0,
            totalprecip_in: ((day.Day?.TotalLiquid?.Value || 0) * 0.0393701),
            avgvis_km: day.Day?.Visibility?.Value || 0,
            avgvis_miles: ((day.Day?.Visibility?.Value || 0) * 0.621371),
            avghumidity: day.Day?.RelativeHumidity?.Average || 0,
            condition: {
              text: day.Day?.IconPhrase || 'Unknown',
              icon: this.getAccuWeatherIcon(day.Day?.Icon || 1),
              code: day.Day?.Icon || 1
            },
            uv: day.AirAndPollen?.find((item: any) => item.Name === 'UVIndex')?.Value || 0
          },
          hour: [] // AccuWeather doesn't provide hourly data in free tier
        };
      } catch (error) {
        console.error(`AccuWeather: Error processing day ${index}:`, error);
        return {
          date: day.Date || new Date().toISOString(),
          day: {
            maxtemp_c: 0,
            maxtemp_f: 32,
            mintemp_c: 0,
            mintemp_f: 32,
            avgtemp_c: 0,
            avgtemp_f: 32,
            maxwind_kph: 0,
            maxwind_mph: 0,
            totalprecip_mm: 0,
            totalprecip_in: 0,
            avgvis_km: 0,
            avgvis_miles: 0,
            avghumidity: 0,
            condition: {
              text: 'Unknown',
              icon: this.getAccuWeatherIcon(1),
              code: 1
            },
            uv: 0
          },
          hour: []
        };
      }
    });
  }

  private getAccuWeatherIcon(iconCode: number): string {
    // Map AccuWeather icon codes to their icon URLs
    const iconMap: { [key: number]: string } = {
      1: 'https://developer.accuweather.com/sites/default/files/01-s.png',
      2: 'https://developer.accuweather.com/sites/default/files/02-s.png',
      3: 'https://developer.accuweather.com/sites/default/files/03-s.png',
      4: 'https://developer.accuweather.com/sites/default/files/04-s.png',
      5: 'https://developer.accuweather.com/sites/default/files/05-s.png',
      6: 'https://developer.accuweather.com/sites/default/files/06-s.png',
      7: 'https://developer.accuweather.com/sites/default/files/07-s.png',
      8: 'https://developer.accuweather.com/sites/default/files/08-s.png',
      11: 'https://developer.accuweather.com/sites/default/files/11-s.png',
      12: 'https://developer.accuweather.com/sites/default/files/12-s.png',
      13: 'https://developer.accuweather.com/sites/default/files/13-s.png',
      14: 'https://developer.accuweather.com/sites/default/files/14-s.png',
      15: 'https://developer.accuweather.com/sites/default/files/15-s.png',
      16: 'https://developer.accuweather.com/sites/default/files/16-s.png',
      17: 'https://developer.accuweather.com/sites/default/files/17-s.png',
      18: 'https://developer.accuweather.com/sites/default/files/18-s.png',
      19: 'https://developer.accuweather.com/sites/default/files/19-s.png',
      20: 'https://developer.accuweather.com/sites/default/files/20-s.png',
      21: 'https://developer.accuweather.com/sites/default/files/21-s.png',
      22: 'https://developer.accuweather.com/sites/default/files/22-s.png',
      23: 'https://developer.accuweather.com/sites/default/files/23-s.png',
      24: 'https://developer.accuweather.com/sites/default/files/24-s.png',
      25: 'https://developer.accuweather.com/sites/default/files/25-s.png',
      26: 'https://developer.accuweather.com/sites/default/files/26-s.png',
      29: 'https://developer.accuweather.com/sites/default/files/29-s.png',
      30: 'https://developer.accuweather.com/sites/default/files/30-s.png',
      31: 'https://developer.accuweather.com/sites/default/files/31-s.png',
      32: 'https://developer.accuweather.com/sites/default/files/32-s.png',
      33: 'https://developer.accuweather.com/sites/default/files/33-s.png',
      34: 'https://developer.accuweather.com/sites/default/files/34-s.png',
      35: 'https://developer.accuweather.com/sites/default/files/35-s.png',
      36: 'https://developer.accuweather.com/sites/default/files/36-s.png',
      37: 'https://developer.accuweather.com/sites/default/files/37-s.png',
      38: 'https://developer.accuweather.com/sites/default/files/38-s.png',
      39: 'https://developer.accuweather.com/sites/default/files/39-s.png',
      40: 'https://developer.accuweather.com/sites/default/files/40-s.png',
      41: 'https://developer.accuweather.com/sites/default/files/41-s.png',
      42: 'https://developer.accuweather.com/sites/default/files/42-s.png',
      43: 'https://developer.accuweather.com/sites/default/files/43-s.png',
      44: 'https://developer.accuweather.com/sites/default/files/44-s.png'
    };

    return iconMap[iconCode] || iconMap[1]; // Default to sunny if icon not found
  }
} 