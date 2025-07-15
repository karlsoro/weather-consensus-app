export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  forecast?: ForecastDay[];
  source: string;
  timestamp: string;
}

export interface Location {
  name: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
  zipCode?: string;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  feelslike_c: number;
  feelslike_f: number;
  uv: number;
  visibility_km: number;
  visibility_miles: number;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface ForecastDay {
  date: string;
  day: DayForecast;
  hour: HourForecast[];
}

export interface DayForecast {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_kph: number;
  maxwind_mph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  avgvis_km: number;
  avgvis_miles: number;
  avghumidity: number;
  condition: WeatherCondition;
  uv: number;
}

export interface HourForecast {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  wind_kph: number;
  wind_mph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  windchill_c: number;
  windchill_f: number;
  heatindex_c: number;
  heatindex_f: number;
  dewpoint_c: number;
  dewpoint_f: number;
  will_it_rain: number;
  chance_of_rain: number;
  will_it_snow: number;
  chance_of_snow: number;
  vis_km: number;
  vis_miles: number;
  gust_kph: number;
  gust_mph: number;
  uv: number;
}

export interface ConsensusWeatherData {
  location: Location;
  current: CurrentWeather;
  forecast?: ForecastDay[];
  sources: string[];
  consensus_temp_c: number;
  consensus_temp_f: number;
  timestamp: string;
} 