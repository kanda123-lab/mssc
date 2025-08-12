'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  CreditCard, 
  Database, 
  Activity,
  LogOut,
  Crown,
  Zap,
  Clock,
  FileText,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  // Demo user data - completely standalone
  const demoUser = {
    id: 'demo-user-id',
    name: 'Demo User',
    email: 'demo@example.com',
    image: null,
    subscriptionStatus: 'free',
    subscriptionEndsAt: null,
    monthlyApiCalls: 25,
    monthlyStorageUsed: 50 * 1024 * 1024, // 50MB
    savedData: [
      {
        id: '1',
        toolType: 'json',
        name: 'API Response Format',
        updatedAt: new Date()
      },
      {
        id: '2',
        toolType: 'api',
        name: 'GitHub User Endpoint',
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: '3',
        toolType: 'base64',
        name: 'Auth Token Encoded',
        updatedAt: new Date(Date.now() - 172800000)
      }
    ],
    paymentHistory: []
  }

  const isProUser = demoUser.subscriptionStatus === 'pro' || demoUser.subscriptionStatus === 'enterprise'
  const FREE_PLAN_LIMITS = {
    apiCalls: 100,
    storage: 100 * 1024 * 1024 // 100MB
  }
  
  const apiCallsLimit = isProUser ? -1 : FREE_PLAN_LIMITS.apiCalls
  const storageLimit = isProUser ? (demoUser.subscriptionStatus === 'enterprise' ? 100 : 10) * 1024 * 1024 * 1024 : FREE_PLAN_LIMITS.storage
  const storageUsedGB = demoUser.monthlyStorageUsed / (1024 * 1024 * 1024)
  const storageLimitGB = storageLimit / (1024 * 1024 * 1024)

  const apiUsagePercentage = apiCallsLimit === -1 ? 0 : (demoUser.monthlyApiCalls / apiCallsLimit) * 100
  const storageUsagePercentage = (storageUsedGB / storageLimitGB) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to DevTools Platform Demo!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Explore all features without authentication
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            DEMO MODE
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <LogOut className="w-4 h-4 mr-2" />
              Exit Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* Usage Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoUser.monthlyApiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of {apiCallsLimit.toLocaleString()} limit
            </p>
            <Progress value={apiUsagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageUsedGB.toFixed(2)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              of {storageLimitGB.toFixed(0)} GB limit
            </p>
            <Progress value={storageUsagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">Free</div>
            <p className="text-xs text-muted-foreground">Demo account</p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/pricing">
                <Zap className="w-4 h-4 mr-1" />
                View Pricing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Demo saved data and tools usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoUser.savedData.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.toolType === 'json' ? 'bg-orange-500' :
                      item.toolType === 'api' ? 'bg-blue-500' :
                      item.toolType === 'base64' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.toolType} Tool
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Features
            </CardTitle>
            <CardDescription>
              Available tools and interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <h4 className="font-semibold text-sm">UI Mockups</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/compact-json-preview">Compact Tabs</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/split-json-preview">Split Screen</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/github-json-preview">GitHub Style</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/notion-json-preview">Notion Style</Link>
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <h4 className="font-semibold text-sm">Core Tools (Demo)</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/demo-tools/json-formatter">JSON Formatter</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/demo-tools/api-tester">API Tester</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/demo-tools/base64">Base64 Encoder</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Available Tools</CardTitle>
          <CardDescription>
            Explore all developer tools (some require sign-in for full functionality)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/demo-tools/json-formatter">
                <FileText className="h-6 w-6" />
                <span>JSON Formatter</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/demo-tools/api-tester">
                <Zap className="h-6 w-6" />
                <span>API Tester</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/demo-tools/base64">
                <Database className="h-6 w-6" />
                <span>Base64 Encoder</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/websocket-tester">
                <Activity className="h-6 w-6" />
                <span>WebSocket Tester</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/connection-string-builder">
                <Database className="h-6 w-6" />
                <span>DB Connection</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/sql-query-builder">
                <Database className="h-6 w-6" />
                <span>SQL Builder</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/pricing">
                <Crown className="h-6 w-6" />
                <span>Pricing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/auth/signin">
                <User className="h-6 w-6" />
                <span>Sign In</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}