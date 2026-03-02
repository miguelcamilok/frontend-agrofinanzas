import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@shared/types/auth.types'

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('auth_user')
        return stored ? JSON.parse(stored) as User : null
    })

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('auth_token')
    })

    const isAuthenticated = !!token && !!user

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('auth_user', JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setToken(null)
        setUser(null)
    }, [])

    const updateUser = useCallback((updatedUser: User) => {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// ── Admin auth (separate session) ──
interface AdminAuthContextType {
    admin: { id: number; name: string; email: string } | null
    adminToken: string | null
    isAdminAuthenticated: boolean
    adminLogin: (token: string, admin: { id: number; name: string; email: string }) => void
    adminLogout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<{ id: number; name: string; email: string } | null>(() => {
        const stored = localStorage.getItem('admin_user')
        return stored ? JSON.parse(stored) as { id: number; name: string; email: string } : null
    })

    const [adminToken, setAdminToken] = useState<string | null>(() => {
        return localStorage.getItem('admin_token')
    })

    const isAdminAuthenticated = !!adminToken && !!admin

    const adminLogin = useCallback((newToken: string, newAdmin: { id: number; name: string; email: string }) => {
        localStorage.setItem('admin_token', newToken)
        localStorage.setItem('admin_user', JSON.stringify(newAdmin))
        setAdminToken(newToken)
        setAdmin(newAdmin)
    }, [])

    const adminLogout = useCallback(() => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        setAdminToken(null)
        setAdmin(null)
    }, [])

    return (
        <AdminAuthContext.Provider value={{ admin, adminToken, isAdminAuthenticated, adminLogin, adminLogout }}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth(): AdminAuthContextType {
    const context = useContext(AdminAuthContext)
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider')
    }
    return context
}
