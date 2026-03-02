import axios from 'axios'

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_URL_SERVER_API,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Request interceptor to add token
axiosClient.interceptors.request.use(config => {
    // Check if it's an admin route
    const isAdminRoute = config.url?.startsWith('/admin')
    const token = isAdminRoute ? localStorage.getItem('admin_token') : localStorage.getItem('auth_token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor to handle 401 Unauthorized
axiosClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            const isAdminRoute = window.location.pathname.startsWith('/admin')

            if (isAdminRoute) {
                // Admin token is invalid or expired
                localStorage.removeItem('admin_token')
                localStorage.removeItem('admin_user')

                if (window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login'
                }
            } else {
                // User token is invalid or expired
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')

                // Only redirect if not already on the login page
                if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/registro') {
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(error)
    }
)
