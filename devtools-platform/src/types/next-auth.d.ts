import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionStatus?: string | null
      subscriptionEndsAt?: Date | null
      monthlyApiCalls?: number
      monthlyStorageUsed?: number
      lastResetDate?: Date
    }
  }

  interface User {
    id: string
    subscriptionStatus?: string | null
    subscriptionEndsAt?: Date | null
    monthlyApiCalls?: number
    monthlyStorageUsed?: number
    lastResetDate?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscriptionStatus?: string | null
    subscriptionEndsAt?: Date | null
    monthlyApiCalls?: number
    monthlyStorageUsed?: number
    lastResetDate?: Date
  }
}