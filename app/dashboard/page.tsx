'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Users, UserCheck, Bell, FileText } from 'lucide-react'

interface DashboardStats {
  totalClients: number
  totalBuyers: number
  activeAlerts: number
  recentFiles: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalBuyers: 0,
    activeAlerts: 0,
    recentFiles: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Buyers',
      value: stats.totalBuyers,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: Bell,
      color: 'bg-yellow-500'
    },
    {
      title: 'Recent Files',
      value: stats.recentFiles,
      icon: FileText,
      color: 'bg-purple-500'
    }
  ]

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity to display.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Alerts</h2>
            <p className="text-gray-600">No upcoming alerts.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}