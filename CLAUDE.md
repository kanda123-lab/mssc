# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Maven Commands
- **Build project**: `./mvnw clean compile` or `./mvnw clean compile -q` (quiet)
- **Run tests**: `./mvnw test`
- **Run application**: `./mvnw spring-boot:run`
- **Clean build**: `./mvnw clean install`
- **Skip tests**: `./mvnw clean install -DskipTests`

### Frontend (React UI)
The `temperature-ui/` directory contains a React.js frontend:
- **Start UI server**: `cd temperature-ui && python3 -m http.server 3000`
- **Alternative**: Use any web server to serve files from `temperature-ui/` directory
- **React development**: Standard npm commands in `package.json` (though npm install has known issues)

### Application Startup
- **Main class**: `kanda.springframework.msscbrewery.MsscBreweryApplication`
- **Default port**: 8080
- **API base path**: `/api/v1/`

## Project Architecture

### Core Framework
- **Spring Boot 3.2.0** with Java 21
- **Maven** build system with wrapper (`./mvnw`)
- **Spring Web MVC** for REST API
- **WebFlux/WebClient** for external API calls
- **Lombok** for reducing boilerplate code
- **DevTools** for development hot reloading

### Main Modules

#### 1. Beer Management (Original Core)
- **Controllers**: `BeerController`, `CustomerController` with v2 API versions
- **Services**: `BeerService`, `CustomerService` with interface/implementation pattern
- **Models**: `BeerDto`, `CustomerDto`, `BeerDtoV2` with enum `BeerStyleEnum`
- **API Paths**: `/api/v1/beer`, `/api/v1/customer`

#### 2. Weather/Temperature Service
- **Controller**: `TemperatureController` at `/api/v1/temperature/{location}`
- **Service**: `TemperatureServiceImpl` integrating with OpenWeatherMap API
- **Supporting Services**: `AirQualityService`, `CountryValidationService`
- **Models**: `TemperatureDto`, `WeatherApiResponse`
- **Features**: Real-time temperature, AQI data, time-of-day categorization
- **Fallback**: Simulated data when API unavailable

#### 3. Image Metadata Processing
- **Controller**: `ImageUploadController` at `/api/v1/images`
- **Service**: `ImageMetadataService` using metadata-extractor library
- **Features**: Upload, extract EXIF/metadata, generate XMP and text files
- **Storage**: Local directories (`uploads/`, `xmp/`, `text/`)

#### 4. Frontend Integration
- **CORS Configuration**: `CorsConfig` allowing file:// and localhost origins
- **React UI**: Temperature checker with real-time weather data
- **Static Files**: HTML interfaces for temperature checking

### Key Configuration Files
- **Application properties**: `src/main/resources/application.properties`
  - Weather API key configuration (`weather.api.key=demo`)
  - File upload limits (100MB)
  - Server configurations
- **Maven**: `pom.xml` with Spring Boot parent, Java 21, key dependencies

### Service Layer Pattern
All business logic follows interface/implementation pattern:
- Service interfaces in `web/services/`
- Implementations with `@Service` annotation
- Constructor dependency injection
- WebClient for external API integration

### External API Integration
- **OpenWeatherMap**: Real weather data with fallback to simulated data
- **WebClient**: Reactive HTTP client for API calls
- **Error handling**: Graceful degradation with simulated responses

### Testing
- **Framework**: Spring Boot Test with JUnit
- **Test location**: `src/test/java/`
- **Current coverage**: Basic application context test

## Important Notes

### Weather API Setup
To use real weather data instead of simulated:
1. Sign up at https://openweathermap.org/api
2. Replace `demo` with your API key in `application.properties`
3. Restart application

### CORS Configuration
The application is configured to work with:
- React development server (localhost:3000)
- Local file serving (file:// protocol)
- Local HTML interfaces

### Known Issues
- React UI npm dependencies have installation issues (documented in BUILD_FIXES.md)
- Use alternative web servers for serving React frontend
- Weather API uses demo key by default (limited functionality)

### File Upload Capabilities
- Supports image uploads up to 100MB
- Extracts comprehensive metadata (EXIF, IPTC, XMP)
- Generates multiple output formats (XMP, text)
- Uses metadata-extractor library for processing