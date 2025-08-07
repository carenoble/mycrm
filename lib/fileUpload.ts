import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

export async function saveFile(file: File): Promise<{ url: string; filename: string; size: number }> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  try {
    await mkdir(uploadsDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()
  const uniqueFilename = `${nanoid()}.${fileExtension}`
  const filePath = join(uploadsDir, uniqueFilename)

  // Save file
  await writeFile(filePath, buffer)

  return {
    url: `/uploads/${uniqueFilename}`,
    filename: file.name,
    size: file.size
  }
}

export function generateShareableLink(fileId: string): string {
  const token = nanoid(32)
  return `${process.env.NEXTAUTH_URL}/share/${token}`
}