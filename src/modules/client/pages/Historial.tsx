import { useState, useEffect, useCallback } from 'react'
import { clientService, type FinanceItem } from '../services/clientService'

const TYPE_MAP: Record<string, { badge: string; icon: string; label: string }> = {
    income: { badge: 'bg-success', icon: 'fa-arrow-up', label: 'Ingreso' },
    expense: { badge: 'bg-danger', icon: 'fa-arrow-down', label: 'Gasto' },
    investment: { badge: 'bg-info', icon: 'fa-building', label: 'Inversión' },
    debt: { badge: 'bg-warning text-dark', icon: 'fa-credit-card', label: 'Deuda' },
    inventory: { badge: '', icon: 'fa-boxes', label: 'Inventario' },
    costs: { badge: '', icon: 'fa-seedling', label: 'Costos' },
}

const fmtMoney = (n: number) => '$' + n.toLocaleString('es-CO')

export default function Historial() {
    const [finances, setFinances] = useState<FinanceItem[]>([])
    const [filter, setFilter] = useState('all')
    const [totals, setTotals] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [editItem, setEditItem] = useState<FinanceItem | null>(null)
    const [editAmount, setEditAmount] = useState(''); const [editDate, setEditDate] = useState('')
    const [editCategory, setEditCategory] = useState(''); const [editDesc, setEditDesc] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const d = await clientService.getFinances(filter)
            setFinances(d.finances)
            setTotals({ totalIncome: d.totalIncome, totalExpense: d.totalExpense, balance: d.balance, totalInvestment: d.totalInvestment, totalDebt: d.totalDebt, totalInventory: d.totalInventory, totalCosts: d.totalCosts })
        } finally { setLoading(false) }
    }, [filter])

    useEffect(() => { fetchData() }, [fetchData])

    const handleDelete = async (id: number) => { if (!confirm('¿Seguro que deseas eliminar este registro?')) return; await clientService.deleteFinance(id); fetchData() }
    const handlePayInstallment = async (id: number) => { await clientService.payDebtInstallment(id); fetchData() }
    const openEdit = (f: FinanceItem) => { setEditItem(f); setEditAmount(String(f.amount)); setEditDate(f.date); setEditCategory(f.category ?? ''); setEditDesc(f.description ?? '') }
    const handleEditSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!editItem) return; await clientService.updateFinance(editItem.id, { amount: Number(editAmount), date: editDate, category: editCategory, description: editDesc }); setEditItem(null); fetchData() }

    const FILTER_BTNS: { key: string; cls: string; icon: string; label: string }[] = [
        { key: 'all', cls: 'btn-primary', icon: 'fa-list', label: 'Todos' },
        { key: 'income', cls: 'btn-success', icon: 'fa-arrow-up', label: 'Ingresos' },
        { key: 'expense', cls: 'btn-danger', icon: 'fa-arrow-down', label: 'Gastos' },
        { key: 'investment', cls: 'btn-info', icon: 'fa-building', label: 'Inversiones' },
        { key: 'debt', cls: 'btn-warning', icon: 'fa-credit-card', label: 'Deudas' },
        { key: 'inventory', cls: 'btn-secondary', icon: 'fa-boxes', label: 'Inventario' },
        { key: 'costs', cls: 'btn-dark', icon: 'fa-seedling', label: 'Costos' },
    ]

    return (
        <div className="container my-4">
            <div className="card shadow-sm">
                <div className="card-header bg-success text-white fw-bold"><i className="fas fa-history"></i> Historial de Finanzas</div>
                <div className="card-body">
                    <div className="mb-3 d-flex flex-wrap gap-2">
                        {FILTER_BTNS.map(b => (
                            <button key={b.key} className={`btn btn-sm ${filter === b.key ? b.cls : `btn-outline-${b.cls.replace('btn-', '')}`}`}
                                style={b.key === 'inventory' ? { '--bs-btn-color': '#a855f7', '--bs-btn-border-color': '#a855f7' } as React.CSSProperties : b.key === 'costs' ? { '--bs-btn-color': '#14b8a6', '--bs-btn-border-color': '#14b8a6' } as React.CSSProperties : undefined}
                                onClick={() => setFilter(b.key)}><i className={`fas ${b.icon}`}></i> {b.label}</button>
                        ))}
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-4"><div className="card text-white bg-success mb-3"><div className="card-body"><h6 className="card-title"><i className="fas fa-arrow-up"></i> Total Ingresos</h6><h3>{fmtMoney(totals.totalIncome ?? 0)}</h3></div></div></div>
                        <div className="col-md-4"><div className="card text-white bg-danger mb-3"><div className="card-body"><h6 className="card-title"><i className="fas fa-arrow-down"></i> Total Gastos</h6><h3>{fmtMoney(totals.totalExpense ?? 0)}</h3></div></div></div>
                        <div className="col-md-4"><div className={`card text-white ${(totals.balance ?? 0) >= 0 ? 'bg-primary' : 'bg-warning'} mb-3`}><div className="card-body"><h6 className="card-title"><i className="fas fa-balance-scale"></i> Balance</h6><h3>{fmtMoney(totals.balance ?? 0)}</h3></div></div></div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-md-3"><div className="card text-white bg-info mb-3"><div className="card-body p-2"><h6 className="card-title mb-1"><i className="fas fa-building"></i> Inversiones</h6><p className="mb-0">{fmtMoney(totals.totalInvestment ?? 0)}</p></div></div></div>
                        <div className="col-md-3"><div className="card text-white bg-warning mb-3"><div className="card-body p-2"><h6 className="card-title mb-1"><i className="fas fa-credit-card"></i> Deudas</h6><p className="mb-0">{fmtMoney(totals.totalDebt ?? 0)}</p></div></div></div>
                        <div className="col-md-3"><div className="card text-white mb-3" style={{ backgroundColor: '#a855f7' }}><div className="card-body p-2"><h6 className="card-title mb-1"><i className="fas fa-boxes"></i> Inventario</h6><p className="mb-0">{fmtMoney(totals.totalInventory ?? 0)}</p></div></div></div>
                        <div className="col-md-3"><div className="card text-white mb-3" style={{ backgroundColor: '#14b8a6' }}><div className="card-body p-2"><h6 className="card-title mb-1"><i className="fas fa-seedling"></i> Costos</h6><p className="mb-0">{fmtMoney(totals.totalCosts ?? 0)}</p></div></div></div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover">
                            <thead className="table-dark">
                                <tr><th><i className="fas fa-calendar"></i> Fecha</th><th><i className="fas fa-tag"></i> Tipo</th><th><i className="fas fa-dollar-sign"></i> Monto</th><th><i className="fas fa-info-circle"></i> Detalles</th><th><i className="fas fa-align-left"></i> Descripción</th><th><i className="fas fa-cog"></i> Acciones</th></tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan={6} className="text-center"><i className="fas fa-spinner fa-spin"></i></td></tr>
                                    : finances.length === 0 ? <tr><td colSpan={6} className="text-center text-muted"><i className="fas fa-inbox fa-3x mb-2"></i><p>No hay registros para este filtro</p></td></tr>
                                        : finances.map(f => {
                                            const t = TYPE_MAP[f.type]
                                            return (
                                                <tr key={f.id}>
                                                    <td>{f.date ?? 'N/A'}</td>
                                                    <td><span className={`badge ${t?.badge}`} style={f.type === 'inventory' ? { backgroundColor: '#a855f7' } : f.type === 'costs' ? { backgroundColor: '#14b8a6' } : undefined}><i className={`fas ${t?.icon}`}></i> {t?.label}</span></td>
                                                    <td><strong>{fmtMoney(f.amount)}</strong></td>
                                                    <td>
                                                        {f.type === 'investment' && f.asset_name && <small className="text-muted"><i className="fas fa-tools"></i> {f.asset_name}</small>}
                                                        {f.type === 'debt' && f.creditor && <small className="text-muted"><i className="fas fa-university"></i> {f.creditor}{f.paid_installments != null && f.installments && <><br /><i className="fas fa-check-circle"></i> {f.paid_installments}/{f.installments} cuotas</>}</small>}
                                                        {f.type === 'inventory' && f.product_name && <small className="text-muted"><i className="fas fa-box"></i> {f.product_name}{f.quantity != null && f.unit && <><br />{f.quantity} {f.unit}</>}</small>}
                                                        {f.type === 'costs' && f.crop_name && <small className="text-muted"><i className="fas fa-leaf"></i> {f.crop_name}{f.area && <><br />{f.area} ha</>}</small>}
                                                        {!['investment', 'debt', 'inventory', 'costs'].includes(f.type) && <small className="text-muted">-</small>}
                                                        {f.category && <><br /><span className="badge badge-sm bg-secondary">{f.category}</span></>}
                                                    </td>
                                                    <td>{f.description ?? '-'}</td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <button className="btn btn-outline-primary btn-sm" onClick={() => openEdit(f)} title="Editar"><i className="fas fa-edit"></i></button>
                                                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(f.id)} title="Eliminar"><i className="fas fa-trash-alt"></i></button>
                                                            {f.type === 'debt' && f.paid_installments != null && f.installments != null && f.paid_installments < f.installments && (
                                                                <button className="btn btn-outline-success btn-sm" onClick={() => handlePayInstallment(f.id)} title="Pagar cuota"><i className="fas fa-money-bill-wave"></i></button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {editItem && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog"><div className="modal-content">
                        <div className="modal-header"><h5 className="modal-title"><i className="fas fa-edit"></i> Editar Transacción</h5><button type="button" className="btn-close" onClick={() => setEditItem(null)}></button></div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div className="mb-3"><label className="form-label">Monto</label><input type="number" step="0.01" className="form-control" value={editAmount} onChange={e => setEditAmount(e.target.value)} required /></div>
                                <div className="mb-3"><label className="form-label">Fecha</label><input type="date" className="form-control" value={editDate} onChange={e => setEditDate(e.target.value)} required /></div>
                                <div className="mb-3"><label className="form-label">Categoría</label><input type="text" className="form-control" value={editCategory} onChange={e => setEditCategory(e.target.value)} /></div>
                                <div className="mb-3"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>Cerrar</button><button type="submit" className="btn btn-primary">Guardar Cambios</button></div>
                        </form>
                    </div></div>
                </div>
            )}
        </div>
    )
}
