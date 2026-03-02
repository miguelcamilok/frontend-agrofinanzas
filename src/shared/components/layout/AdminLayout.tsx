import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@shared/context/AuthContext'
import { useActiveRoute } from '@shared/hooks/useActiveRoute'
import { axiosClient } from '@shared/services/api/axiosClient'
import { useCallback } from 'react'
import './AdminLayout.css'

/**
 * Admin Layout — Replicates admin/layout.blade.php
 * Sidebar + topbar, no main navbar/footer.
 */
export function AdminLayout() {
    const { admin, adminLogout } = useAdminAuth()
    const { isActive } = useActiveRoute()
    const navigate = useNavigate()

    const handleLogout = useCallback(() => {
        axiosClient.post('/admin/logout')
            .catch(() => { /* silently fail */ })
            .finally(() => {
                adminLogout()
                navigate('/admin/login')
            })
    }, [adminLogout, navigate])

    const adminInitial = admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <h1>Agro<span>Finanzas</span></h1>
                    <p>Panel Admin</p>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">General</div>
                    <Link
                        to="/admin/dashboard"
                        className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    >
                        <i className="fas fa-chart-pie"></i> Dashboard
                    </Link>

                    <div className="nav-section-label">Gestión</div>
                    <Link
                        to="/admin/usuarios"
                        className={`nav-item ${isActive('/admin/usuarios') ? 'active' : ''}`}
                    >
                        <i className="fas fa-users"></i> Usuarios
                    </Link>
                    <Link
                        to="/admin/finanzas"
                        className={`nav-item ${isActive('/admin/finanzas') ? 'active' : ''}`}
                    >
                        <i className="fas fa-chart-line"></i> Finanzas
                    </Link>
                    <Link
                        to="/admin/comentarios"
                        className={`nav-item ${isActive('/admin/comentarios') ? 'active' : ''}`}
                    >
                        <i className="fas fa-comments"></i> Comentarios
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="admin-avatar">{adminInitial}</div>
                        <div>
                            <div className="admin-user__name">{admin?.name || 'Admin'}</div>
                            <div className="admin-user__role">Administrador</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-right-from-bracket"></i> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="topbar-title">Panel de <span>Administración</span></div>
                    <span className="topbar-badge"><i className="fas fa-shield-halved"></i> Modo Admin</span>
                </div>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
