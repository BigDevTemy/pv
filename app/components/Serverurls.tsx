import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:8090/api', // Replace with your actual server URL
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
      // Redirect to login or something
    }
    return Promise.reject(error)
  }
)

export default api

export const LOGIN = '/collections/users/auth-with-password'
