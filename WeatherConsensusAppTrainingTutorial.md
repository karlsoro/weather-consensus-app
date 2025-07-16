# Weather Consensus App Training Tutorial

This tutorial leverages the `karlsoro/weather-consensus-app` GitHub repository to provide hands-on training for developers with different skill levels. The app fetches weather data from multiple APIs, displays a consensus, and is built with Node.js, Express, and MongoDB. The tutorial includes challenges for three personas—Entry-Level Developer, UI Developer, and Senior Engineer—along with a separate answer key for each.

## Prerequisites

- **Git**: Installed to clone the repository.
- **Node.js and npm**: For running the application.
- **MongoDB**: Local or cloud instance for data storage.
- **Text Editor**: VS Code or similar for editing code.
- **API Keys**: Accounts with OpenWeatherMap, AccuWeather, and Weatherbit (or similar weather APIs).
- **Basic Knowledge**: Familiarity with JavaScript, HTML/CSS, and APIs.

## Setup Instructions (Common to All Personas)

1. **Clone the Repository**:
   
   ```bash
   git clone https://github.com/karlsoro/weather-consensus-app.git
   cd weather-consensus-app
   ```

2. **Install Dependencies**:
   
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   
   - Copy `.env.sample` to `.env`:
     
     ```bash
     cp .env.sample .env
     ```
   
   - Add your API keys to `.env` (e.g., `OPENWEATHERMAP_API_KEY`, `ACCUWEATHER_API_KEY`, `WEATHERBIT_API_KEY`).

4. **Start MongoDB**:
   
   - Ensure MongoDB is running locally (`mongod`) or configure a cloud MongoDB URI in `.env`.

5. **Run the Application**:
   
   ```bash
   npm start
   ```
   
   - Access the app at `http://localhost:3000`.

---

## Persona 1: Entry-Level Developer

### Challenge

Your task is to set up and debug the weather consensus app, then extend it to create a new page that displays sports scores using an open-source sports API.

1. **Clone and Run the App**:
   - Clone the repository, install dependencies, and add your API keys to `.env` as described above.
   - Run the app and verify it works by visiting `http://localhost:3000`.
2. **Debug API Issue**:
   - Notice that the app only returns data from two APIs instead of three (OpenWeatherMap, AccuWeather, Weatherbit).
   - Debug why the third API’s data is missing and fix the code to ensure all three APIs return values.
3. **Create a Sports Scores Page**:
   - Using the weather app as an example, create a new page (`/sports`) that fetches data from an open-source sports API (e.g., SportsMonks or ESPN API if available).
   - Display the data as cards, each showing a team’s name, score, and match details (e.g., opponent, date).
   - Ensure the page is accessible at `http://localhost:3000/sports`.

### Answer Key

#### Step 1: Clone and Run

- Follow the setup instructions above. If the app doesn’t run, check for:
  - Missing `.env` file or incorrect API keys.
  - MongoDB not running or incorrect URI in `.env`.
  - Missing dependencies (`npm install`).

#### Step 2: Debug API Issue

- **Problem**: The app only returns data from two APIs (e.g., OpenWeatherMap and AccuWeather).

- **Debugging**:
  
  - Check `routes/weather.js` or similar for API calls. Look for errors in the third API’s request (e.g., Weatherbit).
  
  - Common issues:
    
    - Incorrect API key in `.env`.
    - API endpoint misconfigured (e.g., wrong URL or parameters).
    - Rate limit exceeded (log the response to check status codes).
  
  - Example fix in `routes/weather.js`:
    
    ```javascript
    const axios = require('axios');
    async function getWeatherData(location) {
      const openWeather = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
      const accuWeather = axios.get(`https://dataservice.accuweather.com/currentconditions/v1/${location}?apikey=${process.env.ACCUWEATHER_API_KEY}`);
      const weatherBit = axios.get(`https://api.weatherbit.io/v2.0/current?city=${location}&key=${process.env.WEATHERBIT_API_KEY}`);
      const [openRes, accuRes, wbRes] = await Promise.all([openWeather, accuWeather, weatherBit]).catch(err => {
        console.error('API Error:', err.message);
        throw err;
      });
      return {
        openWeather: openRes.data,
        accuWeather: accuRes.data,
        weatherBit: wbRes.data
      };
    }
    ```
  
  - **Fix**: Ensure all API keys are valid, endpoints are correct, and handle errors gracefully (e.g., retry or skip failed APIs).

#### Step 3: Sports Scores Page

- **Choose an API**: Use SportsMonks (free tier available) or another open-source sports API.

- **Create Route**:
  
  - In `routes/index.js`, add:
    
    ```javascript
    const express = require('express');
    const router = express.Router();
    const axios = require('axios');
    
    router.get('/sports', async (req, res) => {
      try {
        const response = await axios.get('https://api.sportsmonks.com/v3/football/fixtures?api_token=YOUR_SPORTS_API_KEY');
        const matches = response.data.data;
        res.render('sports', { matches });
      } catch (err) {
        res.status(500).send('Error fetching sports data');
      }
    });
    
    module.exports = router;
    ```

- **Create View** (`views/sports.ejs`):
  
  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <title>Sports Scores</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <h1>Sports Scores</h1>
    <div class="card-container">
      <% matches.forEach(match => { %>
        <div class="card">
          <h2><%= match.name %></h2>
          <p>Teams: <%= match.teams[0].name %> vs <%= match.teams[1].name %></p>
          <p>Score: <%= match.scores ? match.scores : 'N/A' %></p>
          <p>Date: <%= new Date(match.starting_at).toLocaleDateString() %></p>
        </div>
      <% }) %>
    </div>
  </body>
  </html>
  ```

- **Style** (`public/styles.css`):
  
  ```css
  .card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .card {
    border: 1px solid #ccc;
    padding: 20px;
    width: 200px;
    text-align: center;
  }
  ```

- **Test**: Visit `http://localhost:3000/sports` to verify the page displays match cards.

---

## Persona 2: UI Developer

### Challenge

Your task is to improve the visual design of the weather consensus app and collaborate with an Entry-Level Developer to create a sports scores UI.

1. **Update Colors for Weather Icons**:
   - Modify the app’s CSS to enhance the visibility of weather icons (e.g., sun, cloud, rain).
   - Ensure icons contrast well with the background for readability.
2. **Fix Pressure Icon**:
   - In the detail/consensus section, the icon before the word "pressure" is partially hidden or misaligned. Fix it to display fully.
3. **Design Sports Scores UI**:
   - Partner with an Entry-Level Developer who created the `/sports` route.
   - Design a responsive, visually appealing UI for the sports scores page, ensuring it matches the weather app’s aesthetic.

### Answer Key

#### Step 1: Update Colors for Weather Icons

- **Problem**: Weather icons lack contrast, making them hard to see.

- **Solution**:
  
  - Edit `public/styles.css`:
    
    ```css
    .weather-icon {
      background-color: #f0f8ff; /* Light blue background for contrast */
      padding: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .weather-card {
      background-color: #ffffff;
      border: 1px solid #ddd;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    ```
  
  - Ensure icons (e.g., from OpenWeatherMap’s icon set) are loaded correctly:
    
    ```html
    <img src="https://openweathermap.org/img/wn/<%= weatherData.icon %>@2x.png" class="weather-icon" alt="Weather Icon">
    ```

#### Step 2: Fix Pressure Icon

- **Problem**: The pressure icon is clipped or misaligned.

- **Solution**:
  
  - In `views/index.ejs` (or similar), locate the pressure section:
    
    ```html
    <div class="weather-detail">
      <img src="/images/pressure-icon.png" class="detail-icon" alt="Pressure Icon">
      <span>Pressure: <%= weatherData.pressure %> hPa</span>
    </div>
    ```
  
  - Update CSS in `public/styles.css`:
    
    ```css
    .detail-icon {
      width: 24px;
      height: 24px;
      margin-right: 10px;
      vertical-align: middle;
    }
    .weather-detail {
      display: flex;
      align-items: center;
    }
    ```
  
  - Ensure the icon file (`pressure-icon.png`) exists in `public/images/` or use a web font icon (e.g., Font Awesome).

#### Step 3: Design Sports Scores UI

- **Collaboration**: Work with the Entry-Level Developer’s `/sports` route and `views/sports.ejs`.

- **Enhance UI**:
  
  - Update `views/sports.ejs` for a modern look:
    
    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sports Scores</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <header>
        <h1>Sports Scores</h1>
      </header>
      <main class="card-container">
        <% matches.forEach(match => { %>
          <div class="sports-card">
            <h2><%= match.name %></h2>
            <div class="match-details">
              <p><strong>Teams:</strong> <%= match.teams[0].name %> vs <%= match.teams[1].name %></p>
              <p><strong>Score:</strong> <%= match.scores ? match.scores : 'N/A' %></p>
              <p><strong>Date:</strong> <%= new Date(match.starting_at).toLocaleDateString() %></p>
            </div>
          </div>
        <% }) %>
      </main>
    </body>
    </html>
    ```
  
  - Update `public/styles.css`:
    
    ```css
    header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .card-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .sports-card {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }
    .sports-card:hover {
      transform: translateY(-5px);
    }
    .match-details p {
      margin: 5px 0;
    }
    ```

---

## Persona 3: Senior Engineer

### Challenge

Your task is to optimize the weather consensus app’s performance and implement a caching strategy to manage API costs.

1. **Code Review and Optimization**:
   - Review the app’s code for performance bottlenecks (e.g., redundant API calls, inefficient database queries).
   - Optimize at least three aspects (e.g., API request handling, database queries, or response times).
2. **API Cost Management with Caching**:
   - Research the costs of the APIs used (OpenWeatherMap, AccuWeather, Weatherbit).
   - Implement a caching strategy using MongoDB to ensure the most expensive API (e.g., AccuWeather) is called only once per half hour per location.
   - If a call is made within 30 minutes, use cached data. Update the master source with a timestamp for validation.

### Answer Key

#### Step 1: Code Review and Optimization

- **Review**:
  
  - Check `routes/weather.js` for redundant API calls (e.g., no caching).
  - Inspect MongoDB queries in `models/Weather.js` for missing indexes.
  - Evaluate response times using browser DevTools or logging.

- **Optimizations**:
  
  1. **Consolidate API Calls**:
     
     - Use `Promise.all` for parallel API requests (already implemented in the Entry-Level fix).
     
     - Add retry logic for failed APIs:
       
       ```javascript
       const axiosRetry = require('axios-retry');
       axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
       ```
  
  2. **Database Indexing**:
     
     - In MongoDB, add an index on the `location` field:
       
       ```javascript
       // models/Weather.js
       const mongoose = require('mongoose');
       const weatherSchema = new mongoose.Schema({
        location: String,
        data: Object,
        timestamp: Date
       });
       weatherSchema.index({ location: 1 });
       module.exports = mongoose.model('Weather', weatherSchema);
       ```
  
  3. **Response Compression**:
     
     - Add compression middleware in `app.js`:
       
       ```javascript
       const compression = require('compression');
       app.use(compression());
       ```

#### Step 2: API Cost Management with Caching

- **API Costs**:
  
  - **OpenWeatherMap**: Free tier (60 calls/min, 1M calls/month); paid plans ~$0.0015/call (One Call API).[](https://openweathermap.org/api)
  - **AccuWeather**: High-volume API; costs ~$0.01/call for enterprise plans (estimated based on high request volume).[](https://cloud.google.com/customers/accuweather)
  - **Weatherbit**: Free tier (500 calls/day); paid ~$0.002/call.
  - **Most Expensive**: AccuWeather due to high per-call cost for frequent updates.

- **Caching Strategy**:
  
  - Store API responses in MongoDB with a timestamp.
  
  - Check cache before calling AccuWeather; use cached data if within 30 minutes.
  
  - Update `routes/weather.js`:
    
    ```javascript
    const mongoose = require('mongoose');
    const Weather = require('../models/Weather');
    
    async function getWeatherData(location) {
      // Check cache
      const cache = await Weather.findOne({
        location,
        timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes
      });
    
      if (cache) {
        return cache.data;
      }
    
      // Fetch new data
      const openWeather = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
      const accuWeather = axios.get(`https://dataservice.accuweather.com/currentconditions/v1/${location}?apikey=${process.env.ACCUWEATHER_API_KEY}`);
      const weatherBit = axios.get(`https://api.weatherbit.io/v2.0/current?city=${location}&key=${process.env.WEATHERBIT_API_KEY}`);
      const [openRes, accuRes, wbRes] = await Promise.all([openWeather, accuWeather, weatherBit]);
    
      const weatherData = {
        openWeather: openRes.data,
        accuWeather: accuRes.data,
        weatherBit: wbRes.data
      };
    
      // Save to cache
      await Weather.create({
        location,
        data: weatherData,
        timestamp: new Date()
      });
    
      return weatherData;
    }
    ```

- **Validation**:
  
  - The `timestamp` ensures data is fresh (within 30 minutes).
  - MongoDB’s single shared database ensures consistency across scaled backend instances.

---

## Resources

- **Repository**: [karlsoro/weather-consensus-app](https://github.com/karlsoro/weather-consensus-app)
- **APIs**:
  - OpenWeatherMap: [openweathermap.org](https://openweathermap.org/)[](https://openweathermap.org/api)
  - AccuWeather: [developer.accuweather.com](https://developer.accuweather.com/)[](https://cloud.google.com/customers/accuweather)
  - Weatherbit: [weatherbit.io](https://www.weatherbit.io/)
  - SportsMonks: [sportsmonks.com](https://www.sportsmonks.com/)
- **Tools**: Node.js, MongoDB, Express, Axios, EJS
