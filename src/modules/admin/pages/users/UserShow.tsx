import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminService, type AdminUser, type FinanceRecord, type FinanceSummary, type AdminComment } from '../../services/adminService'
import '../admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

const SUMMARY_CARDS = (s: FinanceSummary | null, commentsLen: number) => [
    { icon: 'fa-arrow-trend-up',   color: '#4A7C3F', label: 'Ingresos',    val: formatMoney(s?.total_income ?? 0) },
    { icon: 'fa-arrow-trend-down', color: '#c0392b', label: 'Gastos',      val: formatMoney(s?.total_expense ?? 0) },
    { icon: 'fa-scale-balanced',   color: '#5B8DB8', label: 'Balance',     val: formatMoney(s?.balance ?? 0) },
    { icon: 'fa-credit-card',      color: '#D4841A', label: 'Deudas',      val: formatMoney(s?.total_debt ?? 0) },
    { icon: 'fa-comments',         color: '#7c3aed', label: 'Comentarios', val: commentsLen },
    { icon: 'fa-file-lines',       color: '#6B3D14', label: 'Registros',   val: s?.records ?? 0 },
]

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
            setUser(d.user); setFinances(d.finances.finances)
            setSummary(d.finances.summary); setComments(d.comments)
        }).finally(() => setLoading(false))
    }, [id])

    const handleToggle = async () => {
        if (!user) return
        await adminService.toggleUser(user.id)
        setUser({ ...user, is_active: !user.is_active })
    }

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

    if (loading) return (
        <div className="admin-loading"><i className="fas fa-circle-notch fa-spin"></i></div>
    )
    if (!user) return (
        <div className="empty-state"><i className="fas fa-user-slash"></i>Usuario no encontrado.</div>
    )

    return (
        <>
            <Link to="/admin/usuarios" className="btn-action btn-back" style={{ display: 'inline-flex', marginBottom: 20 }}>
                <i className="fas fa-arrow-left"></i> Volver a usuarios
            </Link>

            {/* ── Hero ── */}
            <div className="user-hero">
                <div className="user-hero__avatar">
                    {user.profile_photo
                        ? <img src={user.profile_photo} alt="" />
                        : user.name.charAt(0).toUpperCase()
                    }
                </div>
                <div>
                    <div className="user-hero__name">{user.name}</div>
                    <div className="user-hero__email">{user.email}</div>
                    <div className="user-hero__meta">
                        <span className="meta-pill">
                            <i className="fas fa-calendar"></i> Registrado {user.created_at}
                        </span>
                        {user.is_active
                            ? <span className="badge-active">Activo</span>
                            : <span className="badge-inactive">Inactivo</span>
                        }
                    </div>
                </div>
                <div className="user-hero__actions">
                    <button className="btn-action btn-toggle" onClick={handleToggle}>
                        <i className={`fas ${user.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                        {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="btn-action btn-delete" onClick={handleDelete}>
                        <i className="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>

            {/* ── Summary ── */}
            <div className="summary-row">
                {SUMMARY_CARDS(summary, comments.length).map((c, i) => (
                    <div className="sum-card" key={i}>
                        <div className="sum-card__label">
                            <i className={`fas ${c.icon}`} style={{ color: c.color, marginRight: 5 }}></i>
                            {c.label}
                        </div>
                        <div className="sum-card__val">{c.val}</div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="tabs">
                <button type="button" className={`tab-btn ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}>
                    <i className="fas fa-chart-line"></i> Finanzas
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                    <i className="fas fa-comments"></i> Comentarios
                </button>
            </div>

            {/* ── Finanzas ── */}
            {activeTab === 'finances' && (
                <div className="admin-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th><th>Tipo</th><th>Monto</th><th>Categoría</th><th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {finances.length === 0 ? (
                                <tr><td colSpan={5}><div className="empty-state"><i className="fas fa-file-invoice-dollar"></i>Sin registros financieros.</div></td></tr>
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

            {/* ── Comentarios ── */}
            {activeTab === 'comments' && (
                <div>
                    {comments.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-comments"></i>
                            Este usuario no tiene comentarios.
                        </div>
                    ) : comments.map(c => (
                        <div className="comment-card" key={c.id}>
                            <div>
                                <div className="comment-content">{c.content}</div>
                                <div className="comment-date" style={{ marginTop: 8 }}>
                                    <i className="fas fa-clock"></i> {c.created_at}
                                </div>
                            </div>
                            <button className="btn-del-comment" onClick={() => handleDeleteComment(c.id)}>
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}