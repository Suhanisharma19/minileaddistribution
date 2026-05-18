'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { leadApi, userApi } from '@/lib/api'
import LeadTimeline, { LeadTimelineActivity } from '@/components/LeadTimeline'
import { ArrowLeft, Mail, Phone, Calendar, User, Building2, Tag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string

  const [lead, setLead] = useState<any>(null)
  const [activities, setActivities] = useState<LeadTimelineActivity[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    fetchLeadDetails()
    fetchAgents()
  }, [leadId])

  const fetchLeadDetails = async () => {
    try {
      setLoading(true)
      const response = await leadApi.getLeadById(leadId)
      if (response.success) {
        setLead(response.data)
        setActivities(response.data.activities || [])
        setNewStatus(response.data.status)
      }
    } catch (error) {
      console.error('Error fetching lead details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await userApi.getUsers({ role: 'AGENT' })
      if (response.success) {
        setAgents(response.data)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const handleAssignLead = async () => {
    if (!selectedAgent) return

    try {
      const response = await leadApi.assignLead(leadId, selectedAgent)
      if (response.success) {
        setShowAssignModal(false)
        setSelectedAgent('')
        fetchLeadDetails()
      }
    } catch (error) {
      console.error('Error assigning lead:', error)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) return

    try {
      const response = await leadApi.updateLead(leadId, { status: newStatus })
      if (response.success) {
        setShowStatusModal(false)
        fetchLeadDetails()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      NEW: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-yellow-100 text-yellow-800',
      CONVERTED: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons: any = {
      NEW: Clock,
      ASSIGNED: User,
      CONVERTED: CheckCircle,
      LOST: XCircle,
    }
    return icons[status] || AlertCircle
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(lead.status)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowAssignModal(true)}>
            <User className="w-4 h-4 mr-2" />
            Assign Agent
          </Button>
          <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Name</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{lead.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{lead.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{lead.phone || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Source</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{lead.source}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${lead.status === 'CONVERTED' ? 'text-green-600' : lead.status === 'LOST' ? 'text-red-600' : 'text-blue-600'}`} />
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Created At</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Assignment Information Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Assignment</h2>
            </CardHeader>
            <CardBody>
              {lead.assignedUser ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{lead.assignedUser.name}</div>
                      <div className="text-sm text-gray-500">{lead.assignedUser.email}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>This lead is not assigned to any agent</p>
                  <Button onClick={() => setShowAssignModal(true)} className="mt-4">
                    Assign Agent
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Activity Timeline Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Activity Timeline</h2>
            </CardHeader>
            <CardBody>
              <LeadTimeline activities={activities} />
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Activities</span>
                  <span className="text-lg font-semibold text-gray-900">{activities.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Days Since Creation</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Assignment Status</span>
                  <Badge className={lead.assignedUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {lead.assignedUser ? 'Assigned' : 'Unassigned'}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setShowAssignModal(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Reassign Lead
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => setShowStatusModal(true)}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this lead?')) {
                      leadApi.deleteLead(leadId).then(() => router.push('/dashboard/leads'))
                    }
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Delete Lead
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Assign Agent Modal */}
      <Card className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${showAssignModal ? '' : 'hidden'}`}>
        <CardBody className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Assign Lead to Agent</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 justify-end">
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignLead}>Assign</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Update Status Modal */}
      <Card className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${showStatusModal ? '' : 'hidden'}`}>
        <CardBody className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Lead Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <div className="flex gap-4 justify-end">
              <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
