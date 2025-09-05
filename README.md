# MSSC Brewery Application

A comprehensive Spring Boot application featuring weather APIs, developer tools platform, and advanced backend services.

## Project Overview

This project combines multiple applications:
- **Spring Boot Backend**: Weather/temperature API, image processing, beer/customer management
- **DevTools Platform**: Next.js 15 frontend with 10 developer tools
- **NPM Analyzer**: React-based package analysis with security scanning
- **Database Tools**: Connection builders and query tools for SQL/NoSQL

## Quick Start

### Spring Boot Application
```bash
# Build and run the main application
./mvnw clean compile
./mvnw spring-boot:run
```
Access at: http://localhost:8080

### DevTools Platform
```bash
# Start the Next.js development server
cd devtools-platform
npm run dev
```
Access at: http://localhost:3000

### NPM Analyzer UI
```bash
# Serve the React application
cd npm-analyzer-ui
python3 -m http.server 3001
```
Access at: http://localhost:3001

## Core Features

### 🌡️ Weather & Temperature Service
- Real-time weather data from OpenWeatherMap API
- Air quality index (AQI) integration
- Time-of-day categorization
- Fallback to simulated data
- Interactive React UI

**Endpoints:**
- `GET /api/v1/temperature/{location}` - Get weather data

### 🍺 Brewery Management
- Beer and customer CRUD operations
- RESTful API with versioning (v1, v2)
- Enum support for beer styles

**Endpoints:**
- `GET/POST/PUT/DELETE /api/v1/beer`
- `GET/POST/PUT/DELETE /api/v1/customer`

### 🖼️ Image Processing
- EXIF metadata extraction
- XMP file generation
- Batch processing support
- 100MB upload limit

**Endpoints:**
- `POST /api/v1/images/upload` - Upload and process images

### 🛠️ Developer Tools Platform

**10 Professional Tools Across 4 Categories:**

#### API Tools
- **API Tester**: REST API testing with request/response management
- **WebSocket Tester**: Real-time WebSocket connection testing
- **Mock Server**: Create mock API endpoints for development

#### Data Tools
- **JSON Formatter**: Format, validate, and minify JSON
- **Base64 Encoder/Decoder**: Text to/from Base64 conversion

#### Database Tools
- **Visual SQL Query Builder**: Advanced drag-drop query construction
- **SQL Query Builder**: Visual query building with syntax highlighting
- **Connection String Builder**: Multi-database connection strings
- **MongoDB Query Builder**: Aggregation pipeline builder

#### Development Tools
- **NPM Package Analyzer**: Bundle size, dependencies, security analysis
- **Environment Variable Manager**: .env file management

### 🔍 NPM Package Analysis
- Bundle size analysis with interactive charts
- Dependency tree visualization
- Security vulnerability scanning
- Alternative package suggestions
- Optimization recommendations
- License compliance checking

**Backend Endpoints:**
- `POST /api/v1/npm/analyze` - Analyze package
- `GET /api/v1/npm/alternatives/{packageName}` - Get alternatives
- `GET /api/v1/npm/security/{packageName}` - Security analysis

### 🗄️ Database Tools
- Connection string builder for multiple databases (MySQL, PostgreSQL, MongoDB, etc.)
- MongoDB aggregation pipeline builder
- Query validation and optimization
- Export capabilities (JSON, CSV, SQL)

**Endpoints:**
- `POST /api/v1/connection-builder/build` - Build connection strings
- `POST /api/v1/mongo/query` - Execute MongoDB queries
- `POST /api/v1/mongo/validate` - Validate MongoDB queries

## Technology Stack

### Backend (Spring Boot)
- **Java 21** with Spring Boot 3.2.0
- **Spring Web MVC** for REST APIs
- **WebFlux/WebClient** for external API calls
- **Lombok** for code reduction
- **Maven** build system
- **DevTools** for hot reloading

### Frontend (DevTools Platform)
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** with custom themes
- **NextAuth.js** for authentication
- **Lucide React** for icons
- **LocalStorage** for persistence

### NPM Analyzer UI
- **React 18** with modern hooks
- **Chart.js** for visualizations
- **CSS Grid/Flexbox** for responsive layouts
- **Python HTTP server** for local development

### External Integrations
- **OpenWeatherMap API** for weather data
- **NPM Registry API** for package information
- **Security Advisory APIs** for vulnerability data

## Development Commands

### Spring Boot Commands
```bash
# Development
./mvnw clean compile          # Build project
./mvnw spring-boot:run       # Run application
./mvnw test                  # Run tests
./mvnw clean install         # Full build with tests
./mvnw clean install -DskipTests  # Build without tests

# Production
./mvnw clean package         # Create JAR file
java -jar target/*.jar       # Run packaged application
```

### DevTools Platform Commands
```bash
cd devtools-platform

# Development
npm run dev                  # Start dev server
npm run dev:turbo           # Start with Turbopack
npm run build               # Production build
npm run start               # Production server

# Quality Assurance
npm run lint                # ESLint checking
npm run lint:fix            # Fix linting issues
npm run type-check          # TypeScript check
npm run format              # Format code
npm run test                # Unit tests
npm run test:e2e            # End-to-end tests
npm run test:all            # All tests + type check + lint
```

## Configuration

### Environment Variables

#### Weather API
```properties
# src/main/resources/application.properties
weather.api.key=your-openweathermap-api-key
```

#### DevTools Authentication (Optional)
```bash
# devtools-platform/.env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### File Upload Limits
- Maximum file size: 100MB
- Supported image formats: JPEG, PNG, TIFF, GIF
- Output formats: XMP, text metadata files

## Project Structure

```
mssc-brewery/
├── src/main/java/kanda/springframework/msscbrewery/
│   ├── web/controller/          # REST controllers
│   ├── web/services/            # Business logic services
│   ├── web/model/               # DTOs and data models
│   └── config/                  # Configuration classes
├── devtools-platform/           # Next.js developer tools
│   ├── src/app/                 # App Router pages
│   ├── src/components/          # Reusable UI components
│   ├── src/lib/                 # Utility functions
│   └── src/types/               # TypeScript type definitions
├── npm-analyzer-ui/             # React NPM analyzer
│   ├── src/components/          # React components
│   ├── src/pages/               # Application pages
│   └── src/services/            # API service layer
└── target/                      # Maven build output
```

## API Documentation

### Weather Service
```http
GET /api/v1/temperature/london
Response: {
  "location": "London",
  "temperature": 15.5,
  "feelsLike": 14.2,
  "humidity": 65,
  "pressure": 1013,
  "description": "Partly cloudy",
  "aqi": 42,
  "timeCategory": "afternoon"
}
```

### NPM Analysis
```http
POST /api/v1/npm/analyze
Content-Type: application/json
{
  "packageName": "lodash",
  "version": "latest"
}
```

### Database Connection Builder
```http
POST /api/v1/connection-builder/build
Content-Type: application/json
{
  "databaseType": "MYSQL",
  "host": "localhost",
  "port": 3306,
  "database": "mydb",
  "username": "user",
  "password": "pass"
}
```

## Testing

### Backend Testing
```bash
./mvnw test                    # Unit tests
./mvnw integration-test        # Integration tests
./mvnw verify                  # Full verification
```

### Frontend Testing
```bash
cd devtools-platform
npm run test                   # Unit tests
npm run test:e2e              # End-to-end tests
npm run test:coverage         # Coverage report
```

## Deployment

### Spring Boot Production
```bash
./mvnw clean package
java -jar target/mssc-brewery-*.jar
```

### DevTools Platform Production
```bash
cd devtools-platform
npm run build
npm run start
```

## Contributing

1. Follow existing code patterns and conventions
2. Add tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all quality checks pass before committing

## License

This project is for educational and development purposes.

## Support

For issues and questions:
- Check existing documentation in CLAUDE.md
- Review application logs for error details
- Ensure all required environment variables are set
- Verify API keys and external service configurations