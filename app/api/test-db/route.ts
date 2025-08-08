import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || 'NOT SET'
  
  if (databaseUrl === 'NOT SET') {
    return NextResponse.json({
      error: 'DATABASE_URL environment variable is not set',
      configured: false
    })
  }

  let urlParts = {
    hasProtocol: false,
    protocol: '',
    configured: true
  }

  try {
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      urlParts.hasProtocol = true
      urlParts.protocol = databaseUrl.split('://')[0]
    } else if (databaseUrl.startsWith('file:')) {
      urlParts.hasProtocol = true
      urlParts.protocol = 'SQLite'
    }
  } catch (e) {
    console.error('Failed to parse DATABASE_URL')
  }

  let connectionResult = {
    success: false,
    error: null as string | null,
    message: ''
  }

  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    
    connectionResult.success = true
    connectionResult.message = 'Database connection successful'
  } catch (error) {
    connectionResult.success = false
    connectionResult.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const response = {
    configured: true,
    urlAnalysis: urlParts,
    connectionTest: connectionResult
  }

  return NextResponse.json(response)
}