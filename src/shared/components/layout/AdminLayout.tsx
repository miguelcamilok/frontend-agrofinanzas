import { useState, useCallback } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@shared/context/AuthContext'
import { useActiveRoute } from '@shared/hooks/useActiveRoute'
import { axiosClient } from '@shared/services/api/axiosClient'
import './AdminLayout.css'

export function AdminLayout() {
    const { admin, adminLogout } = useAdminAuth()
    const { isActive } = useActiveRoute()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = useCallback(() => {
        axiosClient.post('/admin/logout')
            .catch(() => {})
            .finally(() => {
                adminLogout()
                navigate('/admin/login')
            })
    }, [adminLogout, navigate])

    const adminInitial = admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'
    const closeSidebar = () => setSidebarOpen(false)

    return (
        <div className="admin-shell">

            {/* ── Overlay móvil ── */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar-logo">
                    <h1>Agro<span>Finanzas</span></h1>
                    <p>Panel Admin</p>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">General</div>
                    <Link
                        to="/admin/dashboard"
                        className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <i className="fas fa-chart-pie"></i> Dashboard
                    </Link>

                    <div className="nav-section-label">Gestión</div>
                    <Link
                        to="/admin/usuarios"
                        className={`nav-item ${isActive('/admin/usuarios') ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <i className="fas fa-users"></i> Usuarios
                    </Link>
                    <Link
                        to="/admin/finanzas"
                        className={`nav-item ${isActive('/admin/finanzas') ? 'active' : ''}`}
                        onClick={closeSidebar}
                    >
                        <i className="fas fa-chart-line"></i> Finanzas
                    </Link>
                    <Link
                        to="/admin/comentarios"
                        className={`nav-item ${isActive('/admin/comentarios') ? 'active' : ''}`}
                        onClick={closeSidebar}
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

            {/* ── MAIN ── */}
            <main className="admin-main">
                <div className="admin-topbar">
                    {/* Hamburger — solo móvil */}
                    <button
                        className="topbar-hamburger"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Abrir menú"
                    >
                        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>

                    <div className="topbar-title">Panel de <span>Administración</span></div>
                    <span className="topbar-badge">
                        <i className="fas fa-shield-halved"></i>
                        <span className="badge-text">Modo Admin</span>
                    </span>
                </div>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}