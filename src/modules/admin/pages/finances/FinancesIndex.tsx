import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type FinanceRecord, type FinanceSummary } from '../../services/adminService'
import '../admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

export default function FinancesIndex() {
    const [finances, setFinances] = useState<FinanceRecord[]>([])
    const [summary, setSummary] = useState<FinanceSummary | null>(null)
    const [usersList, setUsersList] = useState<{ id: number; name: string; email: string }[]>([])
    const [filterUser, setFilterUser] = useState('')
    const [filterType, setFilterType] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const d = await adminService.getFinances({ user_id: filterUser || undefined, type: filterType || undefined })
            setFinances(d.finances || []); setSummary(d.summary || null); setUsersList(d.users || [])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilter = (e: React.FormEvent) => { e.preventDefault(); fetchData() }

    return (
        <>
            <div className="summary-row">
                <div className="sum-card"><div className="sum-card__label">📈 Ingresos</div><div className="sum-card__val">{formatMoney(summary?.total_income ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">📉 Gastos</div><div className="sum-card__val">{formatMoney(summary?.total_expense ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">🏦 Inversiones</div><div className="sum-card__val">{formatMoney(summary?.total_investment ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">💳 Deudas</div><div className="sum-card__val">{formatMoney(summary?.total_debt ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">📦 Inventario</div><div className="sum-card__val">{formatMoney(summary?.total_inventory ?? 0)}</div></div>
                <div className="sum-card"><div className="sum-card__label">📋 Registros</div><div className="sum-card__val">{summary?.records ?? 0}</div></div>
            </div>

            <form className="filter-bar" onSubmit={handleFilter}>
                <div className="filter-fg">
                    <label>Usuario</label>
                    <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                        <option value="">Todos los usuarios</option>
                        {usersList.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                </div>
                <div className="filter-fg" style={{ maxWidth: 160 }}>
                    <label>Tipo</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="income">Ingresos</option>
                        <option value="expense">Gastos</option>
                        <option value="investment">Inversiones</option>
                        <option value="debt">Deudas</option>
                        <option value="inventory">Inventario</option>
                        <option value="costs">Costos</option>
                    </select>
                </div>
                <button type="submit" className="filter-btn"><i className="fas fa-search"></i> Filtrar</button>
            </form>

            <div className="admin-table-wrap">
                <table>
                    <thead><tr><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Monto</th><th>Categoría</th><th>Descripción</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#4a5a3a' }}><i className="fas fa-spinner fa-spin"></i></td></tr>
                        ) : finances.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#4a5a3a', padding: 30 }}>Sin registros financieros.</td></tr>
                        ) : finances.map(f => (
                            <tr key={f.id}>
                                <td>{f.date ?? '-'}</td>
                                <td>{f.user ? <Link to={`/admin/usuarios/${f.user.id}`} className="user-link">{f.user.name}</Link> : '-'}</td>
                                <td><span className={`type-badge type-${f.type ?? ''}`}>{f.type ?? '-'}</span></td>
                                <td><strong>{formatMoney(f.amount ?? 0)}</strong></td>
                                <td>{f.category ?? '-'}</td>
                                <td>{f.description ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
