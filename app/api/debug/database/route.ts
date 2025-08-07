import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Only allow in development or with a special header
  if (process.env.NODE_ENV === 'production' && 
      !process.env.ALLOW_DEBUG) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const databaseUrl = process.env.DATABASE_URL || ''
  
  // Parse the database URL to check its format (without exposing password)
  let urlInfo = {
    hasUrl: !!databaseUrl,
    format: 'unknown',
    protocol: '',
    host: '',
    database: '',
    sslMode: ''
  }

  if (databaseUrl) {
    try {
      // Check if it's a Supabase pooler URL
      if (databaseUrl.includes('pooler.supabase.com')) {
        urlInfo.format = 'supabase-pooler'
        urlInfo.sslMode = databaseUrl.includes('sslmode=require') ? 'require' : 'not-set'
      } else if (databaseUrl.includes('supabase.co')) {
        urlInfo.format = 'supabase-direct'
        urlInfo.sslMode = databaseUrl.includes('sslmode=require') ? 'require' : 'not-set'
      } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
        urlInfo.format = 'postgresql'
      }

      // Extract protocol
      const protocolMatch = databaseUrl.match(/^([^:]+):\/\//)
      if (protocolMatch) {
        urlInfo.protocol = protocolMatch[1]
      }

      // Extract host (without password)
      const hostMatch = databaseUrl.match(/@([^\/]+)/)
      if (hostMatch) {
        urlInfo.host = hostMatch[1]
      }

      // Extract database name
      const dbMatch = databaseUrl.match(/\/([^?]+)(\?|$)/)
      if (dbMatch) {
        urlInfo.database = dbMatch[1]
      }
    } catch (e) {
      urlInfo.format = 'invalid'
    }
  }

  // Try to connect and get more details
  let connectionTest = {
    canConnect: false,
    error: null as string | null,
    tables: [] as string[]
  }

  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`
    connectionTest.canConnect = true

    // Get list of tables
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    connectionTest.tables = tables.map(t => t.tablename)
  } catch (error) {
    connectionTest.canConnect = false
    connectionTest.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json({
    urlInfo,
    connectionTest,
    prismaStatus: {
      clientExists: !!prisma,
      nodeEnv: process.env.NODE_ENV
    }
  })
}