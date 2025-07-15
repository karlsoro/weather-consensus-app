import axios from 'axios';
import { WeatherData, WeatherAPIResponse, Location, CurrentWeather, WeatherCondition, ForecastDay, DayForecast, HourForecast } from '../types/weather';

export class WeatherAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor() {
    this.apiKey = process.env.WEATHERAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('WeatherAPI key not found');
    }
  }

  async getWeather(location: Location): Promise<WeatherAPIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('WeatherAPI key not configured');
      }

      console.log(`WeatherAPI: Fetching weather for ${location.lat},${location.lon}`);
      
      const response = await axios.get(
        `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${location.lat},${location.lon}&days=5&aqi=no`
      );

      console.log('WeatherAPI axios response received:', {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data
      });

      const data = response.data;
      
      console.log('WeatherAPI response structure:', {
        hasData: !!data,
        hasLocation: !!data?.location,
        hasCurrent: !!data?.current,
        error: data?.error,
        keys: data ? Object.keys(data) : [],
        dataType: typeof data,
        responseStatus: response.status,
        responseHeaders: Object.keys(response.headers || {})
      });
      
      console.log('WeatherAPI raw data sample:', {
        location: data?.location ? 'present' : 'missing',
        current: data?.current ? 'present' : 'missing',
        forecast: data?.forecast ? 'present' : 'missing'
      });
      
      if (!data) {
        throw new Error('No data received from WeatherAPI');
      }
      
      if (!data.location) {
        throw new Error('No location data in WeatherAPI response');
      }
      
      if (!data.current) {
        throw new Error('No current weather data in WeatherAPI response');
      }

      const weatherData: WeatherData = {
        location: {
          name: data.location.name || location.name,
          region: data.location.region || '',
          country: data.location.country || location.country,
          lat: data.location.lat || location.lat,
          lon: data.location.lon || location.lon,
          timezone: data.location.tz_id || ''
        },
        current: this.transformCurrentWeather(data.current),
        forecast: this.transformForecast(data.forecast),
        source: 'WeatherAPI',
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: weatherData,
        source: 'WeatherAPI'
      };
    } catch (error) {
      console.error('WeatherAPI error:', error);
      console.error('WeatherAPI error details:', {
        message: error instanceof Error ? error.message : 'No message',
        stack: error instanceof Error ? error.stack : 'No stack',
        type: typeof error
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'WeatherAPI'
      };
    }
  }

  private transformCurrentWeather(data: any): CurrentWeather {
    return {
      temp_c: data.temp_c,
      temp_f: data.temp_f,
      condition: {
        text: data.condition.text,
        icon: `https:${data.condition.icon}`,
        code: data.condition.code
      },
      humidity: data.humidity,
      wind_kph: data.wind_kph,
      wind_mph: data.wind_mph,
      wind_degree: data.wind_degree,
      wind_dir: data.wind_dir,
      pressure_mb: data.pressure_mb,
      pressure_in: data.pressure_in,
      feelslike_c: data.feelslike_c,
      feelslike_f: data.feelslike_f,
      uv: data.uv,
      visibility_km: data.vis_km,
      visibility_miles: data.vis_miles
    };
  }

  private transformForecast(data: any): ForecastDay[] {
    return data.forecastday.map((day: any) => ({
      date: day.date,
      day: {
        maxtemp_c: day.day.maxtemp_c,
        maxtemp_f: day.day.maxtemp_f,
        mintemp_c: day.day.mintemp_c,
        mintemp_f: day.day.mintemp_f,
        avgtemp_c: day.day.avgtemp_c,
        avgtemp_f: day.day.avgtemp_f,
        maxwind_kph: day.day.maxwind_kph,
        maxwind_mph: day.day.maxwind_mph,
        totalprecip_mm: day.day.totalprecip_mm,
        totalprecip_in: day.day.totalprecip_in,
        avgvis_km: day.day.avgvis_km,
        avgvis_miles: day.day.avgvis_miles,
        avghumidity: day.day.avghumidity,
        condition: {
          text: day.day.condition.text,
          icon: `https:${day.day.condition.icon}`,
          code: day.day.condition.code
        },
        uv: day.day.uv
      },
      hour: day.hour.map((hour: any) => this.transformHourForecast(hour))
    }));
  }

  private transformHourForecast(data: any): HourForecast {
    return {
      time: data.time,
      temp_c: data.temp_c,
      temp_f: data.temp_f,
      condition: {
        text: data.condition.text,
        icon: `https:${data.condition.icon}`,
        code: data.condition.code
      },
      wind_kph: data.wind_kph,
      wind_mph: data.wind_mph,
      wind_degree: data.wind_degree,
      wind_dir: data.wind_dir,
      pressure_mb: data.pressure_mb,
      pressure_in: data.pressure_in,
      precip_mm: data.precip_mm,
      precip_in: data.precip_in,
      humidity: data.humidity,
      cloud: data.cloud,
      feelslike_c: data.feelslike_c,
      feelslike_f: data.feelslike_f,
      windchill_c: data.windchill_c,
      windchill_f: data.windchill_f,
      heatindex_c: data.heatindex_c,
      heatindex_f: data.heatindex_f,
      dewpoint_c: data.dewpoint_c,
      dewpoint_f: data.dewpoint_f,
      will_it_rain: data.will_it_rain,
      chance_of_rain: data.chance_of_rain,
      will_it_snow: data.will_it_snow,
      chance_of_snow: data.chance_of_snow,
      vis_km: data.vis_km,
      vis_miles: data.vis_miles,
      gust_kph: data.gust_kph,
      gust_mph: data.gust_mph,
      uv: data.uv
    };
  }
} 