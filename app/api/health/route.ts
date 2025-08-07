import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/prisma'

export async function GET() {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: {
      connected: false,
      url: process.env.DATABASE_URL ? 'configured' : 'not configured'
    },
    env: {
      jwtSecret: !!process.env.JWT_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  }

  try {
    // Check database connection
    healthStatus.database.connected = await isDatabaseAvailable()
  } catch (error) {
    healthStatus.database.connected = false
    console.error('Health check database error:', error)
  }

  // Return appropriate status code
  const httpStatus = healthStatus.database.connected ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}