# DevTools Platform

A comprehensive suite of developer tools built with Next.js 14, TypeScript, and Tailwind CSS. This platform provides 5 essential development tools in a modern, responsive interface with dark/light theme support.

## 🚀 Features

- **API Tester**: Send HTTP requests and analyze responses with save functionality
- **WebSocket Tester**: Test WebSocket connections and real-time communication
- **Mock Server**: Create mock API endpoints for testing and development
- **JSON Formatter**: Format, validate, and minify JSON data
- **Base64 Encoder/Decoder**: Encode and decode text to/from Base64 format

### Core Features
- 🎨 Modern UI with dark/light theme toggle
- 💾 Local storage for saving data across sessions
- 📱 Fully responsive design
- 🔄 No authentication required - use immediately
- 📤 Export/import functionality
- ⚡ Built with Next.js 14 and TypeScript for optimal performance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI patterns
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode
- **Storage**: Browser localStorage with TypeScript interfaces

## 📋 Prerequisites

- Node.js 18.17 or later
- npm or yarn or pnpm

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build for Production

```bash
npm run build
npm run start
```

## 🏗️ Project Structure

```
devtools-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── tools/             # Tool pages
│   │   │   ├── api-tester/    # API testing tool
│   │   │   ├── websocket-tester/ # WebSocket testing tool
│   │   │   ├── mock-server/   # Mock server generator
│   │   │   ├── json-formatter/ # JSON formatter/validator
│   │   │   └── base64/        # Base64 encoder/decoder
│   │   ├── globals.css        # Global styles with theme support
│   │   ├── layout.tsx         # Root layout with theme provider
│   │   └── page.tsx          # Homepage dashboard
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components (Header, Sidebar, Main)
│   │   ├── ui/               # UI components (Button, Input, etc.)
│   │   └── theme-provider.tsx # Theme provider wrapper
│   ├── lib/                  # Utility functions
│   │   ├── storage.ts        # LocalStorage manager with TypeScript
│   │   ├── tools.ts          # Tools configuration
│   │   └── utils.ts          # General utilities (JSON, Base64, etc.)
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🔧 Tools Overview

### 1. API Tester (`/tools/api-tester`)
- Send HTTP requests (GET, POST, PUT, DELETE, PATCH)
- Custom headers and request body
- Response analysis with status, headers, and body
- Save and load requests with timestamps
- Response time tracking
- Error handling with graceful fallbacks

### 2. WebSocket Tester (`/tools/websocket-tester`)
- Connect to WebSocket servers with custom protocols
- Real-time message exchange
- Connection status monitoring
- Message history with timestamps
- Save connection configurations
- Built-in test servers for quick testing

### 3. Mock Server (`/tools/mock-server`)
- Create mock API endpoints with custom responses
- Support for all HTTP methods
- Custom response status codes and headers
- Response delays for testing slow networks
- Export to Node.js/Express server code
- Enable/disable individual endpoints

### 4. JSON Formatter (`/tools/json-formatter`)
- Format and validate JSON with real-time error detection
- Minify JSON for production
- File upload/download support
- Save formatted JSON with custom names
- Copy to clipboard functionality
- Comprehensive error messages

### 5. Base64 Encoder/Decoder (`/tools/base64`)
- Encode text to Base64 format
- Decode Base64 back to text
- One-click mode switching
- Quick example texts for testing
- Save conversions with timestamps
- Error handling for invalid Base64

## 💾 Data Storage

All data is stored locally in your browser using localStorage with TypeScript interfaces:
- API requests and responses
- WebSocket connections and message history
- Mock server endpoints
- JSON formats and validations
- Base64 conversions

Data persists between browser sessions but remains completely private and local.

## 🎨 Customization

### Adding New Tools

1. Create a new directory in `src/app/tools/[tool-name]/`
2. Add the tool configuration to `src/lib/tools.ts`
3. Create the tool page component with proper TypeScript types
4. Update storage types in `src/types/index.ts` if needed
5. The tool will automatically appear in the sidebar navigation

### Theming

The app uses a comprehensive theme system with CSS custom properties:
- Light/dark theme toggle in the header
- Consistent color palette across all tools
- Tailwind CSS with custom theme variables
- Responsive design patterns

### UI Components

All UI components follow consistent patterns:
- TypeScript interfaces for props
- Tailwind CSS for styling
- Accessible design patterns
- Consistent spacing and typography

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Development

The project includes:
- TypeScript for type safety
- ESLint for code quality
- Next.js 14 with App Router
- Turbopack for fast development builds
- Hot reloading for instant feedback

### Key Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🏃‍♂️ Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
# 4. Start using the tools immediately!
```

The platform is ready to use without any configuration. All tools work offline, and no authentication is required.

## 📄 License

This project is open source and available under the MIT License.

---

**Happy developing!** 🚀
