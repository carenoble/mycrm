import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Handle Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: 'Unable to connect to the database. Please check your DATABASE_URL configuration.'
      },
      { status: 503 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}