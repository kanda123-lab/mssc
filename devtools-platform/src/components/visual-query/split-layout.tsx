'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize2, Minimize2, Code, Eye, Settings, Database, History, BookOpen } from 'lucide-react';

interface SplitLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  sqlCode: string;
  resultsPanel: ReactNode;
  settingsPanel: ReactNode;
  historyPanel: ReactNode;
  templatesPanel: ReactNode;
}

interface TabPanelProps {
  children: ReactNode;
  title: string;
  icon: ReactNode;
}

const TabPanel = ({ children, title, icon }: TabPanelProps) => (
  <div className="h-full flex flex-col">
    <div className="flex items-center gap-2 p-3 border-b bg-muted/20">
      {icon}
      <span className="font-medium text-sm">{title}</span>
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

export function SplitLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  sqlCode,
  resultsPanel,
  settingsPanel,
  historyPanel,
  templatesPanel
}: SplitLayoutProps) {
  const [layout, setLayout] = useState<'three-panel' | 'two-panel-vertical' | 'two-panel-horizontal' | 'single-panel'>('three-panel');
  const [activeRightTab, setActiveRightTab] = useState('sql');

  const renderLayout = () => {
    switch (layout) {
      case 'single-panel':
        return (
          <div className="h-full">
            {centerPanel}
          </div>
        );

      case 'two-panel-vertical':
        return (
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              {centerPanel}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full">
                <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b bg-muted/20">
                    <TabsTrigger value="sql" className="gap-2">
                      <Code className="h-4 w-4" />
                      Generated SQL
                    </TabsTrigger>
                    <TabsTrigger value="results" className="gap-2">
                      <Database className="h-4 w-4" />
                      Results
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="sql" className="h-full m-0">
                      <div className="h-full overflow-y-auto">
                        <pre className="p-4 text-sm font-mono bg-muted/50 h-full">
                          <code>{sqlCode || '-- SQL will appear here as you build your query'}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="results" className="h-full m-0">
                      {resultsPanel}
                    </TabsContent>
                    <TabsContent value="settings" className="h-full m-0">
                      {settingsPanel}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        );

      case 'two-panel-horizontal':
        return (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={30} minSize={20}>
              <Tabs defaultValue="schema" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-muted/20">
                  <TabsTrigger value="schema" className="gap-2">
                    <Database className="h-4 w-4" />
                    Schema
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="schema" className="h-full m-0">
                    <TabPanel title="Schema" icon={<Database className="h-4 w-4" />}>
                      {leftPanel}
                    </TabPanel>
                  </TabsContent>
                  <TabsContent value="history" className="h-full m-0">
                    <TabPanel title="History" icon={<History className="h-4 w-4" />}>
                      {historyPanel}
                    </TabPanel>
                  </TabsContent>
                  <TabsContent value="templates" className="h-full m-0">
                    <TabPanel title="Templates" icon={<BookOpen className="h-4 w-4" />}>
                      {templatesPanel}
                    </TabPanel>
                  </TabsContent>
                </div>
              </Tabs>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70} minSize={50}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  {centerPanel}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b bg-muted/20">
                      <TabsTrigger value="sql" className="gap-2">
                        <Code className="h-4 w-4" />
                        Generated SQL
                      </TabsTrigger>
                      <TabsTrigger value="results" className="gap-2">
                        <Database className="h-4 w-4" />
                        Results
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="sql" className="h-full m-0">
                        <div className="h-full overflow-y-auto">
                          <pre className="p-4 text-sm font-mono bg-muted/50 h-full">
                            <code>{sqlCode || '-- SQL will appear here as you build your query'}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="results" className="h-full m-0">
                        {resultsPanel}
                      </TabsContent>
                      <TabsContent value="settings" className="h-full m-0">
                        {settingsPanel}
                      </TabsContent>
                    </div>
                  </Tabs>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        );

      case 'three-panel':
      default:
        return (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel */}
            <ResizablePanel defaultSize={25} minSize={15}>
              <Tabs defaultValue="schema" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-muted/20">
                  <TabsTrigger value="schema" className="gap-2">
                    <Database className="h-4 w-4" />
                    Schema
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="schema" className="h-full m-0">
                    {leftPanel}
                  </TabsContent>
                  <TabsContent value="history" className="h-full m-0">
                    {historyPanel}
                  </TabsContent>
                  <TabsContent value="templates" className="h-full m-0">
                    {templatesPanel}
                  </TabsContent>
                </div>
              </Tabs>
            </ResizablePanel>

            <ResizableHandle />

            {/* Center Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              {centerPanel}
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-muted/20">
                  <TabsTrigger value="sql" className="gap-2">
                    <Code className="h-4 w-4" />
                    SQL
                  </TabsTrigger>
                  <TabsTrigger value="results" className="gap-2">
                    <Database className="h-4 w-4" />
                    Results
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="sql" className="h-full m-0">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <pre className="p-4 text-sm font-mono bg-muted/50 h-full">
                          <code>{sqlCode || '-- SQL will appear here as you build your query'}</code>
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="results" className="h-full m-0">
                    {resultsPanel}
                  </TabsContent>
                  <TabsContent value="settings" className="h-full m-0">
                    {settingsPanel}
                  </TabsContent>
                </div>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Layout Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Layout:</span>
          <div className="flex rounded border">
            <Button
              size="sm"
              variant={layout === 'three-panel' ? 'default' : 'ghost'}
              onClick={() => setLayout('three-panel')}
              className="rounded-none rounded-l border-r"
            >
              <div className="flex gap-1">
                <div className="w-2 h-3 border"></div>
                <div className="w-2 h-3 border"></div>
                <div className="w-2 h-3 border"></div>
              </div>
            </Button>
            <Button
              size="sm"
              variant={layout === 'two-panel-horizontal' ? 'default' : 'ghost'}
              onClick={() => setLayout('two-panel-horizontal')}
              className="rounded-none border-r"
            >
              <div className="flex gap-1">
                <div className="w-2 h-3 border"></div>
                <div className="w-4 h-3 border"></div>
              </div>
            </Button>
            <Button
              size="sm"
              variant={layout === 'two-panel-vertical' ? 'default' : 'ghost'}
              onClick={() => setLayout('two-panel-vertical')}
              className="rounded-none border-r"
            >
              <div className="flex flex-col gap-1">
                <div className="w-6 h-1 border"></div>
                <div className="w-6 h-1 border"></div>
              </div>
            </Button>
            <Button
              size="sm"
              variant={layout === 'single-panel' ? 'default' : 'ghost'}
              onClick={() => setLayout('single-panel')}
              className="rounded-none rounded-r"
            >
              <div className="w-6 h-3 border"></div>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="outline">
            <Maximize2 className="h-4 w-4 mr-1" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        {renderLayout()}
      </div>
    </div>
  );
}