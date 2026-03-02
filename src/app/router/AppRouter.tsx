import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes } from './routes.config'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { AuthLayout } from '@shared/components/layout/AuthLayout'
import { AdminLayout } from '@shared/components/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminProtectedRoute } from './AdminProtectedRoute'

function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'rgba(138,201,38,0.6)',
            fontSize: '0.9rem',
            fontFamily: 'Poppins, sans-serif',
        }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
            Cargando...
        </div>
    )
}

export function AppRouter() {
    const mainRoutes = routes.filter(r => r.layout === 'main')
    const authRoutes = routes.filter(r => r.layout === 'auth')
    const adminRoutes = routes.filter(r => r.layout === 'admin')

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* ── Main Layout routes ── */}
                <Route element={<MainLayout />}>
                    {mainRoutes.map(route => {
                        const Component = route.component
                        const element = route.protected ? (
                            <ProtectedRoute>
                                <Component />
                            </ProtectedRoute>
                        ) : (
                            <Component />
                        )

                        return (
                            <Route key={route.path} path={route.path} element={element} />
                        )
                    })}
                </Route>

                {/* ── Auth Layout routes (no navbar/footer) ── */}
                <Route element={<AuthLayout />}>
                    {authRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={<route.component />}
                        />
                    ))}
                </Route>

                {/* ── Admin Layout routes ── */}
                <Route element={<AdminLayout />}>
                    {adminRoutes.map(route => {
                        const Component = route.component
                        const element = route.adminProtected ? (
                            <AdminProtectedRoute>
                                <Component />
                            </AdminProtectedRoute>
                        ) : (
                            <Component />
                        )

                        return (
                            <Route key={route.path} path={route.path} element={element} />
                        )
                    })}
                </Route>
            </Routes>
        </Suspense>
    )
}
