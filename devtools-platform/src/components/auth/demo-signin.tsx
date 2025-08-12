'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Loader2 } from 'lucide-react'

export function DemoSignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [demoUser, setDemoUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com'
  })
  
  const callbackUrl = searchParams.get('from') ?? '/dashboard'

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    try {
      // Navigate to standalone demo page (no auth required)
      router.push('/demo')
    } catch (error) {
      console.error('Demo sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <User className="w-5 h-5" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Explore the platform without OAuth setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="demo-name">Demo Name</Label>
          <Input
            id="demo-name"
            value={demoUser.name}
            onChange={(e) => setDemoUser(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-email">Demo Email</Label>
          <Input
            id="demo-email"
            type="email"
            value={demoUser.email}
            onChange={(e) => setDemoUser(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email"
          />
        </div>
        <Button 
          onClick={handleDemoSignIn}
          disabled={isLoading || !demoUser.name || !demoUser.email}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Continue with Demo
            </>
          )}
        </Button>
        
        <div className="text-center text-sm text-gray-500">
          <p>This is a demo mode for testing purposes.</p>
          <p>No real authentication is performed.</p>
        </div>
      </CardContent>
    </Card>
  )
}