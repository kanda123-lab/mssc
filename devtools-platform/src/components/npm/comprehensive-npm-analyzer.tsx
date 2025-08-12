'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, copyToClipboard } from '@/lib/utils';
import {
  Package2,
  Search,
  Upload,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  Zap,
  Eye,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Clock,
  Star,
  Heart,
  Trash2,
  RefreshCw,
  Info,
  Settings,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  Target,
  HelpCircle,
  BookOpen,
  Code,
  Database,
  Layers
} from 'lucide-react';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  treeShakenSize?: number;
  files: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    type: 'js' | 'css' | 'other';
  }>;
  unusedExports?: string[];
}

interface SecurityAnalysis {
  vulnerabilities: Array<{
    id: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    title: string;
    description: string;
    patched?: string;
    vulnerable_versions: string;
  }>;
  advisories: Array<{
    id: string;
    title: string;
    severity: string;
    url: string;
  }>;
  licenseIssues: Array<{
    package: string;
    license: string;
    issue: string;
  }>;
}

interface DependencyTree {
  name: string;
  version: string;
  size?: number;
  dependencies: DependencyTree[];
  isCircular?: boolean;
  isDuplicate?: boolean;
  isDeprecated?: boolean;
  vulnerabilities?: number;
}

interface PackageStats {
  weeklyDownloads: number;
  monthlyDownloads: number;
  githubStars?: number;
  githubForks?: number;
  openIssues?: number;
  lastCommit?: string;
  maintainers: number;
  publishedDate: string;
  unpublishedVersions?: string[];
}

interface AlternativePackage {
  name: string;
  description: string;
  size: number;
  downloads: number;
  stars?: number;
  maintainedScore: number;
  similarityScore: number;
}

interface ComprehensiveAnalysis {
  packageInfo: PackageInfo;
  bundleAnalysis: BundleAnalysis;
  securityAnalysis: SecurityAnalysis;
  dependencyTree: DependencyTree;
  packageStats: PackageStats;
  alternatives: AlternativePackage[];
  recommendations: {
    bundleOptimization: string[];
    securityImprovements: string[];
    alternativeSuggestions: string[];
    updateRecommendations: string[];
  };
}

interface ComprehensiveNPMAnalyzerProps {
  className?: string;
}

export default function ComprehensiveNPMAnalyzer({ className }: ComprehensiveNPMAnalyzerProps) {
  const [activeTab, setActiveTab] = useState('search');
  const [packageName, setPackageName] = useState('');
  const [packageVersion, setPackageVersion] = useState('latest');
  const [packageJsonContent, setPackageJsonContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [expandedDependencies, setExpandedDependencies] = useState<Record<string, boolean>>({});
  const [comparisonPackages, setComparisonPackages] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'size' | 'downloads' | 'stars'>('size');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  
  const popularPackages = [
    'react', 'vue', 'angular', '@angular/core', 'lodash', 'axios', 'express',
    'typescript', 'webpack', 'babel-core', 'moment', 'chalk', 'commander',
    'uuid', 'joi', 'yup', 'formik', 'next', 'nuxt', 'gatsby'
  ];

  const analyzePackage = async (name: string, version: string = 'latest') => {
    if (!name.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: ComprehensiveAnalysis = {
        packageInfo: {
          name: name.trim(),
          version: version === 'latest' ? generateVersion() : version,
          description: `A comprehensive ${name} package for modern applications`,
          author: 'Package Author',
          license: ['MIT', 'Apache-2.0', 'ISC', 'BSD-3-Clause'][Math.floor(Math.random() * 4)],
          homepage: `https://github.com/example/${name}`,
          repository: `https://github.com/example/${name}`,
          keywords: ['javascript', 'nodejs', 'package', 'utility'],
          dependencies: generateDependencies(),
          devDependencies: generateDevDependencies(),
          peerDependencies: name.includes('react') ? { 'react': '^18.0.0', 'react-dom': '^18.0.0' } : {}
        },
        bundleAnalysis: {
          totalSize: Math.floor(Math.random() * 2000) + 100,
          gzippedSize: Math.floor(Math.random() * 600) + 30,
          treeShakenSize: Math.floor(Math.random() * 400) + 50,
          files: generateFileAnalysis(),
          unusedExports: ['unusedFunction', 'deprecatedMethod', 'internalUtil']
        },
        securityAnalysis: {
          vulnerabilities: generateVulnerabilities(),
          advisories: generateAdvisories(),
          licenseIssues: generateLicenseIssues()
        },
        dependencyTree: generateDependencyTree(name),
        packageStats: {
          weeklyDownloads: Math.floor(Math.random() * 1000000) + 10000,
          monthlyDownloads: Math.floor(Math.random() * 4000000) + 50000,
          githubStars: Math.floor(Math.random() * 50000) + 100,
          githubForks: Math.floor(Math.random() * 10000) + 20,
          openIssues: Math.floor(Math.random() * 200) + 5,
          lastCommit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maintainers: Math.floor(Math.random() * 10) + 1,
          publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        alternatives: generateAlternatives(name),
        recommendations: {
          bundleOptimization: [
            'Use tree shaking to reduce bundle size by ~30%',
            'Consider code splitting for large components',
            'Remove unused dependencies to save ~15KB',
            'Use dynamic imports for non-critical features'
          ],
          securityImprovements: [
            'Update vulnerable dependencies',
            'Enable security auditing in CI/CD',
            'Use npm audit fix for automated fixes',
            'Review license compatibility'
          ],
          alternativeSuggestions: [
            `Consider ${generateAlternative(name)} as a lighter alternative`,
            'Evaluate native browser APIs for simple operations',
            'Check if features are available in your existing dependencies'
          ],
          updateRecommendations: [
            'Update to latest minor version for bug fixes',
            'Review breaking changes before major updates',
            'Test thoroughly after dependency updates'
          ]
        }
      };
      
      setCurrentAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePackageJson = async () => {
    if (!packageJsonContent.trim()) return;
    
    try {
      const packageJson = JSON.parse(packageJsonContent);
      if (packageJson.name) {
        await analyzePackage(packageJson.name, packageJson.version || 'latest');
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Invalid package.json:', error);
    }
  };

  const generateVersion = (): string => {
    const major = Math.floor(Math.random() * 10) + 1;
    const minor = Math.floor(Math.random() * 20);
    const patch = Math.floor(Math.random() * 50);
    return `${major}.${minor}.${patch}`;
  };

  const generateDependencies = (): Record<string, string> => {
    const deps = ['lodash', 'axios', 'moment', 'uuid', 'chalk', 'dotenv', 'cors', 'express'];
    const selected = deps.slice(0, Math.floor(Math.random() * 6) + 2);
    return selected.reduce((acc, dep) => {
      acc[dep] = `^${generateVersion()}`;
      return acc;
    }, {} as Record<string, string>);
  };

  const generateDevDependencies = (): Record<string, string> => {
    const devDeps = ['typescript', 'jest', 'eslint', 'prettier', 'webpack', '@types/node', 'nodemon'];
    const selected = devDeps.slice(0, Math.floor(Math.random() * 5) + 2);
    return selected.reduce((acc, dep) => {
      acc[dep] = `^${generateVersion()}`;
      return acc;
    }, {} as Record<string, string>);
  };

  const generateFileAnalysis = () => {
    return [
      { name: 'index.js', size: Math.floor(Math.random() * 500) + 50, gzippedSize: Math.floor(Math.random() * 150) + 15, type: 'js' as const },
      { name: 'utils.js', size: Math.floor(Math.random() * 300) + 30, gzippedSize: Math.floor(Math.random() * 100) + 10, type: 'js' as const },
      { name: 'styles.css', size: Math.floor(Math.random() * 200) + 20, gzippedSize: Math.floor(Math.random() * 60) + 5, type: 'css' as const },
      { name: 'types.d.ts', size: Math.floor(Math.random() * 100) + 10, gzippedSize: Math.floor(Math.random() * 30) + 3, type: 'other' as const }
    ];
  };

  const generateVulnerabilities = () => {
    const vulns = [
      {
        id: 'CVE-2023-1234',
        severity: 'high' as const,
        title: 'Prototype Pollution Vulnerability',
        description: 'An attacker can inject properties into Object.prototype',
        vulnerable_versions: '<1.2.3'
      },
      {
        id: 'CVE-2023-5678',
        severity: 'moderate' as const,
        title: 'Regular Expression Denial of Service',
        description: 'Inefficient regular expression can cause DoS',
        vulnerable_versions: '>=1.0.0 <1.5.0'
      }
    ];
    return vulns.slice(0, Math.floor(Math.random() * 3));
  };

  const generateAdvisories = () => {
    return [
      {
        id: 'GHSA-1234',
        title: 'Security Advisory',
        severity: 'moderate',
        url: 'https://github.com/advisories/GHSA-1234'
      }
    ];
  };

  const generateLicenseIssues = () => {
    return Math.random() > 0.7 ? [
      {
        package: 'example-dep',
        license: 'GPL-3.0',
        issue: 'GPL license may conflict with commercial use'
      }
    ] : [];
  };

  const generateDependencyTree = (rootName: string): DependencyTree => {
    return {
      name: rootName,
      version: generateVersion(),
      size: Math.floor(Math.random() * 1000) + 100,
      dependencies: [
        {
          name: 'lodash',
          version: '4.17.21',
          size: 543,
          dependencies: [],
          vulnerabilities: Math.floor(Math.random() * 2)
        },
        {
          name: 'moment',
          version: '2.29.4',
          size: 329,
          dependencies: [],
          isDeprecated: true
        }
      ]
    };
  };

  const generateAlternatives = (packageName: string): AlternativePackage[] => {
    const alternatives = [
      `${packageName}-lite`,
      `micro-${packageName}`,
      `${packageName}-alternative`,
      `modern-${packageName}`,
      `tiny-${packageName}`
    ];
    
    return alternatives.slice(0, 3).map(name => ({
      name,
      description: `Lightweight alternative to ${packageName}`,
      size: Math.floor(Math.random() * 200) + 50,
      downloads: Math.floor(Math.random() * 100000) + 5000,
      stars: Math.floor(Math.random() * 1000) + 50,
      maintainedScore: Math.random() * 10,
      similarityScore: Math.random() * 10
    }));
  };

  const generateAlternative = (packageName: string): string => {
    return [`${packageName}-lite`, `micro-${packageName}`, `tiny-${packageName}`][Math.floor(Math.random() * 3)];
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/50 dark:text-red-300';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const toggleDependency = (depId: string) => {
    setExpandedDependencies(prev => ({
      ...prev,
      [depId]: !prev[depId]
    }));
  };

  const renderDependencyTree = (tree: DependencyTree, depth: number = 0): JSX.Element => {
    const hasChildren = tree.dependencies && tree.dependencies.length > 0;
    const isExpanded = expandedDependencies[tree.name];
    
    return (
      <div key={`${tree.name}-${depth}`} className={cn("border-l-2 border-gray-200 dark:border-gray-700", depth > 0 && "ml-4")}>
        <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDependency(tree.name)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          <Package2 className="h-4 w-4 text-blue-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm truncate">{tree.name}</span>
              <Badge variant="secondary" className="text-xs">{tree.version}</Badge>
              {tree.size && (
                <Badge variant="outline" className="text-xs">{formatBytes(tree.size * 1024)}</Badge>
              )}
            </div>
            <div className="flex gap-2 mt-1">
              {tree.isDeprecated && (
                <Badge variant="destructive" className="text-xs">Deprecated</Badge>
              )}
              {tree.isDuplicate && (
                <Badge variant="outline" className="text-xs">Duplicate</Badge>
              )}
              {tree.isCircular && (
                <Badge variant="outline" className="text-xs text-red-600">Circular</Badge>
              )}
              {tree.vulnerabilities && tree.vulnerabilities > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {tree.vulnerabilities} vuln{tree.vulnerabilities > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {tree.dependencies.map(dep => renderDependencyTree(dep, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NPM Package Analyzer</h1>
        <p className="text-muted-foreground">
          Comprehensive package analysis, dependency management, and bundle optimization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="search" className="text-xs">Search</TabsTrigger>
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="dependencies" className="text-xs">Dependencies</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
          <TabsTrigger value="bundle" className="text-xs">Bundle</TabsTrigger>
          <TabsTrigger value="alternatives" className="text-xs">Alternatives</TabsTrigger>
          <TabsTrigger value="compare" className="text-xs">Compare</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Package Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter package name (e.g., react, lodash)"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzePackage(packageName, packageVersion)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Version"
                    value={packageVersion}
                    onChange={(e) => setPackageVersion(e.target.value)}
                    className="w-24"
                  />
                  <Button 
                    onClick={() => analyzePackage(packageName, packageVersion)}
                    disabled={!packageName.trim() || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Analyze
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Popular Packages</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {popularPackages.slice(0, 10).map(pkg => (
                      <Button
                        key={pkg}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPackageName(pkg);
                          setPackageVersion('latest');
                        }}
                        className="justify-start font-mono text-xs"
                      >
                        <Package2 className="h-3 w-3 mr-2" />
                        {pkg}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Package.json Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your package.json content here..."
                  value={packageJsonContent}
                  onChange={(e) => setPackageJsonContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={analyzePackageJson}
                    disabled={!packageJsonContent.trim() || isAnalyzing}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Analyze Package.json
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPackageJsonContent('')}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {currentAnalysis ? (
            <>
              {/* Package Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package2 className="h-8 w-8 text-blue-600" />
                      <div>
                        <h2 className="text-2xl font-bold">{currentAnalysis.packageInfo.name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>v{currentAnalysis.packageInfo.version}</span>
                          <Badge variant="secondary">{currentAnalysis.packageInfo.license}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={currentAnalysis.packageInfo.homepage} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-1" />
                          Homepage
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://www.npmjs.com/package/${currentAnalysis.packageInfo.name}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          NPM
                        </a>
                      </Button>
                    </div>
                  </div>
                  {currentAnalysis.packageInfo.description && (
                    <p className="text-muted-foreground">{currentAnalysis.packageInfo.description}</p>
                  )}
                </CardHeader>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatBytes(currentAnalysis.bundleAnalysis.totalSize * 1024)}
                        </p>
                        <p className="text-xs text-muted-foreground">Bundle Size</p>
                      </div>
                      <Download className="h-8 w-8 text-blue-600/20" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Gzipped: {formatBytes(currentAnalysis.bundleAnalysis.gzippedSize * 1024)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(currentAnalysis.packageStats.weeklyDownloads)}
                        </p>
                        <p className="text-xs text-muted-foreground">Weekly Downloads</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600/20" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Monthly: {formatNumber(currentAnalysis.packageStats.monthlyDownloads)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatNumber(currentAnalysis.packageStats.githubStars || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">GitHub Stars</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-600/20" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Forks: {formatNumber(currentAnalysis.packageStats.githubForks || 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-2xl font-bold",
                          currentAnalysis.securityAnalysis.vulnerabilities.length === 0 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          {currentAnalysis.securityAnalysis.vulnerabilities.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Vulnerabilities</p>
                      </div>
                      <Shield className={cn(
                        "h-8 w-8",
                        currentAnalysis.securityAnalysis.vulnerabilities.length === 0 
                          ? "text-green-600/20" 
                          : "text-red-600/20"
                      )} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      License Issues: {currentAnalysis.securityAnalysis.licenseIssues.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Bundle Optimization
                      </h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {currentAnalysis.recommendations.bundleOptimization.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Security Improvements
                      </h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {currentAnalysis.recommendations.securityImprovements.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Search for a package to see detailed analysis</p>
            </div>
          )}
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-6">
          {currentAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Dependency Tree
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {renderDependencyTree(currentAnalysis.dependencyTree)}
                  
                  {/* Dependencies Summary */}
                  <div className="grid gap-4 md:grid-cols-3 mt-6 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(currentAnalysis.packageInfo.dependencies || {}).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Dependencies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {Object.keys(currentAnalysis.packageInfo.devDependencies || {}).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Dev Dependencies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(currentAnalysis.packageInfo.peerDependencies || {}).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Peer Dependencies</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Analyze a package to view dependency tree</p>
            </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {currentAnalysis ? (
            <>
              {/* Vulnerabilities */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Vulnerabilities
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentAnalysis.securityAnalysis.vulnerabilities.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <p className="text-green-600 font-medium">No known vulnerabilities found!</p>
                      <p className="text-sm text-muted-foreground mt-1">This package appears to be secure</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentAnalysis.securityAnalysis.vulnerabilities
                        .filter(vuln => filterSeverity === 'all' || vuln.severity === filterSeverity)
                        .map(vuln => (
                        <div key={vuln.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(vuln.severity)}>
                                  {vuln.severity.toUpperCase()}
                                </Badge>
                                <code className="text-sm">{vuln.id}</code>
                              </div>
                              <h3 className="font-medium mt-1">{vuln.title}</h3>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                          <div className="text-sm">
                            <span className="font-medium">Vulnerable versions: </span>
                            <code className="text-red-600">{vuln.vulnerable_versions}</code>
                          </div>
                          {vuln.patched && (
                            <div className="text-sm mt-1">
                              <span className="font-medium">Patched in: </span>
                              <code className="text-green-600">{vuln.patched}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* License Issues */}
              {currentAnalysis.securityAnalysis.licenseIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      License Compatibility Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentAnalysis.securityAnalysis.licenseIssues.map((issue, index) => (
                        <div key={index} className="p-3 border rounded bg-yellow-50 dark:bg-yellow-900/20">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">{issue.package}</span>
                            <Badge variant="outline">{issue.license}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.issue}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Analyze a package to view security information</p>
            </div>
          )}
        </TabsContent>

        {/* Bundle Tab */}
        <TabsContent value="bundle" className="space-y-6">
          {currentAnalysis ? (
            <>
              {/* Bundle Size Breakdown */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatBytes(currentAnalysis.bundleAnalysis.totalSize * 1024)}
                    </div>
                    <div className="text-muted-foreground">Total Size</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatBytes(currentAnalysis.bundleAnalysis.gzippedSize * 1024)}
                    </div>
                    <div className="text-muted-foreground">Gzipped</div>
                    <div className="text-sm text-green-600 mt-1">
                      {((1 - currentAnalysis.bundleAnalysis.gzippedSize / currentAnalysis.bundleAnalysis.totalSize) * 100).toFixed(1)}% reduction
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {formatBytes((currentAnalysis.bundleAnalysis.treeShakenSize || 0) * 1024)}
                    </div>
                    <div className="text-muted-foreground">Tree-shaken</div>
                    <div className="text-sm text-purple-600 mt-1">
                      {currentAnalysis.bundleAnalysis.treeShakenSize 
                        ? `${((1 - currentAnalysis.bundleAnalysis.treeShakenSize / currentAnalysis.bundleAnalysis.totalSize) * 100).toFixed(1)}% reduction`
                        : 'Not available'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    File Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentAnalysis.bundleAnalysis.files.map(file => (
                      <div key={file.name} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Code className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-mono text-sm">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.type.toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatBytes(file.size * 1024)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatBytes(file.gzippedSize * 1024)} gzipped
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalysis.bundleAnalysis.unusedExports && 
                     currentAnalysis.bundleAnalysis.unusedExports.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Unused Exports</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentAnalysis.bundleAnalysis.unusedExports.map(exportName => (
                            <Badge key={exportName} variant="secondary" className="font-mono">
                              {exportName}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          These exports are not being used and could be tree-shaken
                        </p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-300">Bundle Tips</h3>
                      <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-400">
                        <li>• Use dynamic imports for code splitting</li>
                        <li>• Enable tree shaking in your bundler</li>
                        <li>• Consider using a lighter alternative</li>
                        <li>• Import only what you need</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Analyze a package to view bundle information</p>
            </div>
          )}
        </TabsContent>

        {/* Alternatives Tab */}
        <TabsContent value="alternatives" className="space-y-6">
          {currentAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Alternative Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentAnalysis.alternatives.map(alt => (
                    <div key={alt.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-mono font-medium">{alt.name}</h3>
                            <Badge variant="outline">{formatBytes(alt.size * 1024)}</Badge>
                            <Badge variant="secondary">{formatNumber(alt.downloads)} downloads</Badge>
                            {alt.stars && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Star className="h-3 w-3" />
                                {formatNumber(alt.stars)}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{alt.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Similarity Score: </span>
                              <span className="text-blue-600">{alt.similarityScore.toFixed(1)}/10</span>
                            </div>
                            <div>
                              <span className="font-medium">Maintenance Score: </span>
                              <span className="text-green-600">{alt.maintainedScore.toFixed(1)}/10</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://www.npmjs.com/package/${alt.name}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => analyzePackage(alt.name)}
                          >
                            Analyze
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Analyze a package to view alternatives</p>
            </div>
          )}
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Package Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add package to comparison..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const packageName = input.value.trim();
                        if (packageName && !comparisonPackages.includes(packageName)) {
                          setComparisonPackages([...comparisonPackages, packageName]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {comparisonPackages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Packages to Compare:</h3>
                    <div className="flex flex-wrap gap-2">
                      {comparisonPackages.map(pkg => (
                        <div key={pkg} className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full">
                          <span className="font-mono text-sm">{pkg}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setComparisonPackages(comparisonPackages.filter(p => p !== pkg))}
                            className="h-4 w-4 p-0 ml-1"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {comparisonPackages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add packages to compare their features and performance</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}