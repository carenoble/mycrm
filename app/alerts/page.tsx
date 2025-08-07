'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Plus, Search, CheckCircle, AlertCircle, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Alert {
  id: string
  title: string
  description?: string
  type: string
  dueDate?: string
  isCompleted: boolean
  createdAt: string
  client?: {
    id: string
    name: string
    businessName: string
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, completed, overdue
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      toast.error('Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted })
      })

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === id 
            ? { ...alert, isCompleted: !isCompleted, completedAt: !isCompleted ? new Date().toISOString() : null }
            : alert
        ))
        toast.success(!isCompleted ? 'Alert marked as completed' : 'Alert reopened')
      }
    } catch (error) {
      toast.error('Failed to update alert')
    }
  }

  const deleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAlerts(alerts.filter(a => a.id !== id))
        toast.success('Alert deleted successfully')
      }
    } catch (error) {
      toast.error('Failed to delete alert')
    }
  }

  const getFilteredAlerts = () => {
    let filtered = alerts.filter(alert =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description && alert.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    switch (filter) {
      case 'pending':
        return filtered.filter(alert => !alert.isCompleted)
      case 'completed':
        return filtered.filter(alert => alert.isCompleted)
      case 'overdue':
        return filtered.filter(alert => 
          !alert.isCompleted && 
          alert.dueDate && 
          new Date(alert.dueDate) < new Date()
        )
      default:
        return filtered
    }
  }

  const getAlertIcon = (alert: Alert) => {
    if (alert.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    
    if (alert.dueDate && new Date(alert.dueDate) < new Date()) {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }

    return <Clock className="h-5 w-5 text-yellow-500" />
  }

  const getAlertStyle = (alert: Alert) => {
    if (alert.isCompleted) {
      return 'bg-green-50 border-green-200'
    }
    
    if (alert.dueDate && new Date(alert.dueDate) < new Date()) {
      return 'bg-red-50 border-red-200'
    }

    return 'bg-white border-gray-200'
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Alerts & To-dos</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Alert
          </button>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search alerts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Completed' },
                { key: 'overdue', label: 'Overdue' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filter === option.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : getFilteredAlerts().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No alerts found.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {getFilteredAlerts().map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getAlertStyle(alert)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleComplete(alert.id, alert.isCompleted)}
                        className="mt-0.5"
                      >
                        {getAlertIcon(alert)}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${alert.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {alert.title}
                        </h3>
                        
                        {alert.description && (
                          <p className={`text-sm mt-1 ${alert.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                            {alert.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {alert.dueDate && (
                            <span>
                              Due: {new Date(alert.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          
                          {alert.client && (
                            <span>
                              Client: {alert.client.businessName}
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full ${
                            alert.type === 'urgent' ? 'bg-red-100 text-red-700' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-gray-400 hover:text-red-500 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Alert Modal */}
        {showCreateForm && (
          <CreateAlertModal
            onClose={() => setShowCreateForm(false)}
            onSuccess={(newAlert) => {
              setAlerts([newAlert, ...alerts])
              setShowCreateForm(false)
              toast.success('Alert created successfully')
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function CreateAlertModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (alert: Alert) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'info',
    dueDate: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null
        })
      })

      if (response.ok) {
        const newAlert = await response.json()
        onSuccess(newAlert)
      } else {
        throw new Error('Failed to create alert')
      }
    } catch (error) {
      toast.error('Failed to create alert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Alert</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}