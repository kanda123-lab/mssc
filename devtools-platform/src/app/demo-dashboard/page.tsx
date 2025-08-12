'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function DemoDashboardPage() {
  const router = useRouter()
  const [demoUser, setDemoUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('demo-user')
    if (!storedUser) {
      router.push('/auth/signin')
      return
    }

    const userData = JSON.parse(storedUser)
    
    // Create demo user data
    const user = {
      id: 'demo-user-id',
      name: userData.name || 'Demo User',
      email: userData.email || 'demo@example.com',
      image: null,
      subscriptionStatus: 'free',
      subscriptionEndsAt: null,
      monthlyApiCalls: 25,
      monthlyStorageUsed: BigInt(50 * 1024 * 1024), // 50MB
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
      paymentHistory: [
        {
          id: '1',
          amount: 999,
          status: 'succeeded',
          description: 'Pro subscription',
          createdAt: new Date(Date.now() - 2592000000) // 30 days ago
        }
      ]
    }

    setDemoUser(user)
  }, [router])

  if (!demoUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <DashboardContent user={demoUser} />
}