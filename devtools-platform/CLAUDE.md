# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Development server**: `npm run dev` or `npm run dev:turbo` (with Turbopack)
- **Production build**: `npm run build`
- **Production server**: `npm run start`
- **Linting**: `npm run lint` or `npm run lint:fix`
- **Formatting**: `npm run format` or `npm run format:check`
- **Type checking**: `npm run type-check`

### Testing Commands
- **Unit tests**: `npm run test` or `npm run test:watch`
- **Integration tests**: `npm run test:integration`
- **E2E tests**: `npm run test:e2e` or `npm run test:e2e:ui`
- **All tests**: `npm run test:all`
- **Coverage**: `npm run test:coverage`
- **CI pipeline**: `npm run ci:local`

### Development Server
The dev server supports Turbopack for faster builds. Port 3000 is default but will auto-find available ports.

## Architecture Overview

### Framework & Tech Stack
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS 4** with custom theme system
- **React 19** with client-side state management
- **next-themes** for dark/light mode switching
- **Lucide React** for consistent iconography
- **localStorage** for client-side persistence

### Core Architecture Pattern

This is a **single-page application** with multiple developer tools, each functioning as independent modules with shared infrastructure:

**Layout Architecture:**
```
RootLayout (layout.tsx) 
├── ThemeProvider (next-themes)
└── MainLayout (client component)
    ├── Header (theme toggle, branding)
    ├── Sidebar (tool navigation)
    └── Tool Pages (individual tools)
```

**Data Flow:**
```
Tool Components → StorageManager → localStorage
                ↓
         TypeScript interfaces ← types/index.ts
```

### Key Architectural Concepts

#### 1. Tool Registration System
Tools are defined in `src/lib/tools.ts` as configuration objects. Each tool automatically appears in navigation and routes. To add a tool:
1. Add configuration to `tools` array
2. Create page in `src/app/tools/[tool-name]/page.tsx`  
3. Update TypeScript types if needed

#### 2. Unified Storage System
All tools share a centralized storage system via `StorageManager` class:
- **Single localStorage key**: `'devtools-platform-data'`
- **Type-safe storage**: All data structures defined in `src/types/index.ts`
- **Graceful SSR handling**: Window checks prevent hydration errors
- **Merge strategy**: New data merged with existing to preserve user data

#### 3. Client-Side State Management
Each tool manages its own state using React hooks:
- No external state management library
- LocalStorage persistence handled by StorageManager
- Real-time updates within tools (e.g., WebSocket messages, API responses)

#### 4. Theme System
Comprehensive theming using CSS custom properties:
- **Root-level theme variables** in `globals.css`
- **System theme detection** with manual override
- **Consistent color tokens** across all components
- **Dark/light mode** with smooth transitions

### Component Architecture

#### Layout Components (`src/components/layout/`)
- **Header**: Global navigation, theme toggle, responsive menu button
- **Sidebar**: Tool navigation with active state management
- **MainLayout**: Wrapper that combines Header + Sidebar + responsive behavior

#### UI Components (`src/components/ui/`)
Follow a consistent pattern:
- TypeScript prop interfaces
- `cn()` utility for conditional styling
- React.forwardRef for proper ref passing
- Tailwind CSS with theme tokens

#### Tool Pages (`src/app/tools/*/page.tsx`)
Each tool follows this pattern:
- Client-side component (`'use client'`)
- Local state for UI interactions
- StorageManager integration for persistence
- Responsive 3-column layout (main content + sidebar)
- Error handling and loading states

### Tool-Specific Architectures

#### API Tester
- HTTP client using fetch API
- Request/response state management
- Headers parsing (string ↔ object conversion)
- Response time measurement
- Saved request management

#### WebSocket Tester
- Real-time WebSocket connection management
- Message history with timestamps
- Connection state tracking
- Protocol support for WebSocket subprotocols

#### Mock Server
- In-memory mock endpoint configuration
- Node.js/Express code generation
- Endpoint enable/disable functionality
- Response delay simulation

#### JSON Formatter
- Real-time JSON validation
- Format/minify transformations
- File upload/download capabilities
- Error message display with specific error locations

#### Base64 Encoder/Decoder
- Bidirectional text ↔ Base64 conversion
- Mode switching with data preservation
- UTF-8 handling for international characters
- Example text templates

### Storage Data Structure

```typescript
StorageData = {
  apiRequests: APIRequest[]           // Saved HTTP requests
  webSocketConnections: WebSocketConnection[] // WS configurations
  mockEndpoints: MockEndpoint[]       // Mock server endpoints
  jsonFormats: SavedJSON[]           // Formatted JSON snippets
  base64Conversions: SavedConversion[] // Base64 operations
}
```

### Development Workflow

#### Adding New Tools
1. Define tool configuration in `src/lib/tools.ts`
2. Create TypeScript interfaces in `src/types/index.ts`
3. Add storage fields to `StorageData` interface
4. Create tool page component following established patterns
5. Tool automatically appears in navigation

#### Styling Guidelines
- Use Tailwind utilities with theme tokens
- Responsive design: mobile-first approach
- Dark/light theme support via CSS custom properties
- Consistent spacing using Tailwind scale

#### TypeScript Integration
- Strict type checking enabled
- All storage operations type-safe
- Component props interfaces required
- Utility functions with proper return types

### Performance Considerations

- **Turbopack** for fast development builds
- **Static generation** where possible (dashboard, tool pages)
- **Client-side routing** for instant navigation
- **Lazy loading** of tool-specific functionality
- **LocalStorage batching** to avoid excessive writes

### Browser Compatibility

- **Modern browsers** (ES2020+ features)
- **WebSocket API** for real-time tools
- **Fetch API** for HTTP requests
- **LocalStorage** for persistence
- **CSS Grid/Flexbox** for layouts

## Authentication System

### NextAuth.js Configuration
The platform includes optional authentication using NextAuth.js with JWT sessions:

**Providers Configured:**
- Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- GitHub OAuth (`GITHUB_ID`, `GITHUB_SECRET`)

**Key Files:**
- `src/lib/auth.ts` - NextAuth configuration with providers and session callbacks
- `src/types/next-auth.d.ts` - Extended session/user type definitions
- `src/middleware.ts` - Route protection middleware
- `src/app/auth/` - Authentication pages (signin, error)

**Authentication Features:**
- JWT sessions with 30-day expiration
- Demo user data (no database required)
- Protected routes: `/dashboard`, `/subscription`
- All tools work in demo mode without authentication
- Logout functionality included

### Environment Variables Required
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### OAuth Provider Setup
**Google Cloud Console:**
- Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- Enable Google+ API

**GitHub OAuth App:**
- Add callback URL: `http://localhost:3000/api/auth/callback/github`

## UI Architecture Improvements

### Current Layout System
The platform uses a simplified header-only layout after removing the sidebar:

**Layout Structure:**
```
RootLayout (with ThemeProvider)
└── MainLayout (client component)
    ├── Header (enhanced with prominent dark mode toggle)
    └── Full-width content area
```

### Ultra-Compact Tool Cards
Tools are displayed using `LazyToolCard` components with:
- **Responsive grid**: 2-6 columns based on screen size
- **Category-based colors**: Blue (API), Green (Data), Purple (Database), Orange (Development)
- **Smooth animations**: Hover effects and click transitions
- **Lazy loading**: Performance optimization with Intersection Observer
- **Hover tooltips**: Tool descriptions on hover

### Enhanced Dark Mode Toggle
Prominent dark mode button in header with:
- Gradient backgrounds (orange/blue light, blue/purple dark)
- Smooth icon transitions (Sun/Moon)
- Enhanced border and shadow effects
- Responsive text labels

### Performance Optimizations
- **Debounced interactions**: `useDebounce` hook for search/filter
- **CSS optimizations**: Line clamping, will-change properties
- **Lazy loading**: Tools load on viewport entry
- **Mobile responsiveness**: Optimized touch targets and spacing

## Troubleshooting

### Common OAuth Issues
1. **"redirect_uri_mismatch"**: Verify OAuth callback URLs are configured correctly
2. **"Neither apiKey nor config.authenticator provided"**: Prisma client initialization (currently disabled)

### Development Issues
- **BigInt serialization errors**: Ensure all session data uses regular numbers
- **asChild prop warnings**: Button component includes Radix UI Slot support
- **Text overlap**: Tool cards use optimized spacing and responsive grid

### Build Commands
Use the testing commands from package.json for quality assurance:
- `npm run lint` - ESLint checking
- `npm run type-check` - TypeScript compilation check
- `npm run test:all` - Complete test suite