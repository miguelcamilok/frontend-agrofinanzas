import { useState, useEffect, useCallback, useRef } from 'react'
import { clientService, type FinanceItem } from '../services/clientService'
import {
    Chart,
    BarController, LineController, DoughnutController,
    BarElement, LineElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js'
import './ClientFinances.css'

Chart.register(
    BarController, LineController, DoughnutController,
    BarElement, LineElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Tooltip, Legend
)

/* ── Constants ─────────────────────────────────────────────── */
const FILTER_OPTIONS = [
    { key: 'all',        label: 'Todos',       icon: 'fa-th-large' },
    { key: 'income',     label: 'Ingresos',    icon: 'fa-arrow-trend-up' },
    { key: 'expense',    label: 'Gastos',      icon: 'fa-arrow-trend-down' },
    { key: 'investment', label: 'Inversiones', icon: 'fa-building' },
    { key: 'debt',       label: 'Deudas',      icon: 'fa-credit-card' },
    { key: 'inventory',  label: 'Inventario',  icon: 'fa-boxes-stacked' },
    { key: 'costs',      label: 'Costos',      icon: 'fa-seedling' },
]

const TYPE_BADGE: Record<string, { cls: string; icon: string; label: string }> = {
    income:     { cls: 'badge-income',     icon: 'fa-arrow-trend-up',   label: 'Ingreso' },
    expense:    { cls: 'badge-expense',    icon: 'fa-arrow-trend-down', label: 'Gasto' },
    investment: { cls: 'badge-investment', icon: 'fa-building',         label: 'Inversión' },
    debt:       { cls: 'badge-debt',       icon: 'fa-credit-card',      label: 'Deuda' },
    inventory:  { cls: 'badge-inventory',  icon: 'fa-boxes-stacked',    label: 'Inventario' },
    costs:      { cls: 'badge-costs',      icon: 'fa-seedling',         label: 'Costos' },
}

const SUMMARY_CARDS = [
    { key: 'totalIncome',     label: 'Ingresos',    icon: 'fa-arrow-trend-up',   cls: 'income' },
    { key: 'totalExpense',    label: 'Gastos',      icon: 'fa-arrow-trend-down', cls: 'expense' },
    { key: 'balance',         label: 'Balance',     icon: 'fa-scale-balanced',   cls: 'balance' },
    { key: 'totalInvestment', label: 'Inversiones', icon: 'fa-building',         cls: 'investment' },
    { key: 'totalDebt',       label: 'Deudas',      icon: 'fa-credit-card',      cls: 'debt' },
    { key: 'totalInventory',  label: 'Inventario',  icon: 'fa-boxes-stacked',    cls: 'inventory' },
    { key: 'totalCosts',      label: 'Costos',      icon: 'fa-seedling',         cls: 'costs' },
]

/* ── Paleta Tierra y Campo para Chart.js ──────────────────── */
const C = {
    income:    '#7AAF5A',
    expense:   '#c0392b',
    invest:    '#5B8DB8',
    debt:      '#D4841A',
    inventory: '#9b7ed4',
    costs:     '#A0522D',
    paja:      '#C8A96E',
    pajaL:     '#dfc48c',
}
const GRID  = 'rgba(200,169,110,.08)'
const TCLR  = 'rgba(200,169,110,.4)'
const TFONT = { family: "'Source Sans 3'", size: 11 } as const
const mFmt  = (v: number | string) => '$' + Number(v).toLocaleString('es-CO')
const SCALE = {
    x: { grid: { color: GRID }, ticks: { color: TCLR, font: TFONT } },
    y: { grid: { color: GRID }, ticks: { color: TCLR, font: TFONT, callback: mFmt } },
}

/* ── Helpers ──────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
    '$' + Math.abs(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtDate = (raw: string | undefined): string => {
    if (!raw) return '—'
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* ── Chart registry ───────────────────────────────────────── */
const charts: Record<string, Chart> = {}
const destroyChart = (id: string) => { if (charts[id]) { charts[id].destroy(); delete charts[id] } }

function buildMonthly(finances: FinanceItem[]) {
    const map: Record<string, { inc: number; exp: number }> = {}
    finances.forEach(f => {
        const k = (f.date_original ?? f.date ?? '').slice(0, 7)
        if (k.length < 7) return
        if (!map[k]) map[k] = { inc: 0, exp: 0 }
        if (f.type === 'income')  map[k].inc += f.amount
        if (f.type === 'expense') map[k].exp += f.amount
    })
    const keys = Object.keys(map).sort()
    return {
        labels:  keys.map(k => { const [y, m] = k.split('-'); return `${m}/${y.slice(2)}` }),
        income:  keys.map(k => map[k].inc),
        expense: keys.map(k => map[k].exp),
        balance: keys.reduce<number[]>((acc, k, i) => { acc.push((i ? acc[i - 1] : 0) + map[k].inc - map[k].exp); return acc }, []),
    }
}

function buildByCat(finances: FinanceItem[]) {
    const map: Record<string, number> = {}
    finances.forEach(f => { const k = f.category || f.type; map[k] = (map[k] ?? 0) + f.amount })
    const keys = Object.keys(map)
    const palette = [C.income, C.expense, C.invest, C.debt, C.inventory, C.costs, C.paja]
    return {
        labels: keys,
        data: keys.map(k => map[k]),
        colors: keys.map((_, i) => palette[i % palette.length]),
    }
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ClientFinances() {
    const [filter, setFilter]       = useState('all')
    const [finances, setFinances]   = useState<FinanceItem[]>([])
    const [totals, setTotals]       = useState<Record<string, number>>({})
    const [loading, setLoading]     = useState(true)
    const [exporting, setExporting] = useState(false)
    const [alert, setAlert]         = useState<{ type: string; msg: string } | null>(null)

    const [dateFrom, setDateFrom] = useState('')
    const [dateTo,   setDateTo]   = useState('')
    const [activeDR, setActiveDR] = useState<{ from: string; to: string } | null>(null)

    const [editItem,     setEditItem]     = useState<FinanceItem | null>(null)
    const [editAmount,   setEditAmount]   = useState('')
    const [editDate,     setEditDate]     = useState('')
    const [editCategory, setEditCategory] = useState('')
    const [editDesc,     setEditDesc]     = useState('')

    const [calcOpen,  setCalcOpen]  = useState(false)
    const [calcValue, setCalcValue] = useState('')

    const heroBgRef = useRef<HTMLDivElement>(null)

    /* ── Parallax ── */
    useEffect(() => {
        const onScroll = () => {
            const el = heroBgRef.current
            if (!el) return
            const s = window.scrollY
            el.style.opacity   = String(Math.max(0.15, 1 - s / 340))
            el.style.transform = `translateY(${s * 0.18}px)`
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* ── Fetch ── */
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const d = await clientService.getFinances(filter)
            let items = d.finances
            if (activeDR?.from || activeDR?.to) {
                items = items.filter(f => {
                    const dt = (f.date_original ?? f.date ?? '').slice(0, 10)
                    if (activeDR.from && dt < activeDR.from) return false
                    if (activeDR.to   && dt > activeDR.to)   return false
                    return true
                })
            }
            setFinances(items)
            setTotals({
                totalIncome:     d.totalIncome,
                totalExpense:    d.totalExpense,
                balance:         d.balance,
                totalInvestment: d.totalInvestment,
                totalDebt:       d.totalDebt,
                totalInventory:  d.totalInventory,
                totalCosts:      d.totalCosts,
            })
        } finally { setLoading(false) }
    }, [filter, activeDR])

    useEffect(() => { fetchData() }, [fetchData])

    /* ── Charts ── */
    useEffect(() => {
        if (loading) return
        const monthly = buildMonthly(finances)
        const byCat   = buildByCat(finances)

        destroyChart('ch1')
        const el1 = document.getElementById('ch1') as HTMLCanvasElement | null
        if (el1) charts['ch1'] = new Chart(el1, {
            type: 'doughnut',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    data: [totals.totalIncome ?? 0, totals.totalExpense ?? 0],
                    backgroundColor: [C.income + 'cc', C.expense + 'cc'],
                    borderColor: [C.income, C.expense],
                    borderWidth: 2, hoverOffset: 7,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '58%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: TCLR, font: TFONT, boxWidth: 10, padding: 14 } },
                },
            },
        })

        destroyChart('ch2')
        const el2 = document.getElementById('ch2') as HTMLCanvasElement | null
        if (el2) charts['ch2'] = new Chart(el2, {
            type: 'bar',
            data: {
                labels: monthly.labels,
                datasets: [
                    { label: 'Ingresos', data: monthly.income,  backgroundColor: C.income  + '88', borderColor: C.income,  borderWidth: 1.5, borderRadius: 3 },
                    { label: 'Gastos',   data: monthly.expense, backgroundColor: C.expense + '88', borderColor: C.expense, borderWidth: 1.5, borderRadius: 3 },
                ],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: TCLR, font: TFONT, boxWidth: 9 } } },
                scales: SCALE,
            },
        })

        destroyChart('ch3')
        const el3 = document.getElementById('ch3') as HTMLCanvasElement | null
        if (el3) charts['ch3'] = new Chart(el3, {
            type: 'line',
            data: {
                labels: monthly.labels,
                datasets: [{
                    label: 'Balance',
                    data: monthly.balance,
                    borderColor: C.paja,
                    backgroundColor: C.paja + '18',
                    borderWidth: 2, pointRadius: 4,
                    pointBackgroundColor: C.paja, tension: .4, fill: true,
                }],
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: TCLR, font: TFONT, boxWidth: 9 } } },
                scales: SCALE,
            },
        })

        destroyChart('ch4')
        const el4 = document.getElementById('ch4') as HTMLCanvasElement | null
        if (el4) charts['ch4'] = new Chart(el4, {
            type: 'bar',
            data: {
                labels: byCat.labels,
                datasets: [{
                    label: 'Monto',
                    data: byCat.data,
                    backgroundColor: byCat.colors.map(c => c + '99'),
                    borderColor:     byCat.colors,
                    borderWidth: 1.5, borderRadius: 3,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: GRID }, ticks: { color: TCLR, font: TFONT, callback: mFmt } },
                    y: { grid: { color: GRID }, ticks: { color: TCLR, font: TFONT } },
                },
            },
        })

        return () => { ['ch1', 'ch2', 'ch3', 'ch4'].forEach(destroyChart) }
    }, [finances, totals, loading])

    /* ── Handlers ── */
    const handleExportPDF = async () => {
        setExporting(true)
        try {
            const blob = await clientService.exportFinancesPDF({ filter, date_from: activeDR?.from ?? '', date_to: activeDR?.to ?? '' })
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href = url; a.download = `historial-financiero-${new Date().toISOString().slice(0, 10)}.pdf`
            a.click(); URL.revokeObjectURL(url)
            setAlert({ type: 'success', msg: 'PDF descargado correctamente.' })
        } catch {
            setAlert({ type: 'error', msg: 'Error al generar el PDF.' })
        }
        setExporting(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este registro?')) return
        await clientService.deleteFinance(id)
        setAlert({ type: 'success', msg: 'Registro eliminado.' })
        fetchData()
    }

    const handlePayInstallment = async (id: number) => {
        await clientService.payDebtInstallment(id)
        setAlert({ type: 'success', msg: 'Cuota pagada.' })
        fetchData()
    }

    const openEdit = (f: FinanceItem) => {
        setEditItem(f)
        setEditAmount(String(f.amount))
        setEditDate((f.date_original ?? f.date ?? '').slice(0, 10))
        setEditCategory(f.category ?? '')
        setEditDesc(f.description ?? '')
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editItem) return
        await clientService.updateFinance(editItem.id, {
            amount: Number(editAmount), date: editDate,
            category: editCategory, description: editDesc,
        })
        setEditItem(null)
        setAlert({ type: 'success', msg: 'Transacción actualizada.' })
        fetchData()
    }

    const calcPress = (v: string) => {
        if (v === '=')      { try { setCalcValue(String(eval(calcValue))) } catch { setCalcValue('Error') } } // eslint-disable-line
        else if (v === 'C') { setCalcValue('') }
        else                { setCalcValue(p => p + v) }
    }

    useEffect(() => {
        if (alert) { const t = setTimeout(() => setAlert(null), 5000); return () => clearTimeout(t) }
    }, [alert])

    const renderDetails = (f: FinanceItem) => {
        switch (f.type) {
            case 'investment':
                return f.asset_name ? <div className="detail-item"><i className="fas fa-tools"></i><span>{f.asset_name}</span></div> : null
            case 'debt':
                return (
                    <>
                        {f.creditor && <div className="detail-item"><i className="fas fa-building-columns"></i><span>{f.creditor}</span></div>}
                        {f.paid_installments != null && f.installments != null && (
                            <span className="progress-indicator">{f.paid_installments}/{f.installments} cuotas</span>
                        )}
                    </>
                )
            case 'inventory':
                return (
                    <>
                        {f.product_name && <div className="detail-item"><i className="fas fa-box"></i><span>{f.product_name}</span></div>}
                        {f.quantity != null && f.unit && <div className="detail-item"><i className="fas fa-weight-scale"></i><span>{f.quantity} {f.unit}</span></div>}
                    </>
                )
            case 'costs':
                return (
                    <>
                        {f.crop_name && <div className="detail-item"><i className="fas fa-leaf"></i><span>{f.crop_name}</span></div>}
                        {f.area && <div className="detail-item"><i className="fas fa-map"></i><span>{f.area} ha</span></div>}
                    </>
                )
            default:
                return <span style={{ color: 'rgba(200,169,110,.3)', fontSize: '.75rem' }}>—</span>
        }
    }

    /* ══ JSX ══ */
    return (
        <div className="finance-dashboard">

            {alert && (
                <div className={`modern-alert ${alert.type}`}>
                    <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                    <span>{alert.msg}</span>
                </div>
            )}

            {/* ════ HERO ════ */}
            <div className="finance-hero">
                <div className="finance-hero-bg" ref={heroBgRef}></div>

                <div className="finance-hero-top">
                    <div className="finance-hero-left">
                        <div className="finance-hero-tag">Panel Financiero · AgroFinanzas</div>
                        <h1 className="finance-hero-title">
                            Historial <em>Financiero</em>
                        </h1>
                        <p className="finance-hero-sub">Análisis completo de tus movimientos agropecuarios</p>

                        <div className="finance-hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-label">Ingresos</span>
                                <span className="hero-stat-value positive">{fmtMoney(totals.totalIncome ?? 0)}</span>
                            </div>
                            <div className="hero-stat-div" />
                            <div className="hero-stat">
                                <span className="hero-stat-label">Gastos</span>
                                <span className="hero-stat-value negative">{fmtMoney(totals.totalExpense ?? 0)}</span>
                            </div>
                            <div className="hero-stat-div" />
                            <div className="hero-stat">
                                <span className="hero-stat-label">Balance</span>
                                <span className={`hero-stat-value ${(totals.balance ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                                    {fmtMoney(totals.balance ?? 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="finance-hero-actions">
                        <button className="btn-export" onClick={handleExportPDF} disabled={exporting}>
                            <i className={`fas ${exporting ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                            {exporting ? 'Generando…' : 'Exportar PDF'}
                        </button>
                    </div>
                </div>

                <div className="finance-hero-bar">
                    <div className="hero-filters">
                        {FILTER_OPTIONS.map(f => (
                            <button
                                key={f.key}
                                className={`filter-button ${f.key} ${filter === f.key ? 'active' : ''}`}
                                onClick={() => setFilter(f.key)}
                            >
                                <i className={`fas ${f.icon}`}></i> {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="hero-bar-div" />
                    <div className="hero-dates">
                        <label><i className="fas fa-calendar-days"></i> Desde</label>
                        <input type="date" className="date-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        <span className="date-sep">→</span>
                        <label><i className="fas fa-calendar-days"></i> Hasta</label>
                        <input type="date" className="date-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        <button className="btn-date-apply" onClick={() => { if (dateFrom || dateTo) setActiveDR({ from: dateFrom, to: dateTo }) }}>
                            <i className="fas fa-magnifying-glass"></i> Filtrar
                        </button>
                        {activeDR && (
                            <button className="btn-date-clear" onClick={() => { setDateFrom(''); setDateTo(''); setActiveDR(null) }}>
                                <i className="fas fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ════ KPI CARDS ════ */}
            <div className="summary-grid">
                {SUMMARY_CARDS.map((c, i) => (
                    <div key={c.key} className={`summary-card ${c.cls}`} style={{ animationDelay: `${i * .05}s` }}>
                        <div className="summary-card-header">
                            <div className="summary-card-icon"><i className={`fas ${c.icon}`}></i></div>
                            {c.label}
                        </div>
                        <p className="summary-card-value">{fmtMoney(totals[c.key] ?? 0)}</p>
                        {c.key === 'balance' && (
                            <span className={`summary-card-trend ${(totals.balance ?? 0) >= 0 ? 'trend-up' : 'trend-down'}`}>
                                <i className={`fas fa-arrow-${(totals.balance ?? 0) >= 0 ? 'up' : 'down'}`}></i>
                                {(totals.balance ?? 0) >= 0 ? 'Positivo' : 'Negativo'}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* ════ TABLA ════ */}
            <div className="section-heading">
                <span className="section-heading-tag"><i className="fas fa-table-list"></i> Historial de Transacciones</span>
                <span className="section-heading-line"></span>
                {!loading && <span className="section-heading-count">{finances.length} registros</span>}
            </div>

            <div className="table-container">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th><i className="fas fa-calendar"></i> Fecha</th>
                            <th><i className="fas fa-tag"></i> Tipo</th>
                            <th><i className="fas fa-dollar-sign"></i> Monto</th>
                            <th><i className="fas fa-info-circle"></i> Detalles</th>
                            <th><i className="fas fa-align-left"></i> Descripción</th>
                            <th><i className="fas fa-cog"></i> Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: 60 }}>
                                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.8rem', color: 'var(--paja)' }}></i>
                                </td>
                            </tr>
                        ) : finances.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">
                                        <i className="fas fa-inbox"></i>
                                        <p className="empty-state-title">Sin registros</p>
                                        <p className="empty-state-text">Cambia el filtro o registra una nueva transacción</p>
                                    </div>
                                </td>
                            </tr>
                        ) : finances.map(f => {
                            const badge       = TYPE_BADGE[f.type]
                            const dateDisplay = f.date_formatted ?? fmtDate(f.date_original ?? f.date)
                            return (
                                <tr key={f.id}>
                                    <td className="date-column">{dateDisplay}</td>
                                    <td>
                                        {badge && (
                                            <span className={`type-badge ${badge.cls}`}>
                                                <i className={`fas ${badge.icon}`}></i> {badge.label}
                                            </span>
                                        )}
                                    </td>
                                    <td className="amount-column">{fmtMoney(f.amount)}</td>
                                    <td>
                                        <div className="details-content">
                                            {renderDetails(f)}
                                            {f.category && <span className="category-badge">{f.category}</span>}
                                        </div>
                                    </td>
                                    <td style={{ color: 'rgba(200,169,110,.4)', fontSize: '.81rem' }}>{f.description ?? '—'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" title="Editar" onClick={() => openEdit(f)}>
                                                <i className="fas fa-pen"></i>
                                            </button>
                                            <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(f.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                            {f.type === 'debt' && f.paid_installments != null && f.installments != null && f.paid_installments < f.installments && (
                                                <button className="action-btn pay" title="Pagar cuota" onClick={() => handlePayInstallment(f.id)}>
                                                    <i className="fas fa-dollar-sign"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* ════ ANALYTICS ════ */}
            <div className="analytics-section">
                <div className="analytics-header">
                    <h2 className="analytics-title">
                        <i className="fas fa-chart-bar"></i>
                        Análisis <em>Visual</em>
                    </h2>
                </div>
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-card-title"><i className="fas fa-chart-pie"></i> Ingresos vs Gastos</h3>
                        <div className="chart-canvas"><canvas id="ch1"></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3 className="chart-card-title"><i className="fas fa-chart-column"></i> Tendencia Mensual</h3>
                        <div className="chart-canvas"><canvas id="ch2"></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3 className="chart-card-title"><i className="fas fa-chart-line"></i> Balance Acumulado</h3>
                        <div className="chart-canvas"><canvas id="ch3"></canvas></div>
                    </div>
                    <div className="chart-card">
                        <h3 className="chart-card-title"><i className="fas fa-list-ol"></i> Por Categoría</h3>
                        <div className="chart-canvas"><canvas id="ch4"></canvas></div>
                    </div>
                </div>
            </div>

            {/* ════ MODAL EDITAR ════ */}
            {editItem && (
                <div className="fd-overlay" onClick={e => { if (e.target === e.currentTarget) setEditItem(null) }}>
                    <div className="fd-modal">
                        <div className="fd-modal-header">
                            <div className="fd-modal-title">
                                <i className="fas fa-pen-to-square"></i> Editar Transacción
                            </div>
                            <button className="fd-modal-close" onClick={() => setEditItem(null)}>
                                <i className="fas fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="fd-modal-body">
                                <div className="fd-field">
                                    <label className="fd-label">Monto</label>
                                    <input type="number" step="0.01" className="fd-input" value={editAmount} onChange={e => setEditAmount(e.target.value)} required />
                                </div>
                                <div className="fd-field">
                                    <label className="fd-label">Fecha</label>
                                    <input type="date" className="fd-input" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                                </div>
                                <div className="fd-field">
                                    <label className="fd-label">Categoría</label>
                                    <input type="text" className="fd-input" value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Opcional" />
                                </div>
                                <div className="fd-field">
                                    <label className="fd-label">Descripción</label>
                                    <textarea className="fd-input" rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Opcional" style={{ resize: 'vertical', minHeight: 74 }}></textarea>
                                </div>
                            </div>
                            <div className="fd-modal-footer">
                                <button type="button" className="fd-btn-cancel" onClick={() => setEditItem(null)}>Cancelar</button>
                                <button type="submit" className="fd-btn-save"><i className="fas fa-check"></i> Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ CALCULADORA ════ */}
            <div id="calc-widget" onClick={() => setCalcOpen(true)} title="Calculadora">
                <i className="fas fa-calculator"></i>
            </div>

            {calcOpen && (
                <div className="calc-modal">
                    <div className="calc-container">
                        <div className="calc-header">
                            <span><i className="fas fa-calculator"></i> Calculadora</span>
                            <button className="calc-close" onClick={() => setCalcOpen(false)}>×</button>
                        </div>
                        <input className="calc-screen" value={calcValue} readOnly />
                        <div className="calc-grid">
                            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '+'].map(b => (
                                <button key={b} className={['/', '+', '-', '*'].includes(b) ? 'op' : ''} onClick={() => calcPress(b)}>{b}</button>
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