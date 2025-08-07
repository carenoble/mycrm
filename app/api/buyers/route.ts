import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const createBuyerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  requirements: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional().nullable()
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
    const buyers = await prisma.buyer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            clientBuyers: true,
            files: true
          }
        }
      }
    })

    return NextResponse.json(buyers)
  } catch (error) {
    console.error('Get buyers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buyers' },
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
    const data = createBuyerSchema.parse(body)

    const buyer = await prisma.buyer.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    return NextResponse.json(buyer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create buyer error:', error)
    return NextResponse.json(
      { error: 'Failed to create buyer' },
      { status: 500 }
    )
  }
}