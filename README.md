# 🌤️ Weather Consensus App

A modern weather application that provides real-time weather data, forecasts, and interactive maps using multiple weather APIs. The app aggregates data from various sources to provide consensus weather information.

## 🚀 Features

- **Multi-Source Weather Data**: Integrates with OpenWeather, WeatherAPI, and AccuWeather
- **Consensus Calculation**: Provides averaged weather data from multiple sources
- **Location Detection**: Uses browser geolocation with fallback to New York
- **Zip Code Search**: Search weather by ZIP code
- **Clean UI**: Modern, responsive design with Tailwind CSS
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **5-Day Forecast**: Detailed weather forecasts
- **Source Selection**: Choose between consensus or individual API data

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Express.js with TypeScript microservices
- **APIs**: OpenWeather, WeatherAPI, AccuWeather

## 📁 Project Structure

```
weather-app/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── types/           # TypeScript interfaces
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Weather API services
│   │   ├── types/           # TypeScript interfaces
│   │   └── server.ts        # Main server file
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for weather services

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weather-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Weather API Keys
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHERAPI_KEY=your_weatherapi_key_here
ACCUWEATHER_API_KEY=your_accuweather_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔑 API Keys Setup

### OpenWeather API
1. Go to [OpenWeather](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` as `OPENWEATHER_API_KEY`

### WeatherAPI
1. Go to [WeatherAPI](https://www.weatherapi.com/)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` as `WEATHERAPI_KEY`

### AccuWeather API
1. Go to [AccuWeather](https://developer.accuweather.com/)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` as `ACCUWEATHER_API_KEY`

## 🎯 Usage

1. **Automatic Location**: The app will try to use your browser's location
2. **Manual Location**: Enter a ZIP code to get weather for a specific location
3. **Source Selection**: Use the dropdown to switch between consensus and individual API data
4. **Temperature Units**: Toggle between Celsius and Fahrenheit
5. **Forecast**: View 5-day weather forecasts

## 🔧 API Endpoints

### Backend Routes

- `GET /api/weather/coordinates?lat={lat}&lon={lon}` - Get weather by coordinates
- `GET /api/weather/zipcode?zip={zip}&country={country}` - Get weather by ZIP code
- `GET /api/weather/location?name={name}&country={country}` - Get weather by location name
- `GET /health` - Health check endpoint

## 🎨 UI Components

- **WeatherDisplay**: Main weather display with source selection
- **WeatherCard**: Current weather information card
- **ConsensusCard**: Consensus data display
- **ForecastCard**: 5-day forecast display
- **LocationInput**: ZIP code input and location controls
- **LoadingSpinner**: Loading state component

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenWeather for their weather API
- WeatherAPI for their comprehensive weather data
- AccuWeather for their detailed forecasts
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework 