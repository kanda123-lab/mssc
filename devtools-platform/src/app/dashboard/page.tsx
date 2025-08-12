import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  // Demo user data since DB is not connected
  const user = {
    id: 'demo-user-id',
    name: session.user.name || 'Demo User',
    email: session.user.email,
    image: session.user.image,
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
      }
    ],
    paymentHistory: []
  }

  return <DashboardContent user={user} />
}