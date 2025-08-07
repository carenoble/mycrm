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
    const files = await prisma.file.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const { url, filename, size } = await saveFile(file)

    const savedFile = await prisma.file.create({
      data: {
        filename,
        url,
        size,
        mimeType: file.type,
        userId: user.id
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(savedFile, { status: 201 })
  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}