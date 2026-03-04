import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { useActiveRoute } from '@shared/hooks/useActiveRoute'
import { axiosClient } from '@shared/services/api/axiosClient'
import { timeAgoEs } from '@shared/utils/timeAgo'
import type { Notification, NotificationsResponse } from '@shared/types/api.types'
import './Navbar.css'

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const { isActive, isExact, pathname } = useActiveRoute()
    const navigate = useNavigate()

    // ── State ──
    const [agronomyOpen, setAgronomyOpen] = useState(false)
    const [financeOpen, setFinanceOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    // ── Refs ──
    const profileMenuRef = useRef<HTMLDivElement>(null)
    const profileBtnRef = useRef<HTMLDivElement>(null)

    const userPhoto = user?.profile_photo || '/img/profile.png'
    const userName = user?.name || ''

    // ── Close all menus ──
    const closeAllMenus = useCallback(() => {
        setAgronomyOpen(false)
        setFinanceOpen(false)
        setProfileOpen(false)
    }, [])

    // ── Toggle handlers ──
    const toggleAgronomyMenu = () => {
        const wasOpen = agronomyOpen
        closeAllMenus()
        if (!wasOpen) setAgronomyOpen(true)
    }

    const toggleFinanceMenu = () => {
        const wasOpen = financeOpen
        closeAllMenus()
        if (!wasOpen) setFinanceOpen(true)
    }

    const toggleProfileMenu = () => {
        const wasOpen = profileOpen
        closeAllMenus()
        if (!wasOpen) {
            setProfileOpen(true)
            loadNotifications()
        }
    }

    const toggleDrawer = () => {
        const newState = !drawerOpen
        setDrawerOpen(newState)
        document.body.style.overflow = newState ? 'hidden' : ''
        closeAllMenus()
    }

    // ── Notifications ──
    const checkUnreadCount = useCallback(() => {
        axiosClient.get<{ unread_count: number }>('/notificaciones/no-leidas')
            .then(r => setUnreadCount(r.data.unread_count))
            .catch(() => { /* silently fail */ })
    }, [])

    const loadNotifications = useCallback(() => {
        axiosClient.get<NotificationsResponse>('/notificaciones')
            .then(r => {
                setUnreadCount(r.data.unread_count)
                setNotifications(r.data.notifications)
            })
            .catch(() => { /* silently fail */ })
    }, [])

    const markRead = useCallback((id: number) => {
        axiosClient.post(`/notificaciones/${id}/leer`)
            .then(() => {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                )
                checkUnreadCount()
            })
            .catch(err => console.error('markRead:', err))
    }, [checkUnreadCount])

    const markAllRead = useCallback(() => {
        axiosClient.post('/notificaciones/leer-todas')
            .then(() => {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                setUnreadCount(0)
            })
            .catch(err => console.error('markAllRead:', err))
    }, [])

    // ── Logout ──
    const handleLogout = useCallback(() => {
        axiosClient.post('/logout')
            .catch(() => { /* silently fail */ })
            .finally(() => {
                logout()
                navigate('/login')
            })
    }, [logout, navigate])

    // ── Polling notifications ──
    useEffect(() => {
        if (!isAuthenticated) return
        checkUnreadCount()
        const interval = setInterval(checkUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [isAuthenticated, checkUnreadCount])

    // ── Click outside to close menus ──
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            // Close dropdown menus
            const navLinks = document.querySelectorAll('.af-dropdown > .af-nav-link')
            let insideNav = false
            navLinks.forEach(l => { if (l.contains(target)) insideNav = true })
            if (!insideNav) {
                setAgronomyOpen(false)
                setFinanceOpen(false)
            }
            // Close profile menu
            if (profileMenuRef.current && profileBtnRef.current) {
                if (!profileMenuRef.current.contains(target) && !profileBtnRef.current.contains(target)) {
                    setProfileOpen(false)
                }
            }
            // Close drawer on outside click
            const drawer = document.getElementById('afMobileDrawer')
            const ham = document.getElementById('afHamburger')
            if (drawer?.classList.contains('open') && !drawer.contains(target) && !ham?.contains(target)) {
                setDrawerOpen(false)
                document.body.style.overflow = ''
            }
        }
        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [])

    // ── Resize: close drawer when going to desktop ──
    useEffect(() => {
        const handler = () => {
            if (window.innerWidth > 900 && drawerOpen) {
                setDrawerOpen(false)
                document.body.style.overflow = ''
            }
        }
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [drawerOpen])

    // ── Close drawer on route change ──
    useEffect(() => {
        setDrawerOpen(false)
        document.body.style.overflow = ''
        closeAllMenus()
    }, [pathname, closeAllMenus])

    const logoRoute = isAuthenticated ? '/inicio' : '/'

    // ── Active class helpers ──
    const agronomyActive = isActive('agronomy') || isActive('hens') || isActive('cattles') || isActive('avocado') || isActive('coffe')
    const financeActive = isActive('finance') || isActive('income') || isActive('expense') || isActive('investment') || isActive('debt') || isActive('inventory') || isActive('costs') || isActive('client/hato')

    return (
        <>
            {/* ═══ NAVBAR DESKTOP ═══ */}
            <nav className="af-navbar-container">
                {/* Brand */}
                <div className="af-logo-brand-group">
                    <Link to={logoRoute} className="af-logo-link">
                        <img src="/img/LogoAgrofinanzas.jpeg" alt="Logo" className="af-brand-logo" />
                        <span className="af-brand-name">AgroFinanzas</span>
                    </Link>
                </div>

                {/* Links desktop */}
                <ul className="af-main-nav-links">
                    {!isAuthenticated ? (
                        <div className="af-auth-buttons">
                            {!isExact('/') && (
                                <Link to="/" className="af-nav-btn">
                                    <i className="fas fa-home"></i> Inicio
                                </Link>
                            )}
                            {!isExact('/login') && (
                                <Link to="/login" className="af-nav-btn">
                                    <i className="fas fa-right-to-bracket"></i> Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Agronomía dropdown */}
                            <li className="af-dropdown">
                                <a
                                    href="#"
                                    className={`af-nav-link ${agronomyActive ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); toggleAgronomyMenu() }}
                                >
                                    Agronomía <i className="fas fa-chevron-down" style={{ fontSize: '0.62rem', marginLeft: '3px' }}></i>
                                </a>
                                <div className={`af-agronomy-submenu ${agronomyOpen ? 'show' : ''}`}>
                                    <div className="af-submenu-header"><i className="fas fa-leaf"></i> Producción Agropecuaria</div>
                                    <div className="af-submenu-section">
                                        <Link to="/hens" className="af-submenu-item"><i className="fas fa-egg" style={{ color: '#f59e0b' }}></i> Aves de Corral</Link>
                                        <Link to="/cattles" className="af-submenu-item"><i className="fas fa-horse" style={{ color: '#a16207' }}></i> Ganado Vacuno</Link>
                                        <Link to="/avocadocrops" className="af-submenu-item"><i className="fas fa-apple-whole" style={{ color: '#16a34a' }}></i> Cultivo de Aguacate</Link>
                                        <Link to="/coffe_crops" className="af-submenu-item"><i className="fas fa-mug-hot" style={{ color: '#92400e' }}></i> Cultivo de Café</Link>
                                    </div>
                                </div>
                            </li>

                            {/* Finanzas dropdown */}
                            <li className="af-dropdown">
                                <a
                                    href="#"
                                    className={`af-nav-link ${financeActive ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); toggleFinanceMenu() }}
                                >
                                    Finanzas <i className="fas fa-chevron-down" style={{ fontSize: '0.62rem', marginLeft: '3px' }}></i>
                                </a>
                                <div className={`af-finance-submenu ${financeOpen ? 'show' : ''}`}>
                                    <div className="af-submenu-header"><i className="fas fa-chart-line"></i> Gestión Financiera</div>
                                    <div className="af-submenu-section">
                                        <div className="af-submenu-label">Registrar</div>
                                        <Link to="/client/income/create" className="af-submenu-item"><i className="fas fa-plus-circle" style={{ color: '#8ac926' }}></i> Ingreso</Link>
                                        <Link to="/client/expense/create" className="af-submenu-item"><i className="fas fa-minus-circle" style={{ color: '#ff6b6b' }}></i> Gasto</Link>
                                        <Link to="/client/investment/create" className="af-submenu-item"><i className="fas fa-building" style={{ color: '#3b82f6' }}></i> Inversión</Link>
                                        <Link to="/client/debt/create" className="af-submenu-item"><i className="fas fa-credit-card" style={{ color: '#f59e0b' }}></i> Deuda</Link>
                                        <Link to="/client/inventory/create" className="af-submenu-item"><i className="fas fa-boxes" style={{ color: '#a855f7' }}></i> Inventario</Link>
                                        <Link to="/client/costs/create" className="af-submenu-item"><i className="fas fa-seedling" style={{ color: '#14b8a6' }}></i> Costos</Link>
                                    </div>
                                    <div className="af-submenu-divider"></div>
                                    <div className="af-submenu-section">
                                        <div className="af-submenu-label">Ganadería</div>
                                        <Link to="/client/hato/hato" className="af-submenu-item"><i className="fas fa-cow" style={{ color: '#f59e0b' }}></i> Módulo de Ganadería</Link>
                                    </div>
                                    <div className="af-submenu-divider"></div>
                                    <Link to="/client/finances" className="af-submenu-item-highlight">
                                        <i className="fas fa-history"></i> Ver Historial Completo
                                    </Link>
                                </div>
                            </li>

                            {/* Comunidad */}
                            <li>
                                <Link
                                    to="/recommendations"
                                    className={`af-nav-link ${isActive('recommendations') ? 'active' : ''}`}
                                >
                                    Comunidad
                                </Link>
                            </li>

                            {/* Profile */}
                            <li className="af-profile-menu">
                                <div className="af-profile-trigger">
                                    <div
                                        className="af-avatar-wrapper"
                                        ref={profileBtnRef}
                                        onClick={(e) => { e.stopPropagation(); toggleProfileMenu() }}
                                    >
                                        <img
                                            src={userPhoto}
                                            className={`af-profile-avatar ${unreadCount > 0 ? 'af-avatar--has-notif' : ''}`}
                                            onError={(e) => {
                                                const img = e.currentTarget
                                                if (!img.dataset.fallback) {
                                                    img.dataset.fallback = '1'
                                                    img.src = '/img/foto_perfil.jpg'
                                                }
                                            }}
                                            alt="Profile"
                                        />
                                        {unreadCount > 0 && (
                                            <span className="af-notif-badge">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`af-dropdown-content ${profileOpen ? 'show' : ''}`} ref={profileMenuRef}>
                                        <div className="af-dropdown-user">
                                            <img
                                                src={userPhoto}
                                                className="af-dropdown-avatar"
                                                onError={(e) => {
                                                    const img = e.currentTarget
                                                    if (!img.dataset.fallback) {
                                                        img.dataset.fallback = '1'
                                                        img.src = '/img/foto_perfil.jpg'
                                                    }
                                                }}
                                                alt="Avatar"
                                            />
                                            <div>
                                                <p className="af-dropdown-username">{userName}</p>
                                                <span className="af-dropdown-role">Agricultor</span>
                                            </div>
                                        </div>

                                        <hr className="af-menu-divider" />

                                        <div className="af-notif-section">
                                            <div className="af-notif-header">
                                                <span><i className="fas fa-bell"></i> Notificaciones</span>
                                                <button className="af-notif-mark-all" onClick={markAllRead}>Marcar todas</button>
                                            </div>
                                            <div className="af-notif-list">
                                                {notifications.length === 0 ? (
                                                    <div className="af-notif-empty">
                                                        <i className="fas fa-bell-slash"></i>
                                                        <span>Sin notificaciones</span>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            className={`af-notif-item ${!n.is_read ? 'af-notif-item--unread' : ''}`}
                                                            onClick={() => markRead(n.id)}
                                                        >
                                                            <img
                                                                src={n.from_user?.profile_photo || '/img/profile.png'}
                                                                className="af-notif-avatar"
                                                                onError={(e) => { e.currentTarget.src = '/img/profile.png' }}
                                                                alt="User"
                                                            />
                                                            <div className="af-notif-body">
                                                                <p className="af-notif-msg">{n.message}</p>
                                                                <span className="af-notif-time">
                                                                    <i className="fas fa-clock"></i> {timeAgoEs(n.created_at)}
                                                                </span>
                                                            </div>
                                                            {!n.is_read && <span className="af-notif-dot"></span>}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <hr className="af-menu-divider" />
                                        <Link to="/editar-perfil" className="af-dropdown-link">
                                            <i className="fas fa-user-pen"></i> Editar perfil
                                        </Link>
                                        <hr className="af-menu-divider" />
                                        <button className="af-logout-btn" onClick={handleLogout}>
                                            <i className="fas fa-right-from-bracket"></i> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </>
                    )}
                </ul>

                {/* Hamburger (mobile) */}
                <button
                    className={`af-hamburger ${drawerOpen ? 'open' : ''}`}
                    id="afHamburger"
                    aria-label="Menú"
                    aria-expanded={drawerOpen}
                    onClick={(e) => { e.stopPropagation(); toggleDrawer() }}
                >
                    <span></span><span></span><span></span>
                </button>
            </nav>

            {/* ═══ MOBILE DRAWER ═══ */}
            <div className={`af-mobile-drawer ${drawerOpen ? 'open' : ''}`} id="afMobileDrawer">
                {isAuthenticated ? (
                    <>
                        <div className="af-drawer-user">
                            <img
                                src={userPhoto}
                                className="af-drawer-avatar"
                                onError={(e) => {
                                    const img = e.currentTarget
                                    if (!img.dataset.fallback) {
                                        img.dataset.fallback = '1'
                                        img.src = '/img/foto_perfil.jpg'
                                    }
                                }}
                                alt="User"
                            />
                            <div>
                                <div className="af-drawer-name">{userName}</div>
                                <div className="af-drawer-role">Agricultor</div>
                            </div>
                        </div>

                        {/* Agronomía */}
                        <div className="af-drawer-section">
                            <div className="af-drawer-label">Agronomía</div>
                            <Link to="/hens" className="af-drawer-link"><i className="fas fa-egg" style={{ color: '#f59e0b' }}></i> Aves de Corral</Link>
                            <Link to="/cattles" className="af-drawer-link"><i className="fas fa-horse" style={{ color: '#a16207' }}></i> Ganado Vacuno</Link>
                            <Link to="/avocadocrops" className="af-drawer-link"><i className="fas fa-apple-whole" style={{ color: '#16a34a' }}></i> Cultivo de Aguacate</Link>
                            <Link to="/coffe_crops" className="af-drawer-link"><i className="fas fa-mug-hot" style={{ color: '#92400e' }}></i> Cultivo de Café</Link>
                        </div>

                        <div className="af-drawer-divider"></div>

                        {/* Finanzas */}
                        <div className="af-drawer-section">
                            <div className="af-drawer-label">Finanzas</div>
                            <Link to="/client/income/create" className="af-drawer-link"><i className="fas fa-plus-circle" style={{ color: '#8ac926' }}></i> Registrar Ingreso</Link>
                            <Link to="/client/expense/create" className="af-drawer-link"><i className="fas fa-minus-circle" style={{ color: '#ff6b6b' }}></i> Registrar Gasto</Link>
                            <Link to="/client/investment/create" className="af-drawer-link"><i className="fas fa-building" style={{ color: '#3b82f6' }}></i> Inversión</Link>
                            <Link to="/client/debt/create" className="af-drawer-link"><i className="fas fa-credit-card" style={{ color: '#f59e0b' }}></i> Deuda</Link>
                            <Link to="/client/inventory/create" className="af-drawer-link"><i className="fas fa-boxes" style={{ color: '#a855f7' }}></i> Inventario</Link>
                            <Link to="/client/costs/create" className="af-drawer-link"><i className="fas fa-seedling" style={{ color: '#14b8a6' }}></i> Costos</Link>
                            <Link to="/client/hato/hato" className="af-drawer-link"><i className="fas fa-cow" style={{ color: '#f59e0b' }}></i> Mi Hato Ganadero</Link>
                            <Link to="/client/finances" className="af-drawer-link" style={{ color: '#8ac926', fontWeight: 600 }}><i className="fas fa-history" style={{ color: '#8ac926' }}></i> Historial Completo</Link>
                        </div>

                        <div className="af-drawer-divider"></div>

                        {/* Cuenta */}
                        <div className="af-drawer-section">
                            <div className="af-drawer-label">Cuenta</div>
                            <Link to="/recommendations" className="af-drawer-link"><i className="fas fa-users" style={{ color: '#8ac926' }}></i> Comunidad</Link>
                            <Link to="/editar-perfil" className="af-drawer-link"><i className="fas fa-user-pen" style={{ color: '#8ac926' }}></i> Editar Perfil</Link>
                        </div>

                        <div className="af-drawer-divider"></div>

                        <button className="af-drawer-logout" onClick={handleLogout}>
                            <i className="fas fa-right-from-bracket"></i> Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <div className="af-drawer-section" style={{ paddingTop: '12px' }}>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: '20px', textAlign: 'center' }}>
                            Accede a tu cuenta para gestionar tu campo
                        </p>
                        <div className="af-drawer-auth">
                            <Link to="/login" className="af-drawer-auth-btn af-drawer-auth-btn--primary">
                                <i className="fas fa-right-to-bracket"></i> Iniciar Sesión
                            </Link>
                            <Link to="/" className="af-drawer-auth-btn af-drawer-auth-btn--ghost">
                                <i className="fas fa-home"></i> Volver al Inicio
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
