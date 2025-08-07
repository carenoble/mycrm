import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || 'NOT SET'
  
  // Check if DATABASE_URL is set
  if (databaseUrl === 'NOT SET') {
    return NextResponse.json({
      error: 'DATABASE_URL environment variable is not set',
      configured: false
    })
  }

  // Parse the URL to check format (hide sensitive parts)
  let urlParts = {
    hasProtocol: false,
    hasHost: false,
    hasPort: false,
    hasDatabase: false,
    hasPooler: false,
    hasPgBouncer: false,
    protocol: '',
    host: '',
    port: '',
    issues: [] as string[]
  }

  try {
    // Check protocol
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      urlParts.hasProtocol = true
      urlParts.protocol = databaseUrl.split('://')[0]
    } else {
      urlParts.issues.push('URL should start with postgresql:// or postgres://')
    }

    // Check for pooler host
    if (databaseUrl.includes('pooler.supabase.com')) {
      urlParts.hasPooler = true
      urlParts.host = 'pooler.supabase.com'
    } else if (databaseUrl.includes('supabase.co')) {
      urlParts.host = 'supabase.co (direct - should use pooler)'
      urlParts.issues.push('Using direct connection instead of pooler. Use the Transaction pooler URL from Supabase.')
    }

    // Check port
    if (databaseUrl.includes(':6543')) {
      urlParts.hasPort = true
      urlParts.port = '6543 (pooler)'
    } else if (databaseUrl.includes(':5432')) {
      urlParts.port = '5432 (direct)'
      urlParts.issues.push('Using port 5432 (direct). Should use port 6543 (pooler) for Netlify.')
    }

    // Check for pgbouncer parameter
    if (databaseUrl.includes('pgbouncer=true')) {
      urlParts.hasPgBouncer = true
    } else {
      urlParts.issues.push('Missing ?pgbouncer=true parameter')
    }

    // Check for connection_limit
    if (!databaseUrl.includes('connection_limit=1')) {
      urlParts.issues.push('Missing connection_limit=1 parameter')
    }

    // Extract database name
    const dbMatch = databaseUrl.match(/\/([^?]+)(\?|$)/)
    if (dbMatch) {
      urlParts.hasDatabase = true
    }

  } catch (e) {
    urlParts.issues.push('Failed to parse DATABASE_URL')
  }

  // Try actual connection with Prisma
  let connectionResult = {
    success: false,
    error: null as string | null
  }

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    
    connectionResult.success = true
  } catch (error) {
    connectionResult.success = false
    connectionResult.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Prepare response
  const response = {
    configured: true,
    urlAnalysis: urlParts,
    connectionTest: connectionResult,
    recommendations: [] as string[]
  }

  // Add recommendations based on issues
  if (urlParts.issues.length > 0) {
    response.recommendations.push('Fix these DATABASE_URL issues:')
    response.recommendations.push(...urlParts.issues)
  }

  if (!connectionResult.success) {
    response.recommendations.push('Connection failed. Ensure your Supabase password is correct and URL-encoded if it contains special characters.')
  }

  // Correct format example
  if (urlParts.issues.length > 0) {
    response.recommendations.push('')
    response.recommendations.push('Correct DATABASE_URL format:')
    response.recommendations.push('postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1')
  }

  return NextResponse.json(response)
}