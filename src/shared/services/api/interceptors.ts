import { axiosClient } from './axiosClient'

export function setupInterceptors(onUnauthorized: () => void): void {
    // ── Request interceptor: attach auth token ──
    axiosClient.interceptors.request.use(
        (config) => {
            const isAdminPath = config.url?.startsWith('/admin') || config.url?.startsWith('admin')
            const token = isAdminPath
                ? localStorage.getItem('admin_token')
                : localStorage.getItem('auth_token')

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => Promise.reject(error)
    )

    // ── Response interceptor: handle 401 globally ──
    axiosClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
                onUnauthorized()
            }
            return Promise.reject(error)
        }
    )
}
