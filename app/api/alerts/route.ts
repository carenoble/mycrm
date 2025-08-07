import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const createAlertSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.enum(['info', 'warning', 'urgent']).default('info'),
  dueDate: z.string().optional().nullable(),
  clientId: z.string().optional().nullable()
})

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      orderBy: [
        { isCompleted: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      }
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const user = await getUserFromToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const data = createAlertSchema.parse(body)

    const alert = await prisma.alert.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: user.id
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        }
      }
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}