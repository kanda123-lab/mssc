'use client'

import { useState } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

interface SignInFormProps {
  providers: Record<string, Provider>
}

export function SignInForm({ providers }: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  
  const callbackUrl = searchParams.get('from') ?? '/dashboard'
  const error = searchParams.get('error')

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId)
    try {
      await signIn(providerId, { 
        callbackUrl,
        redirect: false 
      })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to DevTools
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred authentication method
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error === 'OAuthSignin' && 'Error occurred during sign in.'}
                {error === 'OAuthCallback' && 'Error occurred during callback.'}
                {error === 'OAuthCreateAccount' && 'Error creating account.'}
                {error === 'EmailCreateAccount' && 'Error creating email account.'}
                {error === 'Callback' && 'Error in callback handler.'}
                {error === 'OAuthAccountNotLinked' && 
                  'Account not linked. Please sign in with the same provider you used initially.'}
                {error === 'SessionRequired' && 'Please sign in to access this page.'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          {providers && Object.values(providers).map((provider) => {
            if (provider.id === 'email') return null
            
            return (
              <Button
                key={provider.id}
                variant="outline"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleSignIn(provider.id)}
                className="relative"
              >
                {isLoading === provider.id ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : provider.id === 'google' ? (
                  <Icons.google className="mr-2 h-4 w-4" />
                ) : provider.id === 'github' ? (
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                ) : null}
                Continue with {provider.name}
              </Button>
            )
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Secure authentication
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to try without signing up?
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/demo">
                🚀 Try Demo Mode
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}