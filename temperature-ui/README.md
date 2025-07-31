# Temperature UI - React.js Frontend

A React.js frontend application for checking real-time temperature data.

## Features

- 🌡️ Real-time temperature checking
- 🔍 Search by country or city name
- ⌨️ Press Enter to search
- 📱 Responsive design
- 🎨 Modern UI with gradient backgrounds
- ⚡ Fast API integration with Spring Boot backend

## Quick Start

Since npm dependencies have installation issues, you can run this React app using any web server:

### Option 1: Using Python (if available)
```bash
cd temperature-ui
python3 -m http.server 3000
```

### Option 2: Using Node.js http-server
```bash
npm install -g http-server
cd temperature-ui
http-server -p 3000
```

### Option 3: Using any web server
Serve the files from the temperature-ui directory on port 3000.

## Files Structure

```
temperature-ui/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── App.js             # Main React component
│   ├── App.css            # Styles for the app
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json           # NPM dependencies
└── README.md             # This file
```

## API Integration

The app connects to the Spring Boot backend running on `http://localhost:8080/api/v1/temperature/{location}`

Make sure your Spring Boot application is running before testing the UI.

## Usage

1. Enter a country or city name in the input field
2. Press Enter or click the search button
3. View the real-time temperature data
4. The UI shows temperature, location, and last updated timestamp

## Features

- **Real-time Data**: Fetches live temperature from OpenWeatherMap API
- **Error Handling**: Shows user-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Gradient backgrounds and smooth animations