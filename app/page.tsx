'use client'

/**
 * Annapurna-Connect Food Rescue Platform
 * Complete UI with Donor Dashboard, Admin Dashboard, and Agent Integration
 */

import { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FaUtensils,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaUsers,
  FaChartLine,
  FaPhoneAlt,
  FaSpinner,
  FaBroadcastTower,
  FaTruck
} from 'react-icons/fa'

// Agent IDs from workflow.json
const AGENT_IDS = {
  dispatcher: '69858719e17e33c11eed19ae',
  negotiator: '69858734b90162af337b1e95',
  coordinator: '69858750ab4bf65a66ad07a5',
  claimHandler: '6985876eab4bf65a66ad07a9',
  escalation: '69858790382ef8715224cf2b'
}

// TypeScript Interfaces from actual test responses
interface NGO {
  ngo_id: string
  ngo_name: string
  contact_number?: string
  distance_km: number
  latitude?: number
  longitude?: number
  notified?: boolean
}

interface Donation {
  id: string
  restaurantName: string
  latitude: number
  longitude: number
  mealCount: number
  foodType: string
  expiryTime: string
  status: 'Pending' | 'Broadcasting' | 'Claimed' | 'Expired' | 'Failed'
  ngoName?: string
  ngoContact?: string
  eta?: number
  ngosFound?: number
  nearestNgos?: NGO[]
  createdAt: string
  mapsUrl?: string
}

interface Activity {
  id: string
  type: 'Donation' | 'Claim' | 'Escalation'
  description: string
  timestamp: string
}

interface AdminNGO {
  id: string
  name: string
  phone: string
  location: string
  verified: boolean
  responseRate: number
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Broadcasting: 'bg-blue-100 text-blue-800 border-blue-300',
    Claimed: 'bg-green-100 text-green-800 border-green-300',
    Expired: 'bg-red-100 text-red-800 border-red-300',
    Failed: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.Pending}`}>
      {status}
    </span>
  )
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color = '#FF6B35'
}: {
  title: string
  value: string | number
  icon: any
  color?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <Icon className="text-4xl opacity-80" style={{ color }} />
        </div>
      </CardContent>
    </Card>
  )
}

// Donation Form Modal Component
function DonationFormModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    restaurantName: '',
    latitude: '',
    longitude: '',
    mealCount: '',
    foodType: 'Mixed',
    expiryTime: ''
  })
  const [gpsLoading, setGpsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleGPSDetect = () => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }))
          setGpsLoading(false)
        },
        () => {
          setGpsLoading(false)
          alert('GPS detection failed. Please enter manually.')
        }
      )
    } else {
      setGpsLoading(false)
      alert('Geolocation not supported by browser')
    }
  }

  const handleSubmit = async () => {
    if (!formData.restaurantName || !formData.latitude || !formData.longitude || !formData.mealCount || !formData.expiryTime) {
      alert('Please fill all required fields')
      return
    }
    setSubmitting(true)
    await onSubmit(formData)
    setSubmitting(false)
    setFormData({
      restaurantName: '',
      latitude: '',
      longitude: '',
      mealCount: '',
      foodType: 'Mixed',
      expiryTime: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Donate Food</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Restaurant/Venue Name *</label>
            <Input
              value={formData.restaurantName}
              onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
              placeholder="Enter venue name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GPS Location *</label>
            <div className="flex gap-2">
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="Latitude"
                className="flex-1"
              />
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="Longitude"
                className="flex-1"
              />
            </div>
            <Button
              onClick={handleGPSDetect}
              disabled={gpsLoading}
              variant="outline"
              className="w-full mt-2"
            >
              {gpsLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaMapMarkerAlt className="mr-2" />}
              Auto-Detect GPS
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meal Count *</label>
            <Input
              type="number"
              value={formData.mealCount}
              onChange={(e) => setFormData(prev => ({ ...prev, mealCount: e.target.value }))}
              placeholder="Number of meals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Type</label>
            <select
              value={formData.foodType}
              onChange={(e) => setFormData(prev => ({ ...prev, foodType: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Must Go By *</label>
            <Input
              type="datetime-local"
              value={formData.expiryTime}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryTime: e.target.value }))}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            style={{ backgroundColor: '#FF6B35' }}
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Broadcasting...
              </>
            ) : (
              <>
                <FaBroadcastTower className="mr-2" />
                Broadcast to NGOs
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Active Donation Status View Component
function ActiveDonationStatus({
  donation,
  onClose
}: {
  donation: Donation
  onClose: () => void
}) {
  const [currentDonation, setCurrentDonation] = useState(donation)

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/donations/${donation.id}`)
        if (response.ok) {
          const updated = await response.json()
          setCurrentDonation(updated)
        }
      } catch (error) {
        console.error('Failed to fetch donation updates:', error)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [donation.id])

  const getStatusStep = () => {
    const steps = ['Submitted', 'Broadcasting', 'Claimed/Escalating', 'Picked Up']
    const statusMap = {
      'Pending': 0,
      'Broadcasting': 1,
      'Claimed': 2,
      'Expired': 2,
      'Failed': 2
    }
    return statusMap[currentDonation.status] || 0
  }

  const currentStep = getStatusStep()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Donation Status - {currentDonation.id}</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Timeline */}
          <div>
            <h3 className="font-semibold mb-3">Status Timeline</h3>
            <div className="flex items-center justify-between">
              {['Submitted', 'Broadcasting', 'Claimed', 'Picked Up'].map((step, idx) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      idx <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}
                  >
                    {idx < currentStep ? <FaCheckCircle /> : idx + 1}
                  </div>
                  <p className="text-xs mt-1 text-center">{step}</p>
                  {idx < 3 && (
                    <div
                      className={`h-1 w-full mt-4 ${
                        idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ position: 'absolute', left: '50%', width: 'calc(100% / 4)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Donation Details */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Donation Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Restaurant:</span> {currentDonation.restaurantName}</div>
              <div><span className="font-medium">Meals:</span> {currentDonation.mealCount}</div>
              <div><span className="font-medium">Food Type:</span> {currentDonation.foodType}</div>
              <div><span className="font-medium">Status:</span> <StatusBadge status={currentDonation.status} /></div>
            </div>
          </div>

          {/* NGO Response Cards */}
          {currentDonation.nearestNgos && currentDonation.nearestNgos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Contacted NGOs ({currentDonation.ngosFound || 0})</h3>
              <div className="space-y-2">
                {currentDonation.nearestNgos.map((ngo) => (
                  <div key={ngo.ngo_id} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ngo.ngo_name}</p>
                      <p className="text-sm text-gray-600">{ngo.distance_km} km away</p>
                    </div>
                    {ngo.notified && (
                      <span className="text-green-600 text-sm font-medium">Notified</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claimed Info */}
          {currentDonation.status === 'Claimed' && currentDonation.ngoName && (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 text-xl mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800">Claimed by {currentDonation.ngoName}!</p>
                  {currentDonation.ngoContact && (
                    <p className="text-sm text-green-700 mt-1">
                      <FaPhoneAlt className="inline mr-1" />
                      {currentDonation.ngoContact}
                    </p>
                  )}
                  {currentDonation.eta && (
                    <p className="text-sm text-green-700">
                      <FaTruck className="inline mr-1" />
                      ETA: {currentDonation.eta} minutes
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Map */}
          {currentDonation.mapsUrl && (
            <div>
              <h3 className="font-semibold mb-2">Location Map</h3>
              <iframe
                src={`https://www.google.com/maps?q=${currentDonation.latitude},${currentDonation.longitude}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Donor Dashboard Component
function DonorDashboard({
  donations,
  onNewDonation
}: {
  donations: Donation[]
  onNewDonation: () => void
}) {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)

  const totalMeals = donations.reduce((sum, d) => sum + d.mealCount, 0)
  const activeDonations = donations.filter(d => d.status === 'Broadcasting' || d.status === 'Claimed').length
  const successRate = donations.length > 0
    ? Math.round((donations.filter(d => d.status === 'Claimed').length / donations.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Meals Donated" value={totalMeals} icon={FaUtensils} color="#FF6B35" />
        <MetricCard title="Active Donations" value={activeDonations} icon={FaClock} color="#2D5016" />
        <MetricCard title="Success Rate" value={`${successRate}%`} icon={FaChartLine} color="#FF6B35" />
      </div>

      {/* Recent Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Donations</CardTitle>
            <Button onClick={onNewDonation} style={{ backgroundColor: '#FF6B35' }}>
              <FaUtensils className="mr-2" />
              Donate Food
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaUtensils className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No donations yet. Start by donating food!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Restaurant</th>
                    <th className="text-left py-2 px-4">Meal Count</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">NGO</th>
                    <th className="text-left py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{donation.restaurantName}</td>
                      <td className="py-3 px-4">{donation.mealCount}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={donation.status} />
                      </td>
                      <td className="py-3 px-4">{donation.ngoName || '-'}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDonation(donation)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Donation Status Modal */}
      {selectedDonation && (
        <ActiveDonationStatus
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </div>
  )
}

// Admin Dashboard Component
function AdminDashboard({
  activities,
  ngos
}: {
  activities: Activity[]
  ngos: AdminNGO[]
}) {
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const todayDonations = activities.filter(a =>
    a.type === 'Donation' &&
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length

  const claimRate = activities.filter(a => a.type === 'Claim').length > 0
    ? Math.round((activities.filter(a => a.type === 'Claim').length / activities.filter(a => a.type === 'Donation').length) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Feed */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Live Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="border-l-4 border-orange-500 pl-3 py-2">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Daily Donations" value={todayDonations} icon={FaUtensils} color="#FF6B35" />
          <MetricCard title="Claim Rate" value={`${claimRate}%`} icon={FaCheckCircle} color="#2D5016" />
          <MetricCard title="Avg Response" value="8 min" icon={FaClock} color="#FF6B35" />
          <MetricCard title="Failed Matches" value="2" icon={FaExclamationTriangle} color="#dc2626" />
        </div>

        {/* NGO Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>NGO Management</CardTitle>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Phone</th>
                    <th className="text-left py-2 px-4">Location</th>
                    <th className="text-left py-2 px-4">Response Rate</th>
                    <th className="text-left py-2 px-4">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map((ngo) => (
                    <tr key={ngo.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{ngo.name}</td>
                      <td className="py-3 px-4 text-sm">{ngo.phone}</td>
                      <td className="py-3 px-4 text-sm">{ngo.location}</td>
                      <td className="py-3 px-4">{ngo.responseRate}%</td>
                      <td className="py-3 px-4">
                        {ngo.verified ? (
                          <FaCheckCircle className="text-green-600" />
                        ) : (
                          <FaClock className="text-yellow-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main App Component
export default function Home() {
  const [role, setRole] = useState<'donor' | 'admin'>('donor')
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [donations, setDonations] = useState<Donation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [ngos, setNGOs] = useState<AdminNGO[]>([])
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Load initial data
  useEffect(() => {
    loadDonations()
    loadActivities()
    loadNGOs()
  }, [])

  const loadDonations = async () => {
    try {
      const response = await fetch('/api/donations')
      if (response.ok) {
        const data = await response.json()
        setDonations(data)
      }
    } catch (error) {
      console.error('Failed to load donations:', error)
    }
  }

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
  }

  const loadNGOs = async () => {
    // Mock NGO data for now
    setNGOs([
      { id: '1', name: 'Helping Hands Foundation', phone: '+91-11-2543567', location: 'Delhi', verified: true, responseRate: 92 },
      { id: '2', name: 'Uplift Nutrition Mission', phone: '+91-11-4140121', location: 'Noida', verified: true, responseRate: 88 },
      { id: '3', name: 'Meals Outreach Trust', phone: '+91-11-4312370', location: 'Gurgaon', verified: true, responseRate: 85 }
    ])
  }

  const handleDonationSubmit = async (formData: any) => {
    try {
      // Create donation message for Food Rescue Coordinator
      const message = `Process new donation submission: Restaurant '${formData.restaurantName}', GPS: ${formData.latitude}, ${formData.longitude}, ${formData.mealCount} meals of ${formData.foodType} food, must go by ${formData.expiryTime}. Find nearest NGOs and broadcast alerts.`

      // Call Food Rescue Coordinator agent
      const result = await callAIAgent(message, AGENT_IDS.coordinator)

      if (result.success && result.response.status === 'success') {
        const agentResult = result.response.result

        // Create donation record
        const newDonation: Donation = {
          id: agentResult.donation_id || `DON-${Date.now()}`,
          restaurantName: formData.restaurantName,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          mealCount: parseInt(formData.mealCount),
          foodType: formData.foodType,
          expiryTime: formData.expiryTime,
          status: agentResult.donation_status === 'broadcasted' ? 'Broadcasting' : 'Pending',
          ngosFound: agentResult.ngos_found,
          nearestNgos: agentResult.nearest_ngos,
          createdAt: new Date().toISOString()
        }

        // Save to API
        const saveResponse = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDonation)
        })

        if (saveResponse.ok) {
          setDonations(prev => [newDonation, ...prev])
          setAlert({
            message: `Broadcasting to ${agentResult.ngos_found || 0} NGOs...`,
            type: 'success'
          })
          setShowDonationModal(false)

          // Create activity
          const activity: Activity = {
            id: `ACT-${Date.now()}`,
            type: 'Donation',
            description: `New donation from ${formData.restaurantName} - ${formData.mealCount} meals`,
            timestamp: new Date().toISOString()
          }
          setActivities(prev => [activity, ...prev])

          // Clear alert after 5 seconds
          setTimeout(() => setAlert(null), 5000)
        }
      } else {
        setAlert({
          message: 'Failed to broadcast donation. Please try again.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Donation submission error:', error)
      setAlert({
        message: 'Error submitting donation. Please try again.',
        type: 'error'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUtensils className="text-3xl" style={{ color: '#FF6B35' }} />
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#2D5016' }}>
                  Annapurna-Connect
                </h1>
                <p className="text-sm text-gray-600">Food Rescue Platform</p>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="flex gap-2">
              <Button
                onClick={() => setRole('donor')}
                variant={role === 'donor' ? 'default' : 'outline'}
                style={role === 'donor' ? { backgroundColor: '#FF6B35' } : {}}
              >
                Donor View
              </Button>
              <Button
                onClick={() => setRole('admin')}
                variant={role === 'admin' ? 'default' : 'outline'}
                style={role === 'admin' ? { backgroundColor: '#2D5016' } : {}}
              >
                Admin View
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Notification */}
      {alert && (
        <div className="container mx-auto px-4 mt-4">
          <div
            className={`${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            } border p-4 rounded-lg flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              {alert.type === 'success' ? (
                <FaCheckCircle className="text-xl" />
              ) : (
                <FaExclamationTriangle className="text-xl" />
              )}
              <span>{alert.message}</span>
            </div>
            <button onClick={() => setAlert(null)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {role === 'donor' ? (
          <DonorDashboard
            donations={donations}
            onNewDonation={() => setShowDonationModal(true)}
          />
        ) : (
          <AdminDashboard activities={activities} ngos={ngos} />
        )}
      </main>

      {/* Donation Form Modal */}
      <DonationFormModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSubmit={handleDonationSubmit}
      />
    </div>
  )
}
