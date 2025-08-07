import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to check if database is available
export async function isDatabaseAvailable(): Promise<{ connected: boolean; error?: string }> {
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