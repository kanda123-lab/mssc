'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Star, 
  Zap,
  Database,
  Globe,
  Code,
  Settings,
  Play,
  BookOpen,
  Keyboard,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/app-store';
import { tools } from '@/lib/tools';

// Onboarding steps configuration
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  canSkip: boolean;
  required: boolean;
}

// Tour step for interactive guidance
interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const router = useRouter();
  const { 
    preferences, 
    updatePreferences, 
    setCurrentTool,
    addNotification,
    toggleFavorite 
  } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [userType, setUserType] = useState<'developer' | 'designer' | 'analyst' | 'other'>('developer');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DevTools Platform',
      description: 'Your comprehensive toolkit for development, design, and data analysis',
      icon: <Zap className="h-8 w-8" />,
      canSkip: false,
      required: true,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Zap className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to DevTools Platform</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A unified platform with 10+ essential tools for developers, designers, and analysts. 
              Let's get you started with a quick setup.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">API Tools</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">Data Tools</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-sm font-medium">Database</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Settings className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-sm font-medium">Development</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'user-type',
      title: 'What describes you best?',
      description: 'Help us customize your experience',
      icon: <Users className="h-8 w-8" />,
      canSkip: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">What describes you best?</h2>
            <p className="text-muted-foreground">
              We'll customize the interface and recommendations based on your role
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                type: 'developer' as const,
                title: 'Developer',
                description: 'API testing, database queries, environment management',
                icon: <Code className="h-6 w-6" />,
                tools: ['API Tester', 'SQL Builder', 'Environment Manager'],
              },
              {
                type: 'designer' as const,
                title: 'Designer',
                description: 'JSON formatting, Base64 encoding, mock servers',
                icon: <Star className="h-6 w-6" />,
                tools: ['JSON Formatter', 'Base64 Encoder', 'Mock Server'],
              },
              {
                type: 'analyst' as const,
                title: 'Data Analyst',
                description: 'Database queries, NPM analysis, data visualization',
                icon: <Database className="h-6 w-6" />,
                tools: ['MongoDB Builder', 'NPM Analyzer', 'Visual Query Builder'],
              },
              {
                type: 'other' as const,
                title: 'Other',
                description: 'All tools available, general recommendations',
                icon: <Settings className="h-6 w-6" />,
                tools: ['All Tools Available'],
              },
            ].map((option) => (
              <Card
                key={option.type}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  userType === option.type && 'ring-2 ring-primary bg-primary/5'
                )}
                onClick={() => setUserType(option.type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {option.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {userType === option.type && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'tool-selection',
      title: 'Select your favorite tools',
      description: 'Choose tools to add to your favorites for quick access',
      icon: <Star className="h-8 w-8" />,
      canSkip: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Select your favorite tools</h2>
            <p className="text-muted-foreground">
              These will appear in your favorites for quick access
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              const getIcon = () => {
                const iconMap = {
                  api: <Globe className="h-5 w-5" />,
                  data: <Code className="h-5 w-5" />,
                  database: <Database className="h-5 w-5" />,
                  development: <Settings className="h-5 w-5" />,
                };
                return iconMap[tool.category];
              };

              return (
                <Card
                  key={tool.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-primary bg-primary/5'
                  )}
                  onClick={() => {
                    setSelectedTools(prev =>
                      prev.includes(tool.id)
                        ? prev.filter(id => id !== tool.id)
                        : [...prev, tool.id]
                    );
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getIcon()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Selected: {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Learn keyboard shortcuts',
      description: 'Master the shortcuts for faster workflow',
      icon: <Keyboard className="h-8 w-8" />,
      canSkip: true,
      required: false,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Keyboard Shortcuts</h2>
            <p className="text-muted-foreground">
              Learn these shortcuts for a faster workflow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: '⌘ + K', description: 'Open command palette' },
              { key: '⌘ + /', description: 'Show all shortcuts' },
              { key: '⌘ + 1-9', description: 'Quick tool access' },
              { key: '⌘ + Shift + P', description: 'Tool picker' },
              { key: '⌘ + F', description: 'Search tools' },
              { key: 'Esc', description: 'Close dialogs' },
            ].map((shortcut) => (
              <div key={shortcut.key} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="font-mono">
                  {shortcut.key}
                </Badge>
                <span className="text-sm">{shortcut.description}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                // Trigger shortcuts modal
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: '/',
                  metaKey: true,
                  bubbles: true
                }));
              }}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              View All Shortcuts
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Start exploring the platform',
      icon: <Check className="h-8 w-8" />,
      canSkip: false,
      required: true,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
            <Check className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Welcome to DevTools Platform. Start exploring your tools and boost your productivity.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card className="p-4">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Documentation</div>
                <div className="text-xs text-muted-foreground">Get help anytime</div>
              </Card>
              <Card className="p-4">
                <Keyboard className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-sm font-medium">Shortcuts</div>
                <div className="text-xs text-muted-foreground">Work faster</div>
              </Card>
              <Card className="p-4">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="text-sm font-medium">Favorites</div>
                <div className="text-xs text-muted-foreground">Quick access</div>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle step completion
  const completeCurrentStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
  };

  // Handle next step
  const handleNext = () => {
    completeCurrentStep();

    if (currentStep === steps.length - 1) {
      // Last step - complete onboarding
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle skip step
  const handleSkipStep = () => {
    if (currentStepData.canSkip) {
      handleNext();
    }
  };

  // Handle complete onboarding
  const handleComplete = () => {
    // Apply user selections
    selectedTools.forEach(toolId => {
      toggleFavorite(toolId);
    });

    // Update preferences
    updatePreferences({
      onboardingCompleted: true,
      userType,
      keyboardShortcuts: true,
    });

    // Add welcome notification
    addNotification({
      type: 'success',
      title: 'Welcome to DevTools Platform!',
      message: 'Onboarding completed successfully. Start exploring your tools.',
    });

    // Navigate to first favorite tool or dashboard
    if (selectedTools.length > 0) {
      const firstTool = tools.find(t => t.id === selectedTools[0]);
      if (firstTool) {
        router.push(firstTool.path);
      }
    }

    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {currentStepData.icon}
            </div>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.content}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStepData.canSkip && currentStep < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkipStep}>
                Skip
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Play className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Skip All */}
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}