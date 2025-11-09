import axios from 'axios'

export const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'


let currentToken = null
export function setApiToken(t) { currentToken = t }

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${currentToken}`
  }
  return config
})

export function register(payload) {
  return api.post('/api/auth/register', payload).then(r => r.data)
}
export function login(payload) {
  return api.post('/api/auth/login', payload).then(r => r.data)
}

export function autoLogin(userId) {
  return api.post('/api/auth/auto-login', { userId }).then(r => r.data)
}

export function getUsers() { return api.get('/api/users').then(r => r.data) }
export function getCurrentUser() { return api.get('/api/users/me').then(r => r.data) }
export function getUserById(id) { return api.get(`/api/users/${id}`).then(r => r.data) }
export function updateCurrentUser(payload) { return api.put('/api/users/me', payload).then(r => r.data) }
export function deleteUser(id) { return api.delete(`/api/users/${id}`).then(r => r.data) }

export function getItems(params = {}) { return api.get('/api/items', { params }).then(r => r.data) }
export function getMyItems(params = {}) { return api.get('/api/items/my', { params }).then(r => r.data) }
export function getItemById(id) { return api.get(`/api/items/${id}`).then(r => r.data) }
export function createItem(payload) { return api.post('/api/items', payload).then(r => r.data) }
export function updateItem(id, payload) { return api.put(`/api/items/${id}`, payload).then(r => r.data) }
export function deleteItem(id) { return api.delete(`/api/items/${id}`).then(r => r.data) }
export function updateItemStatus(id, status) { return api.patch(`/api/items/${id}/status`, { status }).then(r => r.data) }

export function createReport(itemId, payload) { return api.post(`/api/items/${itemId}/report`, payload).then(r => r.data) }
export function getReports() { return api.get('/api/reports').then(r => r.data) }
export function listMyReports() { return api.get('/api/reports/my').then(r => r.data) }

export function createClaimRequest(itemId, message) {
  return api.post(`/api/items/${itemId}/claim-requests`, { message }).then(r => r.data)
}
export function listClaimRequestsForItem(itemId, params = {}) {
  return api.get(`/api/items/${itemId}/claim-requests`, { params }).then(r => r.data)
}
export function approveClaimRequest(itemId, requestId) {
  return api.post(`/api/items/${itemId}/claim-requests/${requestId}/approve`).then(r => r.data)
}
export function rejectClaimRequest(itemId, requestId) {
  return api.post(`/api/items/${itemId}/claim-requests/${requestId}/reject`).then(r => r.data)
}

export async function uploadImage(file, itemId = null) {
  const form = new FormData()
  form.append('file', file)
  const params = itemId ? { itemId } : {}
  const { data } = await api.post('/api/images/upload', form, { 
    headers: { 'Content-Type': 'multipart/form-data' },
    params
  })
  return data
}

export function imageUrl(filenameOrPathOrId) {
  if (!filenameOrPathOrId && filenameOrPathOrId !== 0) return ''
  const str = String(filenameOrPathOrId)
  if (str.startsWith('http')) return str
  if (/^\d+$/.test(str)) {
    return `${baseURL}/api/images/${str}`
  }
  return `${baseURL}${str.startsWith('/') ? '' : '/'}${str}`
}


