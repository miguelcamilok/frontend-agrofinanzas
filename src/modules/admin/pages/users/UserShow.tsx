import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminService, type AdminUser, type FinanceRecord, type FinanceSummary, type AdminComment } from '../../services/adminService'
import '../admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

export default function UserShow() {
    const { id } = useParams<{ id: string }>()
    const [user, setUser] = useState<AdminUser | null>(null)
    const [finances, setFinances] = useState<FinanceRecord[]>([])
    const [summary, setSummary] = useState<FinanceSummary | null>(null)
    const [comments, setComments] = useState<AdminComment[]>([])
    const [activeTab, setActiveTab] = useState<'finances' | 'comments'>('finances')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        adminService.getUserDetail(Number(id)).then(d => {
            setUser(d.user); setFinances(d.finances.finances); setSummary(d.finances.summary); setComments(d.comments)
        }).finally(() => setLoading(false))
    }, [id])

    const handleToggle = async () => { if (!user) return; await adminService.toggleUser(user.id); setUser({ ...user, is_active: !user.is_active }) }
    const handleDelete = async () => {
        if (!user || !confirm('¿Eliminar este usuario permanentemente?')) return
        await adminService.deleteUser(user.id)
        window.location.href = '/admin/usuarios'
    }
    const handleDeleteComment = async (cId: number) => {
        if (!confirm('¿Eliminar este comentario?')) return
        await adminService.deleteComment(cId)
        setComments(prev => prev.filter(c => c.id !== cId))
    }

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#7a8a6a' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>
    if (!user) return <div style={{ textAlign: 'center', padding: 60, color: '#4a5a3a' }}>Usuario no encontrado.</div>

    return (
        <>
            <Link to="/admin/usuarios" className="btn-action btn-back" style={{ display: 'inline-flex', marginBottom: 20 }}>
                <i className="fas fa-arrow-left"></i> Volver a usuarios
            </Link>

            <div className="user-hero">
                <div className="user-hero__avatar">
                    {user.profile_photo ? <img src={user.profile_photo} alt="" /> : user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="user-hero__name">{user.name}</div>
                    <div className="user-hero__email">{user.email}</div>
                    <div className="user-hero__meta">
                        <span className="meta-pill"><i className="fas fa-calendar"></i> Registrado {user.created_at}</span>
                        {user.is_active ? <span className="badge-active">Activo</span> : <span className="badge-inactive">Inactivo</span>}
                    </div>
                </div>
                <div className="user-hero__actions">
                    <button className="btn-action btn-toggle" onClick={handleToggle}>
                        <i className={`fas ${user.is_active ? 'fa-ban' : 'fa-check'}`}></i> {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="btn-action btn-delete" onClick={handleDelete}><i className="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>

            <div className="summary-row">
                <div className="sum-card"><div className="sum-card__label">📈 Ingresos</div><div className="sum-card__val">{formatMoney(summary?.total_income ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">📉 Gastos</div><div className="sum-card__val">{formatMoney(summary?.total_expense ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">⚖️ Balance</div><div className="sum-card__val">{formatMoney(summary?.balance ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">🏦 Deudas</div><div className="sum-card__val">{formatMoney(summary?.total_debt ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">💬 Comentarios</div><div className="sum-card__val">{comments.length}</div></div>
                <div className="sum-card"><div className="sum-card__label">📋 Registros</div><div className="sum-card__val">{summary?.records ?? 0}</div></div>
            </div>

            <div className="tabs">
                <button type="button" className={`tab-btn ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}>
                    <i className="fas fa-chart-line"></i> Finanzas
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                    <i className="fas fa-comments"></i> Comentarios
                </button>
            </div>

            {activeTab === 'finances' && (
                <div className="admin-table-wrap">
                    <table>
                        <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Categoría</th><th>Descripción</th></tr></thead>
                        <tbody>
                            {finances.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#4a5a3a', padding: 30 }}>Sin registros financieros.</td></tr>
                            ) : finances.map(f => (
                                <tr key={f.id}>
                                    <td>{f.date ?? '-'}</td>
                                    <td><span className={`type-badge type-${f.type ?? 'income'}`}>{f.type ?? '-'}</span></td>
                                    <td><strong>{formatMoney(f.amount ?? 0)}</strong></td>
                                    <td>{f.category ?? '-'}</td>
                                    <td>{f.description ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'comments' && (
                <div>
                    {comments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4a5a3a', padding: 40 }}>
                            <i className="fas fa-comments" style={{ fontSize: '2rem', display: 'block', marginBottom: 10, opacity: 0.3 }}></i>
                            Este usuario no tiene comentarios.
                        </div>
                    ) : comments.map(c => (
                        <div className="comment-card" key={c.id}>
                            <div>
                                <div className="comment-content">{c.content}</div>
                                <div className="comment-date"><i className="fas fa-clock"></i> {c.created_at}</div>
                            </div>
                            <button className="btn-del-comment" onClick={() => handleDeleteComment(c.id)}><i className="fas fa-trash"></i></button>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
