'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Lightbulb, 
  Video, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, HelpSection } from '@/types';
import { tools } from '@/lib/tools';

// Help documentation data
const HELP_SECTIONS: HelpSection[] = [
  // General Help
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `Welcome to Developer Tools Platform! This comprehensive suite provides essential tools for web developers, API testing, data manipulation, and database management.

## Quick Start
1. Navigate using the sidebar to find the tool you need
2. Use Cmd+K to open the command palette for quick access
3. All your data is saved locally and persists between sessions
4. Use keyboard shortcuts for faster workflow

## Key Features
- **API Testing**: Test REST APIs and WebSocket connections
- **Data Tools**: Format JSON, encode/decode Base64, and more  
- **Database Tools**: Build SQL queries, manage connections, and analyze MongoDB
- **Mock Server**: Create mock endpoints for development

## Tips
- Press Cmd+/ to see all keyboard shortcuts
- Use the favorites system to bookmark frequently used tools
- Enable dark mode from the header for better night coding`,
    category: 'General',
    order: 1
  },
  
  // Tool-specific help
  {
    id: 'api-tester-help',
    title: 'API Tester Guide',
    content: `The API Tester allows you to send HTTP requests and analyze responses with advanced features.

## Features
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Custom headers and request bodies
- Response time measurement
- Syntax highlighting for JSON responses
- Request history and favorites

## Usage
1. Enter your API endpoint URL
2. Select the HTTP method
3. Add headers in the format "Header-Name: value"
4. For POST/PUT requests, add your request body
5. Click "Send Request" to execute

## Tips
- Use environment variables in URLs like {{baseUrl}}/api/users
- Save frequently used requests for quick access
- Use the response time info to monitor API performance
- Copy response data directly to clipboard`,
    category: 'Tools',
    toolId: 'api-tester',
    order: 2
  },

  {
    id: 'json-formatter-help', 
    title: 'JSON Formatter Guide',
    content: `Format, validate, and manipulate JSON data with advanced editing features.

## Features
- Real-time JSON validation and formatting
- Syntax highlighting and error detection
- Minify and beautify JSON
- File upload and download support
- JSONPath query support

## Usage
1. Paste or type JSON in the input area
2. The tool automatically validates and highlights syntax
3. Use Format button to beautify minified JSON
4. Use Minify to reduce file size
5. Download formatted JSON as a file

## Error Handling
- Red underlines indicate syntax errors
- Error messages show specific line and character
- Auto-completion suggests valid JSON structure

## Advanced Features
- JSONPath queries to extract specific data
- Schema validation against JSON Schema
- Diff comparison between two JSON objects`,
    category: 'Tools',
    toolId: 'json-formatter',
    order: 3
  },

  {
    id: 'database-tools-help',
    title: 'Database Tools Guide', 
    content: `Comprehensive database tools for SQL and NoSQL databases.

## SQL Query Builder
- Visual query builder with drag-and-drop interface
- Support for multiple SQL dialects (MySQL, PostgreSQL, SQLite, etc.)
- Query optimization suggestions
- Execution plan analysis

## MongoDB Query Builder  
- Aggregation pipeline builder
- Query validation and optimization
- Schema analysis and suggestions
- Index recommendations

## Connection Builder
- Secure connection string generation
- Support for 15+ database types
- Connection testing and validation
- Security best practices enforcement

## Usage Tips
- Test connections before using in production
- Use parameterized queries to prevent SQL injection
- Monitor query performance and optimize accordingly
- Keep connection strings secure and use environment variables`,
    category: 'Tools', 
    toolId: 'database-connection-builder',
    order: 4
  },

  // Troubleshooting
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `Common issues and solutions for the Developer Tools Platform.

## Data Not Saving
- Check if your browser allows localStorage
- Clear browser cache and try again
- Ensure you're not in incognito/private mode

## Tools Not Loading
- Check your internet connection
- Refresh the page
- Try disabling browser extensions
- Clear browser cache

## Performance Issues
- Close unused browser tabs
- Use the latest version of your browser
- Check available system memory
- Consider using fewer tools simultaneously

## API Connection Issues
- Verify the API endpoint is accessible
- Check CORS settings on the target server
- Ensure proper authentication headers
- Test with a simpler request first

## Getting Help
- Use the built-in help system (Cmd+/)
- Check the community forum
- Report bugs through the feedback system
- Contact support for enterprise issues`,
    category: 'Support',
    order: 5
  }
];

// Contextual help tooltips
export const CONTEXTUAL_HELP = {
  'api-tester': {
    method: 'Select the HTTP method for your request. GET for retrieving data, POST for creating, PUT for updating, DELETE for removing.',
    url: 'Enter the full URL including protocol (http:// or https://). You can use environment variables like {{baseUrl}}.',
    headers: 'Add custom headers one per line in format "Header-Name: value". Common headers include Authorization, Content-Type, Accept.',
    body: 'Request body for POST/PUT requests. Use JSON format for APIs that expect JSON data.'
  },
  'json-formatter': {
    input: 'Paste or type JSON data here. The formatter will automatically validate and highlight syntax errors.',
    output: 'Formatted JSON appears here with proper indentation and syntax highlighting.',
    validation: 'Green checkmark means valid JSON, red X means there are syntax errors to fix.'
  },
  'database-connection-builder': {
    type: 'Select your database type. Each type has specific connection parameters and security considerations.',
    host: 'Database server hostname or IP address. Use localhost for local databases.',
    port: 'Database server port. Each database type has a default port that will be auto-filled.',
    security: 'Enable SSL/TLS encryption for secure connections. Recommended for production databases.'
  }
};

// Main Help System Component
interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  toolId?: string;
}

export function HelpSystem({ isOpen, onClose, toolId }: HelpSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Filter sections based on search and category
  const filteredSections = HELP_SECTIONS.filter(section => {
    const matchesSearch = !searchQuery || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || section.category === activeCategory;
    const matchesTool = !toolId || section.toolId === toolId;
    
    return matchesSearch && matchesCategory && matchesTool;
  });

  const categories = ['All', ...Array.from(new Set(HELP_SECTIONS.map(s => s.category)))];

  useEffect(() => {
    if (toolId && isOpen) {
      const toolSection = HELP_SECTIONS.find(s => s.toolId === toolId);
      if (toolSection) {
        setSelectedSection(toolSection.id);
      }
    }
  }, [toolId, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r bg-muted/20 p-4 overflow-y-auto">
            <DialogHeader className="p-0 mb-4">
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Documentation
              </DialogTitle>
            </DialogHeader>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Help Sections */}
            <div className="space-y-1">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg text-sm transition-colors',
                    'hover:bg-muted',
                    selectedSection === section.id ? 'bg-primary text-primary-foreground' : ''
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {section.toolId && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {tools.find(t => t.id === section.toolId)?.name}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedSection ? (
              <HelpContent 
                section={HELP_SECTIONS.find(s => s.id === selectedSection)!}
              />
            ) : (
              <HelpOverview />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Help Content Component
function HelpContent({ section }: { section: HelpSection }) {
  return (
    <div className="max-w-none prose prose-sm dark:prose-invert">
      <h1 className="flex items-center gap-2 mb-4">
        <BookOpen className="h-6 w-6" />
        {section.title}
      </h1>
      
      <div 
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ 
          __html: section.content
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
        }}
      />
    </div>
  );
}

// Help Overview Component  
function HelpOverview() {
  const popularSections = HELP_SECTIONS
    .filter(s => ['getting-started', 'api-tester-help', 'json-formatter-help'].includes(s.id))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Help Center</h1>
        <p className="text-muted-foreground">
          Find answers, learn about features, and get the most out of Developer Tools Platform.
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              New to the platform? Start here for a quick overview.
            </p>
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-500" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Watch step-by-step video guides for each tool.
            </p>
            <Button variant="outline" size="sm">
              Watch Videos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Connect with other developers and get help.
            </p>
            <Button variant="outline" size="sm">
              Join Community
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5" />
          Popular Articles
        </h2>
        <div className="space-y-3">
          {popularSections.map(section => (
            <Card key={section.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.content.slice(0, 120)}...
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Essential Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Command Palette</span>
              <Badge variant="outline">⌘K</Badge>
            </div>
            <div className="flex justify-between">
              <span>Show Help</span>
              <Badge variant="outline">⌘/</Badge>
            </div>
            <div className="flex justify-between">
              <span>API Tester</span>
              <Badge variant="outline">⌘1</Badge>
            </div>
            <div className="flex justify-between">
              <span>JSON Formatter</span>
              <Badge variant="outline">⌘3</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Contextual Help Tooltip Component
interface ContextualHelpProps {
  toolId: string;
  field: string;
  children: React.ReactNode;
}

export function ContextualHelp({ toolId, field, children }: ContextualHelpProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const helpText = CONTEXTUAL_HELP[toolId as keyof typeof CONTEXTUAL_HELP]?.[field as keyof any];

  if (!helpText) return <>{children}</>;

  return (
    <div className="relative">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1"
      >
        {children}
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </div>
      
      {showTooltip && (
        <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-popover border rounded-md shadow-md max-w-xs text-sm">
          {helpText}
        </div>
      )}
    </div>
  );
}

// Help Button Component
export function HelpButton({ toolId, className }: { toolId?: string; className?: string }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(true)}
        className={cn("flex items-center gap-1", className)}
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>
      
      <HelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        toolId={toolId}
      />
    </>
  );
}