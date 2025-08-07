import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling
let prismaClient: PrismaClient | null = null

try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error)
  prismaClient = null
}

export const prisma = prismaClient!

// Helper function to check if database is available
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!prismaClient) return false
  
  try {
    await prismaClient.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}