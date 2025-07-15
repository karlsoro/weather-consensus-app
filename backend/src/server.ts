import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { weatherRouter } from './routes/weather';

// Load environment variables first
dotenv.config();

// Verify environment variables are loaded
console.log('Environment variables loaded:');
console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'FOUND' : 'NOT FOUND');
console.log('WEATHERAPI_KEY:', process.env.WEATHERAPI_KEY ? 'FOUND' : 'NOT FOUND');
console.log('ACCUWEATHER_API_KEY:', process.env.ACCUWEATHER_API_KEY ? 'FOUND' : 'NOT FOUND');

// Set environment variables explicitly to ensure they're available
if (!process.env.OPENWEATHER_API_KEY) {
  console.error('OPENWEATHER_API_KEY is not set');
}
if (!process.env.WEATHERAPI_KEY) {
  console.error('WEATHERAPI_KEY is not set');
}
if (!process.env.ACCUWEATHER_API_KEY) {
  console.error('ACCUWEATHER_API_KEY is not set');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Weather API server running on port ${PORT}`);
}); 