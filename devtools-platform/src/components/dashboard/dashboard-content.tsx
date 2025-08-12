'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  CreditCard, 
  Database, 
  Activity,
  Settings,
  LogOut,
  Crown,
  Zap,
  Clock,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { FREE_PLAN_LIMITS } from '@/lib/stripe'

interface DashboardUser {
  id: string
  name: string | null
  email: string
  image: string | null
  subscriptionStatus: string | null
  subscriptionEndsAt: Date | null
  monthlyApiCalls: number
  monthlyStorageUsed: number
  savedData: Array<{
    id: string
    toolType: string
    name: string
    updatedAt: Date
  }>
  paymentHistory: Array<{
    id: string
    amount: number
    status: string
    description: string | null
    createdAt: Date
  }>
}

interface DashboardContentProps {
  user: DashboardUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { data: session } = useSession()
  
  const isProUser = user.subscriptionStatus === 'pro' || user.subscriptionStatus === 'enterprise'
  const apiCallsLimit = isProUser ? -1 : FREE_PLAN_LIMITS.apiCalls
  const storageLimit = isProUser ? (user.subscriptionStatus === 'enterprise' ? 100 : 10) * 1024 * 1024 * 1024 : FREE_PLAN_LIMITS.storage
  const storageUsedGB = user.monthlyStorageUsed / (1024 * 1024 * 1024)
  const storageLimitGB = storageLimit / (1024 * 1024 * 1024)

  const apiUsagePercentage = apiCallsLimit === -1 ? 0 : (user.monthlyApiCalls / apiCallsLimit) * 100
  const storageUsagePercentage = (storageUsedGB / storageLimitGB) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your developer tools and subscription
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isProUser ? "default" : "secondary"} className="text-sm">
            {isProUser ? (
              <>
                <Crown className="w-4 h-4 mr-1" />
                {user.subscriptionStatus?.toUpperCase()}
              </>
            ) : (
              'FREE'
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Usage Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.monthlyApiCalls.toLocaleString()}</div>
            {apiCallsLimit !== -1 && (
              <>
                <p className="text-xs text-muted-foreground">
                  of {apiCallsLimit.toLocaleString()} limit
                </p>
                <Progress value={apiUsagePercentage} className="mt-2" />
              </>
            )}
            {apiCallsLimit === -1 && (
              <p className="text-xs text-muted-foreground">Unlimited</p>
            )}
          </CardContent>
        </Card>

        {/* Storage Usage */}
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

        {/* Subscription Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user.subscriptionStatus || 'Free'}
            </div>
            {user.subscriptionEndsAt && (
              <p className="text-xs text-muted-foreground">
                Renews {new Date(user.subscriptionEndsAt).toLocaleDateString()}
              </p>
            )}
            {!isProUser && (
              <Button asChild size="sm" className="mt-2">
                <Link href="/pricing">
                  <Zap className="w-4 h-4 mr-1" />
                  Upgrade
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your most recently used tools and saved data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.savedData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                user.savedData.map((item) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>
              Recent subscription and payment activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment history</p>
              ) : (
                user.paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        ${(payment.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={payment.status === 'succeeded' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {payment.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your most used developer tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/json-formatter">
                <FileText className="h-6 w-6" />
                <span>JSON Formatter</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/api-tester">
                <Zap className="h-6 w-6" />
                <span>API Tester</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/tools/base64">
                <Database className="h-6 w-6" />
                <span>Base64 Encoder</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
              <Link href="/pricing">
                <Settings className="h-6 w-6" />
                <span>Manage Subscription</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}