'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { 
  Edit, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Users,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  businessName: string
  businessType: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  status: string
  askingPrice?: number
  createdAt: string
  processes: any[]
  alerts: any[]
  images: any[]
  files: any[]
  clientBuyers: any[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [params.id])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      } else if (response.status === 404) {
        toast.error('Client not found')
        router.push('/clients')
      }
    } catch (error) {
      toast.error('Failed to fetch client details')
    } finally {
      setLoading(false)
    }
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

  if (!client) {
    return null
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/clients"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.businessName}</h1>
              <p className="text-gray-600">{client.name}</p>
            </div>
          </div>
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-5 w-5 mr-2" />
            Edit Client
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Client Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Business Type</p>
                  <p className="font-medium capitalize">{client.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
                {client.askingPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Asking Price</p>
                    <p className="font-medium">£{client.askingPrice.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {client.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Processes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Processes</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Add Process
                </button>
              </div>
              {client.processes.length === 0 ? (
                <p className="text-gray-500">No processes yet</p>
              ) : (
                <div className="space-y-2">
                  {client.processes.map((process) => (
                    <div key={process.id} className="border rounded p-3">
                      <p className="font-medium">{process.title}</p>
                      <p className="text-sm text-gray-600">{process.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Active Alerts</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Add Alert
                </button>
              </div>
              {client.alerts.length === 0 ? (
                <p className="text-gray-500">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {client.alerts.map((alert) => (
                    <div key={alert.id} className="border rounded p-3">
                      <p className="font-medium">{alert.title}</p>
                      {alert.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(alert.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <p className="text-gray-700">{client.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Interested Buyers</span>
                  </div>
                  <span className="font-medium">{client.clientBuyers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Images</span>
                  </div>
                  <span className="font-medium">{client.images.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Files</span>
                  </div>
                  <span className="font-medium">{client.files.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Active Alerts</span>
                  </div>
                  <span className="font-medium">{client.alerts.length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  Upload Images
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  Upload Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  Link Buyers
                </button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}