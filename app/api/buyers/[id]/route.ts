import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { z } from 'zod'

const updateBuyerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  requirements: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
  notes: z.string().optional().nullable()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        clientBuyers: {
          include: {
            client: true
          }
        },
        files: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(buyer)
  } catch (error) {
    console.error('Get buyer error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch buyer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const data = updateBuyerSchema.parse(body)

    const buyer = await prisma.buyer.updateMany({
      where: {
        id: id,
        userId: user.id
      },
      data
    })

    if (buyer.count === 0) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    const updatedBuyer = await prisma.buyer.findUnique({
      where: { id: id }
    })

    return NextResponse.json(updatedBuyer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update buyer error:', error)
    return NextResponse.json(
      { error: 'Failed to update buyer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const buyer = await prisma.buyer.deleteMany({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (buyer.count === 0) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete buyer error:', error)
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 }
    )
  }
}