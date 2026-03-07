import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const TIPS = [
  { icon: 'fa-lightbulb',    text: 'Registra cada venta el mismo día para mantener tu historial preciso.' },
  { icon: 'fa-chart-line',   text: 'Los ingresos bien categorizados permiten al análisis IA darte mejores recomendaciones.' },
  { icon: 'fa-calendar-alt', text: 'Registrar la fecha exacta te ayuda a identificar tus mejores temporadas de venta.' },
  { icon: 'fa-tag',          text: 'Usar categorías consistentes facilita comparar meses y tomar decisiones.' },
]

const MES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function IncomeCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ amount: '', date: '', description: '', category: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [stats, setStats]           = useState<{ total: number; prevTotal: number } | null>(null)
  const [tipIdx, setTipIdx]         = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    clientService.getFinances('income')
      .then((data: any) => {
        const all: any[] = data?.finances ?? data?.data ?? []
        const now      = new Date()
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const sum = (m: number, y: number) =>
          all
            .filter((f: any) => {
              const d = new Date(f.date_original ?? f.date ?? '')
              return !isNaN(d.getTime()) && d.getMonth() === m && d.getFullYear() === y
            })
            .reduce((s: number, f: any) => s + Number(f.amount ?? 0), 0)
        setStats({
          total:     sum(now.getMonth(),      now.getFullYear()),
          prevTotal: sum(prevDate.getMonth(), prevDate.getFullYear()),
        })
      }).catch(() => setStats({ total: 0, prevTotal: 0 }))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await clientService.createIncome({
        amount: Number(formData.amount), date: formData.date,
        description: formData.description, category: formData.category,
      })
      navigate('/client/finances')
    } catch { setError('Error al guardar el ingreso.') }
    finally { setSubmitting(false) }
  }

  const amountNum = parseFloat(formData.amount) || 0
  const catLabel  = formData.category || 'Sin categoría'
  const dateLabel = formData.date
    ? new Date(formData.date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const now          = new Date()
  const prevDate     = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMesLabel = MES[now.getMonth()]
  const prevMesLabel = MES[prevDate.getMonth()]
  const pct   = stats
    ? stats.prevTotal === 0
      ? stats.total > 0 ? 100 : 0
      : Math.round(((stats.total - stats.prevTotal) / stats.prevTotal) * 100)
    : 0
  const up    = pct >= 0
  const noRef = stats?.prevTotal === 0 && stats?.total === 0

  return (
    <div className="cf-page-wrap">
      <div className="cf-bg"></div>
      <div className="cf-bg-overlay"></div>
      <div className="cf-page-inner">

        <nav className="cf-breadcrumb">
          <Link to="/client/finances"><i className="fas fa-wallet"></i> Finanzas</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Nuevo Ingreso</span>
        </nav>

        <div className="cf-layout">
          <div className="cf-form-col">
            <div className="income-card">
              <div className="income-header">
                <i className="fas fa-arrow-trend-up"></i> Registrar Ingreso
              </div>
              <div className="income-body">
                <div className="income-icon"><i className="fas fa-hand-holding-dollar"></i></div>
                <div className="cf-eyebrow"><span></span> Nuevo movimiento · Ingresos</div>
                <p className="cf-subtitle">Registra ventas de productos agrícolas, animales u otros ingresos de tu finca.</p>

                {error && (
                  <div className="modern-alert error" style={{ marginBottom: 20 }}>
                    <i className="fas fa-exclamation-triangle"></i> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group-income">
                    <label htmlFor="income_amount"><i className="fas fa-dollar-sign"></i> Monto</label>
                    <div className="cf-input-wrap">
                      <span className="cf-input-prefix">$</span>
                      <input type="number" step="0.01" name="amount" id="income_amount"
                        placeholder="0.00" value={formData.amount} onChange={handleChange}
                        required className="cf-has-prefix" />
                    </div>
                  </div>
                  <div className="form-group-income">
                    <label htmlFor="income_date"><i className="fas fa-calendar-alt"></i> Fecha</label>
                    <input type="date" name="date" id="income_date"
                      value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="form-group-income">
                    <label htmlFor="income_category"><i className="fas fa-tag"></i> Categoría</label>
                    <select name="category" id="income_category" value={formData.category} onChange={handleChange}>
                      <option value="">Sin categoría</option>
                      <option value="Venta de cultivos">Venta de cultivos</option>
                      <option value="Venta de animales">Venta de animales</option>
                      <option value="Venta de leche / huevos">Venta de leche / huevos</option>
                      <option value="Subsidios / apoyos">Subsidios / apoyos</option>
                      <option value="Arriendo de tierra">Arriendo de tierra</option>
                      <option value="Otros ingresos">Otros ingresos</option>
                    </select>
                  </div>
                  <div className="form-group-income">
                    <label htmlFor="income_description"><i className="fas fa-align-left"></i> Descripción</label>
                    <textarea name="description" id="income_description"
                      placeholder="Ej: Venta de productos agrícolas al mercado local..."
                      rows={3} value={formData.description} onChange={handleChange}></textarea>
                  </div>
                  <button type="submit" className="btn-income-submit" disabled={submitting}>
                    {submitting
                      ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                      : <><i className="fas fa-floppy-disk"></i> Guardar Ingreso</>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ════ SIDEBAR ════ */}
          <aside className="cf-sidebar">

            {/* Vista previa */}
            <div className="cf-sidebar-card cf-live-card">
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-eye"></i> Vista previa
                {amountNum > 0 && <span className="cf-live-dot"></span>}
              </div>
              <div className="cf-live-body">
                {amountNum > 0 ? (
                  <>
                    <div className="cf-live-amount">
                      + {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </div>
                    <div className="cf-live-meta">
                      <span><i className="fas fa-tag"></i> {catLabel}</span>
                      {dateLabel && <span><i className="fas fa-calendar"></i> {dateLabel}</span>}
                      {formData.description && (
                        <span className="cf-live-desc">
                          <i className="fas fa-align-left"></i>
                          {formData.description.length > 48 ? formData.description.slice(0, 48) + '…' : formData.description}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="cf-live-empty">
                    <i className="fas fa-pen-to-square"></i>
                    <span>Comienza a llenar el formulario para ver la vista previa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tendencia */}
            <div className="cf-sidebar-card cf-trend-card">
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-calendar"></i> {thisMesLabel} vs {prevMesLabel}
              </div>
              {stats ? (
                <div className="cf-trend-body">
                  {noRef ? (
                    <div className="cf-trend-empty">
                      <i className="fas fa-seedling"></i>
                      <span>Aún no hay registros para comparar</span>
                    </div>
                  ) : (
                    <>
                      <div className={`cf-trend-arrow-wrap ${up ? 'cf-trend-up' : 'cf-trend-down'}`}>
                        <div className="cf-trend-arrow-icon">
                          <i className={`fas ${up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                        </div>
                        <div className="cf-trend-pct">{up ? '+' : ''}{pct}%</div>
                      </div>
                      <div className="cf-trend-totals">
                        <div className="cf-trend-row">
                          <span className="cf-trend-lbl"><i className="fas fa-circle-dot"></i> {thisMesLabel}</span>
                          <span className="cf-trend-val cf-trend-val--main">
                            {stats.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                          </span>
                        </div>
                        <div className="cf-trend-row">
                          <span className="cf-trend-lbl cf-trend-lbl--dim"><i className="fas fa-circle"></i> {prevMesLabel}</span>
                          <span className="cf-trend-val cf-trend-val--dim">
                            {stats.prevTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                          </span>
                        </div>
                      </div>
                      <div className="cf-trend-bars">
                        <div className="cf-trend-bar-row">
                          <span>{thisMesLabel}</span>
                          <div className="cf-trend-bar-track">
                            <div className={`cf-trend-bar-fill ${up ? 'cf-trend-bar-fill--up' : 'cf-trend-bar-fill--down'}`}
                              style={{ width: `${Math.min(100, (stats.total / Math.max(stats.total, stats.prevTotal, 1)) * 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="cf-trend-bar-row">
                          <span>{prevMesLabel}</span>
                          <div className="cf-trend-bar-track">
                            <div className="cf-trend-bar-fill cf-trend-bar-fill--prev"
                              style={{ width: `${Math.min(100, (stats.prevTotal / Math.max(stats.total, stats.prevTotal, 1)) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="cf-stats-loading"><i className="fas fa-circle-notch fa-spin"></i> Cargando…</div>
              )}
            </div>

            {/* Tips */}
            <div className="cf-sidebar-card cf-tips-card">
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-seedling"></i> Consejo del campo
              </div>
              <div className="cf-tip-body">
                <div className="cf-tip-icon"><i className={`fas ${TIPS[tipIdx].icon}`}></i></div>
                <p className="cf-tip-text">{TIPS[tipIdx].text}</p>
                <div className="cf-tip-dots">
                  {TIPS.map((_, i) => (
                    <button key={i} className={`cf-tip-dot ${i === tipIdx ? 'active' : ''}`}
                      onClick={() => setTipIdx(i)} />
                  ))}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}