import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '@shared/context/AuthContext'
import type { ReactNode } from 'react'

interface AdminProtectedRouteProps {
    children: ReactNode
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
    const { isAdminAuthenticated } = useAdminAuth()

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    return <>{children}</>
}
