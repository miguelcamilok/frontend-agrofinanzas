import { useState, useEffect, useCallback, useRef } from 'react'
import { clientService, type FinanceItem } from '../services/clientService'
import './ClientFinances.css'

const FILTER_OPTIONS: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'Todos', icon: 'fa-th-large' },
    { key: 'income', label: 'Ingresos', icon: 'fa-arrow-trend-up' },
    { key: 'expense', label: 'Gastos', icon: 'fa-arrow-trend-down' },
    { key: 'investment', label: 'Inversiones', icon: 'fa-building' },
    { key: 'debt', label: 'Deudas', icon: 'fa-credit-card' },
    { key: 'inventory', label: 'Inventario', icon: 'fa-boxes-stacked' },
    { key: 'costs', label: 'Costos', icon: 'fa-seedling' },
]

const TYPE_BADGE: Record<string, { cls: string; icon: string; label: string }> = {
    income: { cls: 'badge-income', icon: 'fa-arrow-trend-up', label: 'Ingreso' },
    expense: { cls: 'badge-expense', icon: 'fa-arrow-trend-down', label: 'Gasto' },
    investment: { cls: 'badge-investment', icon: 'fa-building', label: 'Inversión' },
    debt: { cls: 'badge-debt', icon: 'fa-credit-card', label: 'Deuda' },
    inventory: { cls: 'badge-inventory', icon: 'fa-boxes-stacked', label: 'Inventario' },
    costs: { cls: 'badge-costs', icon: 'fa-seedling', label: 'Costos' },
}

const SUMMARY_CARDS = [
    { key: 'totalIncome', label: 'Total Ingresos', icon: 'fa-arrow-trend-up', cls: 'income' },
    { key: 'totalExpense', label: 'Total Gastos', icon: 'fa-arrow-trend-down', cls: 'expense' },
    { key: 'balance', label: 'Balance', icon: 'fa-scale-balanced', cls: 'balance' },
    { key: 'totalInvestment', label: 'Inversiones', icon: 'fa-building', cls: 'investment' },
    { key: 'totalDebt', label: 'Deudas', icon: 'fa-credit-card', cls: 'debt' },
    { key: 'totalInventory', label: 'Inventario', icon: 'fa-boxes-stacked', cls: 'inventory' },
    { key: 'totalCosts', label: 'Costos', icon: 'fa-seedling', cls: 'costs' },
]

const fmtMoney = (n: number) => '$' + n.toLocaleString('es-CO')

export default function ClientFinances() {
    const [filter, setFilter] = useState('all')
    const [finances, setFinances] = useState<FinanceItem[]>([])
    const [totals, setTotals] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null)

    // Edit modal
    const [editItem, setEditItem] = useState<FinanceItem | null>(null)
    const [editAmount, setEditAmount] = useState('')
    const [editDate, setEditDate] = useState('')
    const [editCategory, setEditCategory] = useState('')
    const [editDesc, setEditDesc] = useState('')

    // Calculator
    const [calcOpen, setCalcOpen] = useState(false)
    const [calcValue, setCalcValue] = useState('')
    const calcRef = useRef<HTMLDivElement>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const d = await clientService.getFinances(filter)
            setFinances(d.finances)
            setTotals({
                totalIncome: d.totalIncome, totalExpense: d.totalExpense, balance: d.balance,
                totalInvestment: d.totalInvestment, totalDebt: d.totalDebt, totalInventory: d.totalInventory, totalCosts: d.totalCosts,
            })
        } finally { setLoading(false) }
    }, [filter])

    useEffect(() => { fetchData() }, [fetchData])

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este registro?')) return
        await clientService.deleteFinance(id)
        setAlert({ type: 'success', msg: 'Registro eliminado correctamente' })
        fetchData()
    }

    const handlePayInstallment = async (id: number) => {
        await clientService.payDebtInstallment(id)
        setAlert({ type: 'success', msg: 'Cuota pagada correctamente' })
        fetchData()
    }

    const openEdit = (f: FinanceItem) => {
        setEditItem(f); setEditAmount(String(f.amount)); setEditDate(f.date_original ?? f.date)
        setEditCategory(f.category ?? ''); setEditDesc(f.description ?? '')
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editItem) return
        await clientService.updateFinance(editItem.id, { amount: Number(editAmount), date: editDate, category: editCategory, description: editDesc })
        setEditItem(null); setAlert({ type: 'success', msg: 'Transacción actualizada' }); fetchData()
    }

    const calcPress = (val: string) => {
        if (val === '=') {
            try { setCalcValue(String(eval(calcValue))) } catch { setCalcValue('Error') } // eslint-disable-line no-eval
        } else if (val === 'C') { setCalcValue('') }
        else { setCalcValue(prev => prev + val) }
    }

    // Auto-dismiss alert
    useEffect(() => { if (alert) { const t = setTimeout(() => setAlert(null), 5000); return () => clearTimeout(t) } }, [alert])

    const renderDetails = (f: FinanceItem) => {
        switch (f.type) {
            case 'investment': return f.asset_name ? <div className="detail-item"><i className="fas fa-tools"></i><span>{f.asset_name}</span></div> : null
            case 'debt': return <>
                {f.creditor && <div className="detail-item"><i className="fas fa-building-columns"></i><span>{f.creditor}</span></div>}
                {f.paid_installments != null && f.installments != null && <span className="progress-indicator"><i className="fas fa-chart-pie"></i> {f.paid_installments}/{f.installments}</span>}
            </>
            case 'inventory': return <>
                {f.product_name && <div className="detail-item"><i className="fas fa-box"></i><span>{f.product_name}</span></div>}
                {f.quantity != null && f.unit && <div className="detail-item"><i className="fas fa-weight-scale"></i><span>{f.quantity} {f.unit}</span></div>}
            </>
            case 'costs': return <>
                {f.crop_name && <div className="detail-item"><i className="fas fa-leaf"></i><span>{f.crop_name}</span></div>}
                {f.area && <div className="detail-item"><i className="fas fa-chart-area"></i><span>{f.area} ha</span></div>}
            </>
            default: return <span className="detail-item">-</span>
        }
    }

    return (
        <div className="finance-dashboard">
            {alert && (
                <div className={`modern-alert ${alert.type}`}>
                    <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                    <span>{alert.msg}</span>
                </div>
            )}

            <div className="dashboard-header"><h1 className="dashboard-title"><i className="fas fa-chart-line"></i> Historial Financiero</h1></div>

            {/* Filters */}
            <div className="filter-section"><div className="filter-grid">
                {FILTER_OPTIONS.map(f => (
                    <button key={f.key} className={`filter-button ${f.key} ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                        <i className={`fas ${f.icon}`}></i> {f.label}
                    </button>
                ))}
            </div></div>

            {/* Summary */}
            <div className="summary-grid">
                {SUMMARY_CARDS.map(c => (
                    <div key={c.key} className={`summary-card ${c.cls}`}>
                        <div className="summary-card-header"><div className="summary-card-icon"><i className={`fas ${c.icon}`}></i></div><span>{c.label}</span></div>
                        <p className="summary-card-value">{fmtMoney(totals[c.key] ?? 0)}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="modern-table">
                    <thead><tr><th><i className="fas fa-calendar"></i> Fecha</th><th><i className="fas fa-tag"></i> Tipo</th><th><i className="fas fa-dollar-sign"></i> Monto</th><th><i className="fas fa-info-circle"></i> Detalles</th><th><i className="fas fa-align-left"></i> Descripción</th><th><i className="fas fa-cog"></i> Acciones</th></tr></thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 60 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8ac926' }}></i></td></tr>
                        ) : finances.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state"><i className="fas fa-inbox"></i><p className="empty-state-title">No hay registros</p><p className="empty-state-text">Intenta cambiar el filtro o agregar una nueva transacción</p></div></td></tr>
                        ) : finances.map(f => {
                            const badge = TYPE_BADGE[f.type]
                            return (
                                <tr key={f.id}>
                                    <td className="date-column">{f.date_formatted ?? f.date ?? 'N/A'}</td>
                                    <td>{badge && <span className={`type-badge ${badge.cls}`}><i className={`fas ${badge.icon}`}></i> {badge.label}</span>}</td>
                                    <td className="amount-column">{fmtMoney(f.amount)}</td>
                                    <td><div className="details-content">{renderDetails(f)}{f.category && <span className="category-badge">{f.category}</span>}</div></td>
                                    <td>{f.description ?? '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" title="Editar" onClick={() => openEdit(f)}><i className="fas fa-pen"></i></button>
                                            <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(f.id)}><i className="fas fa-trash"></i></button>
                                            {f.type === 'debt' && f.paid_installments != null && f.installments != null && f.paid_installments < f.installments && (
                                                <button className="action-btn pay" title="Pagar cuota" onClick={() => handlePayInstallment(f.id)}><i className="fas fa-dollar-sign"></i></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Charts section placeholder */}
            <div className="charts-section">
                <div className="charts-header">
                    <h2 className="charts-title"><i className="fas fa-chart-bar"></i> Análisis Visual</h2>
                </div>
                <div className="charts-grid">
                    <div className="chart-card"><h3 className="chart-card-title">Distribución: Ingresos vs Gastos</h3><div className="chart-canvas"><canvas id="incomeExpenseChart"></canvas></div></div>
                    <div className="chart-card"><h3 className="chart-card-title">Tendencia Temporal</h3><div className="chart-canvas"><canvas id="historyChart"></canvas></div></div>
                    <div className="chart-card"><h3 className="chart-card-title">Por Categoría</h3><div className="chart-canvas"><canvas id="categoryChart"></canvas></div></div>
                    <div className="chart-card"><h3 className="chart-card-title">Balance Acumulado</h3><div className="chart-canvas"><canvas id="balanceChart"></canvas></div></div>
                </div>
            </div>

            {/* Edit Modal */}
            {editItem && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"><i className="fas fa-pen"></i> Editar Transacción</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setEditItem(null)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label">Monto</label><input type="number" step="0.01" className="form-control" value={editAmount} onChange={e => setEditAmount(e.target.value)} required /></div>
                                    <div className="mb-3"><label className="form-label">Fecha</label><input type="date" className="form-control" value={editDate} onChange={e => setEditDate(e.target.value)} required /></div>
                                    <div className="mb-3"><label className="form-label">Categoría</label><input type="text" className="form-control" value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>
                                    <div className="mb-3"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)}></textarea></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Calculator Widget */}
            <div id="calc-widget" onClick={() => setCalcOpen(true)}><i className="fas fa-calculator"></i></div>
            {calcOpen && (
                <div className="calc-modal" ref={calcRef}>
                    <div className="calc-container">
                        <div className="calc-header">
                            <span><i className="fas fa-calculator"></i> Calculadora</span>
                            <button className="calc-close" onClick={() => setCalcOpen(false)}>×</button>
                        </div>
                        <input type="text" className="calc-screen" value={calcValue} disabled />
                        <div className="calc-grid">
                            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '+'].map(b => (
                                <button key={b} className={['/', '*', '-', '+'].includes(b) ? 'op' : ''} onClick={() => calcPress(b)}>{b}</button>
                            ))}
                            <button className="equal" onClick={() => calcPress('=')}>=</button>
                            <button style={{ gridColumn: 'span 3' }} onClick={() => calcPress('C')}>C</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
