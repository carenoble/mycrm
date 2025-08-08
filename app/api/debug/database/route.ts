import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (process.env.NODE_ENV === 'production' && 
      !process.env.ALLOW_DEBUG) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const databaseUrl = process.env.DATABASE_URL || ''
  
  let urlInfo = {
    hasUrl: !!databaseUrl,
    format: 'unknown',
    protocol: '',
    host: '',
    database: ''
  }

  if (databaseUrl) {
    try {
      if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
        urlInfo.format = 'postgresql'
      } else if (databaseUrl.startsWith('mysql://')) {
        urlInfo.format = 'mysql'
      } else if (databaseUrl.startsWith('mongodb://')) {
        urlInfo.format = 'mongodb'
      } else if (databaseUrl.startsWith('file:')) {
        urlInfo.format = 'sqlite'
      }

      const protocolMatch = databaseUrl.match(/^([^:]+):\/\//)
      if (protocolMatch) {
        urlInfo.protocol = protocolMatch[1]
      }

      const hostMatch = databaseUrl.match(/@([^\/]+)/)
      if (hostMatch) {
        urlInfo.host = hostMatch[1]
      }

      const dbMatch = databaseUrl.match(/\/([^?]+)(\?|$)/)
      if (dbMatch) {
        urlInfo.database = dbMatch[1]
      }
    } catch (e) {
      urlInfo.format = 'invalid'
    }
  }

  let connectionTest = {
    canConnect: false,
    error: null as string | null,
    tables: [] as string[]
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    connectionTest.canConnect = true

    if (urlInfo.format === 'postgresql') {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
      connectionTest.tables = tables.map(t => t.tablename)
    }
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