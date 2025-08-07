import { NextResponse } from 'next/server'
import { isDatabaseAvailable } from '@/lib/prisma'

export async function GET() {
  const healthStatus: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: {
      connected: false,
      provider: 'postgresql',
      url: process.env.DATABASE_URL ? 'configured' : 'not configured',
      error: null
    },
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'
    },
    env: {
      jwtSecret: !!process.env.JWT_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  }

  try {
    // Check database connection
    const dbCheck = await isDatabaseAvailable()
    healthStatus.database.connected = dbCheck.connected
    if (!dbCheck.connected && dbCheck.error) {
      healthStatus.database.error = dbCheck.error
    }
  } catch (error) {
    healthStatus.database.connected = false
    healthStatus.database.error = error instanceof Error ? error.message : 'Unknown error'
    console.error('Health check database error:', error)
  }

  // Return appropriate status code
  const httpStatus = healthStatus.database.connected ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}