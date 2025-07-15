import axios from 'axios';
import { WeatherData, WeatherAPIResponse, Location, CurrentWeather, WeatherCondition, ForecastDay, DayForecast, HourForecast } from '../types/weather';

export class OpenWeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    console.log('OpenWeatherService: Constructor called');
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    console.log('OpenWeather API key check:', this.apiKey ? 'FOUND' : 'NOT FOUND');
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found');
    }
  }

  async getWeather(location: Location): Promise<WeatherAPIResponse> {
    console.log('OpenWeatherService: getWeather called with location:', location);
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeather API key not configured');
      }

      console.log('OpenWeatherService: Making API calls...');
      // Get current weather
      const currentResponse = await axios.get(
        `${this.baseUrl}/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric`
      );

      // Get 5-day forecast
      const forecastResponse = await axios.get(
        `${this.baseUrl}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${this.apiKey}&units=metric`
      );

      const currentData = currentResponse.data;
      const forecastData = forecastResponse.data;

      // Add detailed logging for debugging
      console.log('OpenWeather currentData:', JSON.stringify(currentData, null, 2));
      console.log('OpenWeather forecastData:', JSON.stringify(forecastData, null, 2));

      const weatherData: WeatherData = {
        location: {
          name: currentData.name,
          country: currentData.sys.country,
          lat: currentData.coord.lat,
          lon: currentData.coord.lon,
          timezone: currentData.timezone
        },
        current: this.transformCurrentWeather(currentData),
        forecast: this.transformForecast(forecastData),
        source: 'OpenWeather',
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: weatherData,
        source: 'OpenWeather'
      };
    } catch (error) {
      console.error('OpenWeather API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'OpenWeather'
      };
    }
  }

  private transformCurrentWeather(data: any): CurrentWeather {
    return {
      temp_c: data.main.temp,
      temp_f: (data.main.temp * 9/5) + 32,
      condition: {
        text: data.weather[0].main,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        code: data.weather[0].id
      },
      humidity: data.main.humidity,
      wind_kph: data.wind.speed * 3.6, // Convert m/s to km/h
      wind_mph: data.wind.speed * 2.237, // Convert m/s to mph
      wind_degree: data.wind.deg,
      wind_dir: this.getWindDirection(data.wind.deg),
      pressure_mb: data.main.pressure,
      pressure_in: data.main.pressure * 0.02953, // Convert hPa to inHg
      feelslike_c: data.main.feels_like,
      feelslike_f: (data.main.feels_like * 9/5) + 32,
      uv: 0, // OpenWeather doesn't provide UV in free tier
      visibility_km: data.visibility / 1000,
      visibility_miles: (data.visibility / 1000) * 0.621371
    };
  }

  private transformForecast(data: any): ForecastDay[] {
    const dailyData: { [key: string]: any[] } = {};
    
    // Group hourly data by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    return Object.keys(dailyData).map(date => {
      const dayItems = dailyData[date];
      const dayData = dayItems[0]; // Use first item of the day for daily summary
      
      return {
        date,
        day: {
          maxtemp_c: Math.max(...dayItems.map((item: any) => item.main.temp_max)),
          maxtemp_f: Math.max(...dayItems.map((item: any) => (item.main.temp_max * 9/5) + 32)),
          mintemp_c: Math.min(...dayItems.map((item: any) => item.main.temp_min)),
          mintemp_f: Math.min(...dayItems.map((item: any) => (item.main.temp_min * 9/5) + 32)),
          avgtemp_c: dayItems.reduce((sum: number, item: any) => sum + item.main.temp, 0) / dayItems.length,
          avgtemp_f: dayItems.reduce((sum: number, item: any) => sum + ((item.main.temp * 9/5) + 32), 0) / dayItems.length,
          maxwind_kph: Math.max(...dayItems.map((item: any) => item.wind.speed * 3.6)),
          maxwind_mph: Math.max(...dayItems.map((item: any) => item.wind.speed * 2.237)),
          totalprecip_mm: dayItems.reduce((sum: number, item: any) => sum + (item.rain?.['3h'] || 0), 0),
          totalprecip_in: dayItems.reduce((sum: number, item: any) => sum + ((item.rain?.['3h'] || 0) * 0.0393701), 0),
          avgvis_km: 10, // Default visibility
          avgvis_miles: 6.2,
          avghumidity: dayItems.reduce((sum: number, item: any) => sum + item.main.humidity, 0) / dayItems.length,
          condition: {
            text: dayData.weather[0].main,
            icon: `https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`,
            code: dayData.weather[0].id
          },
          uv: 0
        },
        hour: dayItems.map((item: any) => this.transformHourForecast(item))
      };
    });
  }

  private transformHourForecast(data: any): HourForecast {
    return {
      time: new Date(data.dt * 1000).toISOString(),
      temp_c: data.main.temp,
      temp_f: (data.main.temp * 9/5) + 32,
      condition: {
        text: data.weather[0].main,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        code: data.weather[0].id
      },
      wind_kph: data.wind.speed * 3.6,
      wind_mph: data.wind.speed * 2.237,
      wind_degree: data.wind.deg,
      wind_dir: this.getWindDirection(data.wind.deg),
      pressure_mb: data.main.pressure,
      pressure_in: data.main.pressure * 0.02953,
      precip_mm: data.rain?.['3h'] || 0,
      precip_in: (data.rain?.['3h'] || 0) * 0.0393701,
      humidity: data.main.humidity,
      cloud: data.clouds.all,
      feelslike_c: data.main.feels_like,
      feelslike_f: (data.main.feels_like * 9/5) + 32,
      windchill_c: data.main.feels_like,
      windchill_f: (data.main.feels_like * 9/5) + 32,
      heatindex_c: data.main.feels_like,
      heatindex_f: (data.main.feels_like * 9/5) + 32,
      dewpoint_c: 0, // Not provided by OpenWeather
      dewpoint_f: 0,
      will_it_rain: data.pop > 0.5 ? 1 : 0,
      chance_of_rain: Math.round(data.pop * 100),
      will_it_snow: 0,
      chance_of_snow: 0,
      vis_km: 10,
      vis_miles: 6.2,
      gust_kph: 0,
      gust_mph: 0,
      uv: 0
    };
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
} 