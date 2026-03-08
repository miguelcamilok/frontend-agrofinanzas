import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService, type FinanceRecord, type FinanceSummary } from '../../services/adminService'
import '../admin-pages.css'

const formatMoney = (n: number) => '$' + n.toLocaleString('es-CO')

const SUMMARY_CARDS = (s: FinanceSummary | null) => [
    { icon: 'fa-arrow-trend-up',       color: '#4A7C3F', label: 'Ingresos',    val: formatMoney(s?.total_income ?? 0) },
    { icon: 'fa-arrow-trend-down',     color: '#c0392b', label: 'Gastos',      val: formatMoney(s?.total_expense ?? 0) },
    { icon: 'fa-building-columns',     color: '#5B8DB8', label: 'Inversiones', val: formatMoney(s?.total_investment ?? 0) },
    { icon: 'fa-credit-card',          color: '#D4841A', label: 'Deudas',      val: formatMoney(s?.total_debt ?? 0) },
    { icon: 'fa-boxes-stacked',        color: '#7c3aed', label: 'Inventario',  val: formatMoney(s?.total_inventory ?? 0) },
    { icon: 'fa-file-lines',           color: '#6B3D14', label: 'Registros',   val: s?.records ?? 0 },
]

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
                {SUMMARY_CARDS(summary).map((c, i) => (
                    <div className="sum-card" key={i}>
                        <div className="sum-card__label">
                            <i className={`fas ${c.icon}`} style={{ color: c.color, marginRight: 5 }}></i>
                            {c.label}
                        </div>
                        <div className="sum-card__val">{c.val}</div>
                    </div>
                ))}
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
                <button type="submit" className="filter-btn">
                    <i className="fas fa-search"></i> Filtrar
                </button>
            </form>

            <div className="admin-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-circle-notch fa-spin" style={{ color: 'var(--paja)', fontSize: '1.4rem' }}></i></td></tr>
                        ) : finances.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state"><i className="fas fa-file-invoice-dollar"></i>Sin registros financieros.</div></td></tr>
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