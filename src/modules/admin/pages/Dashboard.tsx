import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type DashboardStats, type AdminUser } from '../services/adminService'
import './admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        adminService.getDashboard().then(d => { setStats(d.stats); setUsers(d.users) }).finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#7a8a6a' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-card__icon">👥</div><div className="stat-card__num">{stats?.total_users ?? 0}</div><div className="stat-card__label">Usuarios totales</div></div>
                <div className="stat-card"><div className="stat-card__icon">✅</div><div className="stat-card__num">{stats?.active_users ?? 0}</div><div className="stat-card__label">Usuarios activos</div></div>
                <div className="stat-card"><div className="stat-card__icon">💰</div><div className="stat-card__num">{stats?.total_finances ?? 0}</div><div className="stat-card__label">Registros financieros</div></div>
                <div className="stat-card"><div className="stat-card__icon">💬</div><div className="stat-card__num">{stats?.total_comments ?? 0}</div><div className="stat-card__label">Comentarios</div></div>
                <div className="stat-card"><div className="stat-card__icon">📈</div><div className="stat-card__num">{formatMoney(stats?.total_income ?? 0)}</div><div className="stat-card__label">Ingresos totales</div></div>
                <div className="stat-card"><div className="stat-card__icon">📉</div><div className="stat-card__num">{formatMoney(stats?.total_expense ?? 0)}</div><div className="stat-card__label">Gastos totales</div></div>
            </div>

            <div className="admin-table-wrap">
                <div className="admin-table-head">
                    <h3><i className="fas fa-users" style={{ color: '#8ac926', marginRight: 8 }}></i> Usuarios Recientes</h3>
                    <Link to="/admin/usuarios">Ver todos →</Link>
                </div>
                <table>
                    <thead><tr><th>Usuario</th><th>Email</th><th>Finanzas</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#4a5a3a', padding: 30 }}>Sin usuarios registrados.</td></tr>
                        ) : users.slice(0, 8).map(u => (
                            <tr key={u.id}>
                                <td><div className="user-cell"><div className="user-avatar">{u.profile_photo ? <img src={u.profile_photo} alt="" /> : u.name.charAt(0).toUpperCase()}</div>{u.name}</div></td>
                                <td>{u.email}</td>
                                <td>{u.finances_count ?? 0} registros</td>
                                <td>{u.is_active ? <span className="badge-active">Activo</span> : <span className="badge-inactive">Inactivo</span>}</td>
                                <td>{u.created_at}</td>
                                <td><Link to={`/admin/usuarios/${u.id}`} className="tbl-link">Ver detalle →</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
