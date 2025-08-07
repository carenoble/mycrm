import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { saveFile } from '@/lib/fileUpload'

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
    const images = await prisma.image.findMany({
      where: { 
        client: {
          userId: user.id
        }
      },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json(images)
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Check file size (5MB limit for images)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // If clientId is provided, verify it belongs to the user
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: user.id
        }
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        )
      }
    }

    const { url, filename, size } = await saveFile(file)

    // Create a temporary client if none provided (for general uploads)
    let targetClientId = clientId
    if (!targetClientId) {
      // For now, we'll require a clientId. In production, you might want to allow general uploads
      return NextResponse.json(
        { error: 'Client ID is required for image uploads' },
        { status: 400 }
      )
    }

    const savedImage = await prisma.image.create({
      data: {
        filename,
        url,
        size,
        mimeType: file.type,
        clientId: targetClientId
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

    return NextResponse.json(savedImage, { status: 201 })
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}