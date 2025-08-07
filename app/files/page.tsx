'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Upload, FileText, Image as ImageIcon, Download, Share, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileItem {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  shareableLink?: string
  isPublic: boolean
  createdAt: string
  client?: {
    id: string
    name: string
    businessName: string
  }
  buyer?: {
    id: string
    name: string
  }
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [images, setImages] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('files')

  useEffect(() => {
    fetchFiles()
    fetchImages()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      toast.error('Failed to fetch files')
    }
  }

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images')
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      toast.error('Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const isImage = file.type.startsWith('image/')
      const endpoint = isImage ? '/api/images' : '/api/files'

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newFile = await response.json()
        if (isImage) {
          setImages([newFile, ...images])
        } else {
          setFiles([newFile, ...files])
        }
        toast.success(`${isImage ? 'Image' : 'File'} uploaded successfully`)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const generateShareableLink = async (id: string, isImage: boolean) => {
    try {
      const endpoint = isImage ? `/api/images/${id}/share` : `/api/files/${id}/share`
      const response = await fetch(endpoint, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (isImage) {
          setImages(images.map(img => 
            img.id === id ? { ...img, shareableLink: data.shareableLink, isPublic: true } : img
          ))
        } else {
          setFiles(files.map(file => 
            file.id === id ? { ...file, shareableLink: data.shareableLink, isPublic: true } : file
          ))
        }
        
        navigator.clipboard.writeText(data.shareableLink)
        toast.success('Shareable link copied to clipboard')
      }
    } catch (error) {
      toast.error('Failed to generate shareable link')
    }
  }

  const deleteFile = async (id: string, isImage: boolean) => {
    if (!confirm(`Are you sure you want to delete this ${isImage ? 'image' : 'file'}?`)) return

    try {
      const endpoint = isImage ? `/api/images/${id}` : `/api/files/${id}`
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (isImage) {
          setImages(images.filter(img => img.id !== id))
        } else {
          setFiles(files.filter(file => file.id !== id))
        }
        toast.success(`${isImage ? 'Image' : 'File'} deleted successfully`)
      }
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-green-500" />
    }
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Files & Images</h1>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Files ({files.length})
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'images'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Images ({images.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'files' ? (
              files.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No files uploaded yet. Upload your first file!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        {getFileIcon(file.mimeType)}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => generateShareableLink(file.id, false)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title="Generate shareable link"
                          >
                            <Share className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id, false)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">
                        {file.filename}
                      </h3>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                      
                      {file.client && (
                        <p className="text-xs text-blue-600 mb-2">
                          Client: {file.client.businessName}
                        </p>
                      )}
                      
                      {file.shareableLink && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">Public</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.shareableLink!)
                              toast.success('Link copied!')
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            Copy Link
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No images uploaded yet. Upload your first image!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button
                            onClick={() => window.open(image.url, '_blank')}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="View full size"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => generateShareableLink(image.id, true)}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="Generate shareable link"
                          >
                            <Share className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(image.id, true)}
                            className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
                            title="Delete image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">
                          {image.filename}
                        </h3>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {formatFileSize(image.size)} • {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                        
                        {image.client && (
                          <p className="text-xs text-blue-600 mb-2">
                            Client: {image.client.businessName}
                          </p>
                        )}
                        
                        {image.shareableLink && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600">Public</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(image.shareableLink!)
                                toast.success('Link copied!')
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}