import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type AdminUser } from '../../services/adminService'
import '../admin-pages.css'

export default function UsersIndex() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const d = await adminService.getUsers({ search: search || undefined, status: status || undefined })
            setUsers(d.users)
        } finally { setLoading(false) }
    }, [search, status])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const handleToggle = async (id: number) => {
        await adminService.toggleUser(id)
        fetchUsers()
    }

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
        await adminService.deleteUser(id)
        fetchUsers()
    }

    const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchUsers() }

    return (
        <>
            <form className="filter-bar" onSubmit={handleFilter}>
                <div className="filter-fg">
                    <label>Buscar</label>
                    <input type="text" placeholder="Nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-fg" style={{ maxWidth: 160 }}>
                    <label>Estado</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
                <button type="submit" className="filter-btn"><i className="fas fa-search"></i> Filtrar</button>
            </form>

            <div className="admin-table-wrap">
                <div className="admin-table-head">
                    <h3><i className="fas fa-users" style={{ color: '#8ac926', marginRight: 8 }}></i> Lista de Usuarios</h3>
                    <span>{users.length} usuarios encontrados</span>
                </div>
                <table>
                    <thead><tr><th>Usuario</th><th>Email</th><th>Finanzas</th><th>Ganado</th><th>Comentarios</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#4a5a3a' }}><i className="fas fa-spinner fa-spin"></i> Cargando...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: '#4a5a3a', padding: 40 }}>
                                <i className="fas fa-users" style={{ fontSize: '2rem', display: 'block', marginBottom: 10, opacity: 0.3 }}></i>No se encontraron usuarios.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td><div className="user-cell"><div className="user-avatar">{u.profile_photo ? <img src={u.profile_photo} alt="" /> : u.name.charAt(0).toUpperCase()}</div><div><div className="user-name">{u.name}</div><div className="user-date">Desde {u.created_at}</div></div></div></td>
                                <td>{u.email}</td>
                                <td>{u.finances_count ?? 0}</td>
                                <td>{u.cattle_count ?? 0}</td>
                                <td>{u.recommendations_count ?? 0}</td>
                                <td>{u.is_active ? <span className="badge-active">Activo</span> : <span className="badge-inactive">Inactivo</span>}</td>
                                <td>
                                    <div className="action-btns">
                                        <Link to={`/admin/usuarios/${u.id}`} className="btn-sm btn-detail"><i className="fas fa-eye"></i> Ver</Link>
                                        <button className={`btn-sm ${u.is_active ? 'btn-toggle-on' : 'btn-toggle-off'}`} onClick={() => handleToggle(u.id)} title={u.is_active ? 'Desactivar' : 'Activar'}>
                                            <i className={`fas ${u.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                                        </button>
                                        <button className="btn-sm btn-delete" onClick={() => handleDelete(u.id, u.name)}><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
