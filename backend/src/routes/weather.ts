import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';

const router = Router();
const weatherService = new WeatherService();

// Get weather by coordinates
router.get('/coordinates', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const latNum = parseFloat(lat as string);
    const lonNum = parseFloat(lon as string);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ 
        error: 'Invalid latitude or longitude' 
      });
    }

    const weatherData = await weatherService.getWeatherByCoordinates(latNum, lonNum);
    const consensus = weatherService.calculateConsensus(weatherData);

    res.json({
      success: true,
      data: {
        individual: weatherData,
        consensus
      }
    });
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data' 
    });
  }
});

// Get weather by zip code
router.get('/zipcode', async (req: Request, res: Response) => {
  try {
    const { zip, country = 'US' } = req.query;
    
    if (!zip) {
      return res.status(400).json({ 
        error: 'Zip code is required' 
      });
    }

    const weatherData = await weatherService.getWeatherByZipCode(zip as string, country as string);
    const consensus = weatherService.calculateConsensus(weatherData);

    res.json({
      success: true,
      data: {
        individual: weatherData,
        consensus
      }
    });
  } catch (error) {
    console.error('Error fetching weather by zip code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data' 
    });
  }
});

// Get weather by location name
router.get('/location', async (req: Request, res: Response) => {
  try {
    const { name, country = 'US' } = req.query;
    
    if (!name) {
      return res.status(400).json({ 
        error: 'Location name is required' 
      });
    }

    // For now, we'll use a default location for New York
    // In a real implementation, you'd want to geocode the location name
    const defaultLocation = {
      name: name as string,
      country: country as string,
      lat: 40.7128,
      lon: -74.0060
    };

    const weatherData = await weatherService.getWeatherByLocation(defaultLocation);
    const consensus = weatherService.calculateConsensus(weatherData);

    res.json({
      success: true,
      data: {
        individual: weatherData,
        consensus
      }
    });
  } catch (error) {
    console.error('Error fetching weather by location:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data' 
    });
  }
});

export { router as weatherRouter }; 