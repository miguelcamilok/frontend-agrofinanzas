import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, AdminAuthProvider } from '@shared/context/AuthContext'

interface AppProvidersProps {
    children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AdminAuthProvider>
                    {children}
                </AdminAuthProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
