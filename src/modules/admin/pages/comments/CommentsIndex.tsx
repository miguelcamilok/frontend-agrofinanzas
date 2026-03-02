import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type AdminComment } from '../../services/adminService'
import '../admin-pages.css'

export default function CommentsIndex() {
    const [comments, setComments] = useState<AdminComment[]>([])
    const [usersList, setUsersList] = useState<{ id: number; name: string }[]>([])
    const [search, setSearch] = useState('')
    const [filterUser, setFilterUser] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const d = await adminService.getComments({ search: search || undefined, user_id: filterUser || undefined })
            setComments(d.comments || []); setUsersList(d.users || [])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchData() }
    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este comentario?')) return
        await adminService.deleteComment(id)
        setComments(prev => prev.filter(c => c.id !== id))
    }

    return (
        <>
            <form className="filter-bar" onSubmit={handleFilter}>
                <div className="filter-fg">
                    <label>Buscar en contenido</label>
                    <input type="text" placeholder="Buscar texto..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-fg" style={{ maxWidth: 220 }}>
                    <label>Filtrar por usuario</label>
                    <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                        <option value="">Todos los usuarios</option>
                        {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <button type="submit" className="filter-btn"><i className="fas fa-search"></i> Filtrar</button>
            </form>

            <div className="comments-count">
                <i className="fas fa-comments" style={{ color: '#8ac926' }}></i> {comments.length} comentarios encontrados
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#7a8a6a' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>
            ) : comments.length === 0 ? (
                <div className="empty-state"><i className="fas fa-comments"></i>No hay comentarios que coincidan con los filtros.</div>
            ) : comments.map(c => (
                <div className="comment-card" key={c.id}>
                    <div className="comment-avatar">
                        {c.user.photo ? <img src={c.user.photo} alt="" /> : (c.user.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-body">
                        <div className="comment-meta">
                            <span className="comment-user"><Link to={`/admin/usuarios/${c.user.id}`}>{c.user.name ?? 'Usuario'}</Link></span>
                            <span className="comment-email">{c.user.email ?? ''}</span>
                            <span className="comment-date"><i className="fas fa-clock"></i> {c.created_at}</span>
                        </div>
                        <div className="comment-content">{c.content}</div>
                    </div>
                    <button className="btn-del-comment" onClick={() => handleDelete(c.id)}><i className="fas fa-trash"></i> Eliminar</button>
                </div>
            ))}
        </>
    )
}
