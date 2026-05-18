const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const api = {
  get: async (endpoint: string) => {
    const token = getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, { headers })
    return response.json()
  },

  post: async (endpoint: string, data: any) => {
    const token = getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || result.message || 'Request failed')
    }
    return result
  },

  put: async (endpoint: string, data: any) => {
    const token = getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
    return response.json()
  },

  delete: async (endpoint: string) => {
    const token = getToken()
    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })
    return response.json()
  },
}

export const authApi = {
  login: async (email: string, password: string) => {
    return api.post('/api/auth/login', { email, password })
  },
  register: async (email: string, password: string, name: string, role?: string) => {
    return api.post('/api/auth/register', { email, password, name, role })
  },
  getMe: async () => {
    return api.get('/api/auth/me')
  },
}

export const leadApi = {
  getLeads: async (filters?: { status?: string; assignedTo?: string; source?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
    if (filters?.source) params.append('source', filters.source)
    const query = params.toString()
    return api.get(`/api/leads${query ? `?${query}` : ''}`)
  },
  getLeadById: async (id: string) => {
    return api.get(`/api/leads/${id}`)
  },
  createLead: async (data: {
    name: string
    email: string
    phone: string
    source: string
    status?: string
    assignedTo?: string
    autoAssign?: boolean
  }) => {
    return api.post('/api/leads', data)
  },
  updateLead: async (id: string, data: any) => {
    return api.put(`/api/leads/${id}`, data)
  },
  deleteLead: async (id: string) => {
    return api.delete(`/api/leads/${id}`)
  },
  assignLead: async (id: string, assignedTo: string) => {
    return api.post(`/api/leads/${id}/assign`, { assignedTo })
  },
}

export const analyticsApi = {
  getDashboardAnalytics: async () => {
    return api.get('/api/analytics')
  },
}

export const userApi = {
  getUsers: async (filters?: { role?: string }) => {
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    const query = params.toString()
    return api.get(`/api/users${query ? `?${query}` : ''}`)
  },
  getUserById: async (id: string) => {
    return api.get(`/api/users/${id}`)
  },
  updateUser: async (id: string, data: any) => {
    return api.put(`/api/users/${id}`, data)
  },
  deleteUser: async (id: string) => {
    return api.delete(`/api/users/${id}`)
  },
}

export const notificationApi = {
  getNotifications: async (unreadOnly = false) => {
    const params = new URLSearchParams()
    if (unreadOnly) params.append('unreadOnly', 'true')
    const query = params.toString()
    return api.get(`/api/notifications${query ? `?${query}` : ''}`)
  },
  getUnreadCount: async () => {
    return api.get('/api/notifications/unread-count')
  },
  markAsRead: async (id: string) => {
    return api.put(`/api/notifications/${id}/read`, {})
  },
  markAllAsRead: async () => {
    return api.put('/api/notifications/mark-all-read', {})
  },
}
