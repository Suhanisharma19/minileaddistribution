'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardBody } from '@/components/Card'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { leadApi, userApi } from '@/lib/api'
import { Search, Plus, Filter, MoreVertical } from 'lucide-react'


export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createError, setCreateError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [selectedAgent, setSelectedAgent] = useState('')
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    autoAssign: false,
  })

  useEffect(() => {
    fetchLeads()
    fetchAgents()
  }, [searchTerm, statusFilter, sourceFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sourceFilter])

  const fetchLeads = async () => {
    try {
      const filters: any = {}
      if (statusFilter) filters.status = statusFilter
      if (sourceFilter) filters.source = sourceFilter

      const response = await leadApi.getLeads(filters)
      if (response.success) {
        let filteredLeads = response.data
        if (searchTerm) {
          filteredLeads = filteredLeads.filter((lead: any) =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        setLeads(filteredLeads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
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
    if (!selectedLead || !selectedAgent) return

    try {
      const response = await leadApi.assignLead(selectedLead.id, selectedAgent)
      if (response.success) {
        setShowAssignModal(false)
        setSelectedLead(null)
        setSelectedAgent('')
        fetchLeads()
      }
    } catch (error) {
      console.error('Error assigning lead:', error)
    }
  }

  const handleCreateLead = async () => {
    setCreateError('')
    try {
      const response = await leadApi.createLead(newLead)
      if (response.success) {
        setShowCreateModal(false)
        setNewLead({
          name: '',
          email: '',
          phone: '',
          source: 'WEBSITE',
          autoAssign: false,
        })
        fetchLeads()
      }
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create lead')
      console.error('Error creating lead:', error)
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    try {
      const response = await leadApi.deleteLead(id)
      if (response.success) {
        fetchLeads()
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
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

  const totalPages = Math.ceil(leads.length / itemsPerPage)
  const paginatedLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="ADS">Ads</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.assignedUser?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                        >
                          View Details
                        </Button>


                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found</p>
            </div>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, leads.length)} of {leads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Lead">
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
                  {agent.name}
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
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Lead">
        <div className="space-y-4">
          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {createError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="ADS">Ads</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="EMAIL_CAMPAIGN">Email Campaign</option>
              <option value="COLD_CALL">Cold Call</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoAssign"
              checked={newLead.autoAssign}
              onChange={(e) => setNewLead({ ...newLead, autoAssign: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="autoAssign" className="text-sm text-gray-700">
              Auto-assign to available agent
            </label>
          </div>
          <div className="flex gap-4 justify-end">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead}>Create Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
