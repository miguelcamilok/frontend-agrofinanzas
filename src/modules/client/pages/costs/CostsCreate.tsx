import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const TIPS = [
  { icon: 'fa-seedling',    text: 'Registrar el ciclo de producción te permite comparar costos entre cosechas del mismo cultivo.' },
  { icon: 'fa-calculator',  text: 'El costo por hectárea es el indicador clave para saber si tu cultivo es rentable.' },
  { icon: 'fa-leaf',        text: 'Separar los costos por tipo (semillas, mano de obra, etc.) facilita reducirlos uno a uno.' },
  { icon: 'fa-chart-line',  text: 'Un agricultor que conoce sus costos exactos negocia mejores precios de venta.' },
]

export default function CostsCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    date: '', amount: '', crop_name: '', area: '',
    cost_per_unit: '', production_cycle: '', category: '', description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [tipIdx, setTipIdx]         = useState(0)
  const [incomeTotal, setIncomeTotal] = useState<number | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Cargar ingresos del mes para estimar rentabilidad
  useEffect(() => {
    clientService.getFinances('income')
      .then((data: any) => {
        const all: any[] = data?.finances ?? data?.data ?? []
        const now = new Date()
        const total = all
          .filter((f: any) => {
            const d = new Date(f.date_original ?? f.date ?? '')
            return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          })
          .reduce((s: number, f: any) => s + Number(f.amount ?? 0), 0)
        setIncomeTotal(total)
      }).catch(() => setIncomeTotal(0))
  }, [])

  useEffect(() => {
    const a = parseFloat(formData.amount) || 0
    const ar = parseFloat(formData.area) || 0
    if (a > 0 && ar > 0) {
      setFormData(prev => ({ ...prev, cost_per_unit: (a / ar).toFixed(2) }))
    }
  }, [formData.amount, formData.area])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await clientService.createCosts({
        date: formData.date, amount: Number(formData.amount),
        crop_name: formData.crop_name,
        area: formData.area ? Number(formData.area) : undefined,
        cost_per_unit: formData.cost_per_unit ? Number(formData.cost_per_unit) : undefined,
        production_cycle: formData.production_cycle || undefined,
        category: formData.category || undefined,
        description: formData.description
      })
      navigate('/client/finances')
    } catch { setError('Hubo un error al registrar los costos.') }
    finally { setSubmitting(false) }
  }

  const amountNum  = parseFloat(formData.amount) || 0
  const areaNum    = parseFloat(formData.area) || 0
  const cpuNum     = parseFloat(formData.cost_per_unit) || 0
  const costPerHa  = cpuNum ? cpuNum.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : null

  // Rentabilidad estimada
  const rentabilidad = incomeTotal !== null && amountNum > 0
    ? incomeTotal - amountNum : null
  const rentPct = incomeTotal && amountNum > 0
    ? Math.round(((incomeTotal - amountNum) / incomeTotal) * 100) : null

  return (
    <div className="cf-page-wrap">
      <div className="cf-bg"></div>
      <div className="cf-bg-overlay"></div>
      <div className="cf-page-inner">

        <nav className="cf-breadcrumb">
          <Link to="/client/finances"><i className="fas fa-wallet"></i> Finanzas</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Nuevo Costo</span>
        </nav>

        <div className="cf-layout">
          <div className="cf-form-col">
            <div className="costs-card">
              <div className="costs-header">
                <i className="fas fa-seedling"></i> Registrar Costos de Producción
              </div>
              <div className="costs-body">
                <div className="costs-icon"><i className="fas fa-tractor"></i></div>
                <div className="cf-eyebrow"><span></span> Nueva partida · Costos</div>
                <p className="cf-subtitle">Registra los costos de cada cultivo o ciclo productivo para calcular tu rentabilidad por hectárea.</p>

                {error && <div className="modern-alert error" style={{ marginBottom: 20 }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group-costs">
                      <label htmlFor="costs_date"><i className="fas fa-calendar-alt"></i> Fecha *</label>
                      <input type="date" name="date" id="costs_date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group-costs">
                      <label htmlFor="costs_amount"><i className="fas fa-dollar-sign"></i> Costo total *</label>
                      <div className="cf-input-wrap">
                        <span className="cf-input-prefix">$</span>
                        <input type="number" step="0.01" name="amount" id="costs_amount"
                          placeholder="0.00" value={formData.amount} onChange={handleChange} required className="cf-has-prefix" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group-costs">
                    <label htmlFor="costs_crop"><i className="fas fa-leaf"></i> Cultivo / Producción *</label>
                    <input type="text" name="crop_name" id="costs_crop"
                      placeholder="Ej: Maíz, Café, Aguacate Hass..." value={formData.crop_name} onChange={handleChange} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group-costs">
                      <label htmlFor="costs_area"><i className="fas fa-map"></i> Área (hectáreas)</label>
                      <input type="number" step="0.01" name="area" id="costs_area"
                        placeholder="Ej: 5" value={formData.area} onChange={handleChange} />
                    </div>
                    <div className="form-group-costs">
                      <label htmlFor="costs_per_unit"><i className="fas fa-calculator"></i> Costo / Hectárea</label>
                      <input type="number" step="0.01" name="cost_per_unit" id="costs_per_unit"
                        placeholder="Auto-calculado" value={formData.cost_per_unit} onChange={handleChange} />
                    </div>
                  </div>

                  {costPerHa && (
                    <div className="cf-calc-pill cf-calc-pill--tierra">
                      <i className="fas fa-seedling"></i> Costo por hectárea: <strong>${costPerHa}</strong>
                      <span className="cf-calc-badge">auto</span>
                    </div>
                  )}

                  <div className="form-group-costs">
                    <label htmlFor="costs_cycle"><i className="fas fa-sync-alt"></i> Ciclo de producción</label>
                    <input type="text" name="production_cycle" id="costs_cycle"
                      placeholder="Ej: Semestre A 2024 / Cosecha principal" value={formData.production_cycle} onChange={handleChange} />
                  </div>

                  <div className="form-group-costs">
                    <label htmlFor="costs_category"><i className="fas fa-tag"></i> Tipo de costo</label>
                    <select name="category" id="costs_category" value={formData.category} onChange={handleChange}>
                      <option value="">Seleccionar...</option>
                      <option value="Semillas">Semillas</option>
                      <option value="Fertilizante">Fertilizante</option>
                      <option value="Mano de obra">Mano de obra</option>
                      <option value="Maquinaria">Uso de maquinaria</option>
                      <option value="Riego">Sistema de riego</option>
                      <option value="Plaguicidas">Plaguicidas</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group-costs">
                    <label htmlFor="costs_description"><i className="fas fa-align-left"></i> Descripción</label>
                    <textarea name="description" id="costs_description"
                      placeholder="Ej: Costos de siembra y preparación del terreno..." rows={3}
                      value={formData.description} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="btn-costs-submit" disabled={submitting}>
                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-floppy-disk"></i> Guardar Costos</>}
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
                {amountNum > 0 && <span className="cf-live-dot" style={{ background: 'var(--tierra)', boxShadow: '0 0 0 3px rgba(107,61,20,.2)' }}></span>}
              </div>
              <div className="cf-live-body">
                {amountNum > 0 ? (
                  <>
                    <div className="cf-live-amount" style={{ color: 'var(--tierra)' }}>
                      {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </div>
                    <div className="cf-live-meta">
                      {formData.crop_name && <span><i className="fas fa-leaf"></i> {formData.crop_name}</span>}
                      {areaNum > 0 && <span><i className="fas fa-map"></i> {areaNum} ha</span>}
                      {formData.category && <span><i className="fas fa-tag"></i> {formData.category}</span>}
                      {formData.production_cycle && <span><i className="fas fa-sync-alt"></i> {formData.production_cycle}</span>}
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

            {/* Rentabilidad estimada */}
            <div className="cf-sidebar-card" style={{ borderTop: '3px solid var(--tierra)' }}>
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-chart-pie"></i> Rentabilidad estimada
              </div>
              <div style={{ padding: '16px' }}>
                {amountNum > 0 && incomeTotal !== null ? (
                  <>
                    <div className={`cf-trend-arrow-wrap ${rentabilidad! >= 0 ? 'cf-trend-up' : 'cf-trend-down'}`} style={{ marginBottom: 12 }}>
                      <div className="cf-trend-arrow-icon">
                        <i className={`fas ${rentabilidad! >= 0 ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: .6, color: 'var(--barro)' }}>
                          {rentabilidad! >= 0 ? 'Margen positivo' : 'Costo supera ingresos'}
                        </span>
                        <span className="cf-trend-pct" style={{ fontSize: '1.3rem' }}>
                          {rentabilidad!.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                        </span>
                      </div>
                    </div>

                    <div className="cf-trend-bars">
                      <div className="cf-trend-bar-row">
                        <span style={{ width: 40, fontSize: '.58rem' }}>Ingr.</span>
                        <div className="cf-trend-bar-track">
                          <div className="cf-trend-bar-fill cf-trend-bar-fill--up" style={{ width: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '.65rem', color: 'var(--pasto)', fontWeight: 700, marginLeft: 4 }}>
                          {incomeTotal.toLocaleString('es-CO', { notation: 'compact' as any, maximumFractionDigits: 1 })}
                        </span>
                      </div>
                      <div className="cf-trend-bar-row">
                        <span style={{ width: 40, fontSize: '.58rem' }}>Costo</span>
                        <div className="cf-trend-bar-track">
                          <div className={`cf-trend-bar-fill ${amountNum > incomeTotal ? 'cf-trend-bar-fill--down' : 'cf-trend-bar-fill--prev'}`}
                            style={{ width: `${Math.min(100, (amountNum / Math.max(incomeTotal, amountNum, 1)) * 100)}%`, border: 'none', background: amountNum > incomeTotal ? undefined : 'var(--tierra)' }}></div>
                        </div>
                        <span style={{ fontSize: '.65rem', color: 'var(--tierra)', fontWeight: 700, marginLeft: 4 }}>
                          {amountNum.toLocaleString('es-CO', { notation: 'compact' as any, maximumFractionDigits: 1 })}
                        </span>
                      </div>
                    </div>

                    {rentPct !== null && (
                      <p style={{ fontSize: '.7rem', color: 'var(--barro)', opacity: .6, marginTop: 10, fontStyle: 'italic' }}>
                        Este costo representa el <strong style={{ color: 'var(--tierra)' }}>{Math.abs(Math.round((amountNum / Math.max(incomeTotal, 1)) * 100))}%</strong> de tus ingresos de este mes.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="cf-live-empty" style={{ padding: '14px 6px' }}>
                    <i className="fas fa-seedling" style={{ fontSize: '1.2rem' }}></i>
                    <span>Ingresa un monto para ver la rentabilidad estimada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="cf-sidebar-card cf-tips-card">
              <div className="cf-sidebar-card-hdr"><i className="fas fa-seedling"></i> Consejo del campo</div>
              <div className="cf-tip-body">
                <div className="cf-tip-icon"><i className={`fas ${TIPS[tipIdx].icon}`}></i></div>
                <p className="cf-tip-text">{TIPS[tipIdx].text}</p>
                <div className="cf-tip-dots">
                  {TIPS.map((_, i) => <button key={i} className={`cf-tip-dot ${i === tipIdx ? 'active' : ''}`} onClick={() => setTipIdx(i)} />)}
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}