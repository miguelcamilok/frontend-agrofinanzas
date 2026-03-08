import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type DashboardStats, type AdminUser } from '../services/adminService'
import './admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

const STAT_CARDS = (stats: DashboardStats | null) => [
    {
        icon: 'fa-users',
        color: '#6B3D14',
        bg: 'rgba(107,61,20,.08)',
        value: stats?.total_users ?? 0,
        label: 'Usuarios totales',
    },
    {
        icon: 'fa-circle-check',
        color: '#4A7C3F',
        bg: 'rgba(74,124,63,.08)',
        value: stats?.active_users ?? 0,
        label: 'Usuarios activos',
    },
    {
        icon: 'fa-file-invoice-dollar',
        color: '#A0522D',
        bg: 'rgba(160,82,45,.08)',
        value: stats?.total_finances ?? 0,
        label: 'Registros financieros',
    },
    {
        icon: 'fa-comments',
        color: '#5B8DB8',
        bg: 'rgba(91,141,184,.08)',
        value: stats?.total_comments ?? 0,
        label: 'Comentarios',
    },
    {
        icon: 'fa-arrow-trend-up',
        color: '#4A7C3F',
        bg: 'rgba(74,124,63,.08)',
        value: formatMoney(stats?.total_income ?? 0),
        label: 'Ingresos totales',
    },
    {
        icon: 'fa-arrow-trend-down',
        color: '#c0392b',
        bg: 'rgba(192,57,43,.07)',
        value: formatMoney(stats?.total_expense ?? 0),
        label: 'Gastos totales',
    },
]

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        adminService.getDashboard()
            .then(d => { setStats(d.stats); setUsers(d.users) })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="admin-loading">
            <i className="fas fa-circle-notch fa-spin"></i>
        </div>
    )

    return (
        <>
            {/* ── Stats ── */}
            <div className="stats-grid">
                {STAT_CARDS(stats).map((card, i) => (
                    <div className="stat-card" key={i}>
                        <div
                            className="stat-card__icon-wrap"
                            style={{ background: card.bg, color: card.color }}
                        >
                            <i className={`fas ${card.icon}`}></i>
                        </div>
                        <div className="stat-card__num">{card.value}</div>
                        <div className="stat-card__label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabla usuarios recientes ── */}
            <div className="admin-table-wrap">
                <div className="admin-table-head">
                    <h3>
                        <i className="fas fa-clock-rotate-left"></i>
                        Usuarios Recientes
                    </h3>
                    <Link to="/admin/usuarios" className="tbl-link">
                        Ver todos <i className="fas fa-arrow-right" style={{ fontSize: '.65rem' }}></i>
                    </Link>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Finanzas</th>
                            <th>Estado</th>
                            <th>Registro</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">
                                        <i className="fas fa-users"></i>
                                        Sin usuarios registrados.
                                    </div>
                                </td>
                            </tr>
                        ) : users.slice(0, 8).map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">
                                            {u.profile_photo
                                                ? <img src={u.profile_photo} alt="" />
                                                : u.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div>
                                            <div className="user-name">{u.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>{u.finances_count ?? 0} registros</td>
                                <td>
                                    {u.is_active
                                        ? <span className="badge-active">Activo</span>
                                        : <span className="badge-inactive">Inactivo</span>
                                    }
                                </td>
                                <td>{u.created_at}</td>
                                <td>
                                    <Link to={`/admin/usuarios/${u.id}`} className="tbl-link">
                                        Ver detalle <i className="fas fa-arrow-right" style={{ fontSize: '.62rem' }}></i>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}