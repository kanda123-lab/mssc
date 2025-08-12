import { getProviders } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignInForm } from '@/components/auth/signin-form'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  const providers = await getProviders()

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-6 h-6 bg-white rounded mr-2" />
          DevTools Platform
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform has saved me countless hours with its comprehensive developer tools and seamless integrations.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, Full Stack Developer</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <SignInForm providers={providers || {}} />
        </div>
      </div>
    </div>
  )
}