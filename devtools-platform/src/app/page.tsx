import Link from 'next/link';
import { tools, toolCategories } from '@/lib/tools';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyToolCard } from '@/components/ui/lazy-tool-card';

export default function Home() {
  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">All Available Tools</h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              Explore all developer tools (some require sign-in for full functionality)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:ml-4">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/demo">
                🚀 Try Demo
              </Link>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Categorized Tools */}
      {Object.entries(toolsByCategory).map(([categoryKey, categoryTools]) => {
        const categoryInfo = toolCategories[categoryKey as keyof typeof toolCategories];
        const CategoryIcon = Icons[categoryInfo.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
        
        return (
          <div key={categoryKey} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CategoryIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{categoryInfo.name}</h2>
                <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
              </div>
            </div>

            {/* Category Tools */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categoryTools.map((tool) => (
                <LazyToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="rounded-lg border bg-muted/50 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Platform Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-base">Data & Storage</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>• Local storage for persistence</li>
              <li>• Export/import functionality</li>
              <li>• No data leaves your browser</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-base">User Experience</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>• Dark/light theme support</li>
              <li>• Fully responsive design</li>
              <li>• No authentication required</li>
            </ul>
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <h3 className="font-medium text-base">Developer Tools</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>• API testing & debugging</li>
              <li>• Database query building</li>
              <li>• Package analysis & config</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
