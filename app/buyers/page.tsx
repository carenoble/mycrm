'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Buyer {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  budget?: number
  requirements?: string
  status: string
  createdAt: string
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuyers()
  }, [])

  const fetchBuyers = async () => {
    try {
      const response = await fetch('/api/buyers')
      if (response.ok) {
        const data = await response.json()
        setBuyers(data)
      }
    } catch (error) {
      toast.error('Failed to fetch buyers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return

    try {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Buyer deleted successfully')
        setBuyers(buyers.filter(b => b.id !== id))
      } else {
        throw new Error('Failed to delete buyer')
      }
    } catch (error) {
      toast.error('Failed to delete buyer')
    }
  }

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.company && buyer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
          <Link
            href="/buyers/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Buyer
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search buyers..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredBuyers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No buyers found matching your search.' : 'No buyers yet. Add your first buyer!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-900">Name</th>
                    <th className="text-left p-4 font-medium text-gray-900">Company</th>
                    <th className="text-left p-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left p-4 font-medium text-gray-900">Budget</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyers.map((buyer) => (
                    <tr key={buyer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{buyer.name}</td>
                      <td className="p-4">{buyer.company || '-'}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          {buyer.email && <div>{buyer.email}</div>}
                          {buyer.phone && <div className="text-gray-600">{buyer.phone}</div>}
                        </div>
                      </td>
                      <td className="p-4">
                        {buyer.budget ? `£${buyer.budget.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          buyer.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {buyer.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/buyers/${buyer.id}`}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/buyers/${buyer.id}/edit`}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(buyer.id)}
                            className="p-1 text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}