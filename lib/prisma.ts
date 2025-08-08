import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// During build time, use a dummy URL if DATABASE_URL is not set
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  
  // For build time only - this won't be used at runtime
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using dummy URL for build')
    return 'postgresql://user:password@localhost:5432/db?schema=public'
  }
  
  return process.env.DATABASE_URL || 'file:./dev.db'
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to check if database is available
export async function isDatabaseAvailable(): Promise<{ connected: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return { connected: false, error: 'DATABASE_URL not configured' }
  }
  
  if (!prisma) return { connected: false, error: 'Prisma client not initialized' }
  
  try {
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error('Database connection failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, error: errorMessage }
  }
}