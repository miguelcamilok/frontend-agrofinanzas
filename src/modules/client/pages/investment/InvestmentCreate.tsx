import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const TIPS = [
  { icon: 'fa-tractor',     text: 'Una maquinaria bien mantenida dura más años y reduce su depreciación real.' },
  { icon: 'fa-chart-line',  text: 'Registrar activos te permite conocer el valor real de tu patrimonio agrícola.' },
  { icon: 'fa-building',    text: 'La infraestructura como bodegas y sistemas de riego son inversiones de largo plazo.' },
  { icon: 'fa-lightbulb',   text: 'Las inversiones bien documentadas facilitan acceder a créditos y subsidios.' },
]

export default function InvestmentCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    amount: '', date: '', asset_name: '',
    category: '', depreciation_years: '', description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [tipIdx, setTipIdx]         = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await clientService.createInvestment({
        amount: Number(formData.amount), date: formData.date,
        asset_name: formData.asset_name,
        category: formData.category || undefined,
        depreciation_years: formData.depreciation_years ? Number(formData.depreciation_years) : undefined,
        description: formData.description
      })
      navigate('/client/finances')
    } catch { setError('Error al registrar la inversión.') }
    finally { setSubmitting(false) }
  }

  const amountNum = parseFloat(formData.amount) || 0
  const depYears  = parseInt(formData.depreciation_years) || 0
  const depPct    = depYears > 0 ? Math.min(100, (1 / depYears) * 100) : 0
  const depAnual  = depYears > 0 && amountNum > 0 ? amountNum / depYears : null

  // Tabla de depreciación: primeros 5 años o hasta depYears
  const depTable = depYears > 0 && amountNum > 0
    ? Array.from({ length: Math.min(depYears, 6) }, (_, i) => ({
        year: i + 1,
        value: Math.max(0, amountNum - depAnual! * (i + 1)),
        pct: Math.max(0, 100 - (depPct * (i + 1)))
      }))
    : []

  return (
    <div className="cf-page-wrap">
      <div className="cf-bg"></div>
      <div className="cf-bg-overlay"></div>
      <div className="cf-page-inner">

        <nav className="cf-breadcrumb">
          <Link to="/client/finances"><i className="fas fa-wallet"></i> Finanzas</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Nueva Inversión</span>
        </nav>

        <div className="cf-layout">
          <div className="cf-form-col">
            <div className="investment-card">
              <div className="investment-header">
                <i className="fas fa-building"></i> Registrar Inversión
              </div>
              <div className="investment-body">
                <div className="investment-icon"><i className="fas fa-chart-line"></i></div>
                <div className="cf-eyebrow"><span></span> Nuevo activo · Inversiones</div>
                <p className="cf-subtitle">Registra maquinaria, infraestructura, terrenos u otros activos productivos de tu finca.</p>

                {error && <div className="modern-alert error" style={{ marginBottom: 20 }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group-investment">
                      <label htmlFor="investment_amount"><i className="fas fa-dollar-sign"></i> Monto *</label>
                      <div className="cf-input-wrap">
                        <span className="cf-input-prefix">$</span>
                        <input type="number" step="0.01" name="amount" id="investment_amount"
                          placeholder="0.00" value={formData.amount} onChange={handleChange} required className="cf-has-prefix" />
                      </div>
                    </div>
                    <div className="form-group-investment">
                      <label htmlFor="investment_date"><i className="fas fa-calendar-alt"></i> Fecha de compra *</label>
                      <input type="date" name="date" id="investment_date" value={formData.date} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-group-investment">
                    <label htmlFor="investment_asset"><i className="fas fa-tools"></i> Nombre del activo *</label>
                    <input type="text" name="asset_name" id="investment_asset"
                      placeholder="Ej: Tractor John Deere 5075E" value={formData.asset_name} onChange={handleChange} required />
                  </div>

                  <div className="form-group-investment">
                    <label htmlFor="investment_category"><i className="fas fa-tag"></i> Tipo de inversión</label>
                    <select name="category" id="investment_category" value={formData.category} onChange={handleChange}>
                      <option value="">Seleccionar...</option>
                      <option value="Maquinaria">Maquinaria</option>
                      <option value="Infraestructura">Infraestructura</option>
                      <option value="Terreno">Terreno</option>
                      <option value="Vehículo">Vehículo</option>
                      <option value="Equipo">Equipo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group-investment">
                    <label htmlFor="investment_depreciation"><i className="fas fa-chart-line"></i> Años de depreciación</label>
                    <input type="number" name="depreciation_years" id="investment_depreciation"
                      placeholder="Ej: 10" min="1" value={formData.depreciation_years} onChange={handleChange} />
                    {depYears > 0 && (
                      <div className="cf-dep-info">
                        <div className="cf-dep-bar"><div className="cf-dep-fill" style={{ width: `${depPct}%` }}></div></div>
                        <span>{depPct.toFixed(1)}% depreciación anual</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group-investment">
                    <label htmlFor="investment_description"><i className="fas fa-align-left"></i> Descripción</label>
                    <textarea name="description" id="investment_description"
                      placeholder="Ej: Tractor para labores de labranza y siembra..." rows={3}
                      value={formData.description} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="btn-investment-submit" disabled={submitting}>
                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-floppy-disk"></i> Guardar Inversión</>}
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
                {amountNum > 0 && <span className="cf-live-dot" style={{ background: 'var(--cielo)', boxShadow: '0 0 0 3px rgba(91,141,184,.2)' }}></span>}
              </div>
              <div className="cf-live-body">
                {amountNum > 0 ? (
                  <>
                    <div className="cf-live-amount" style={{ color: 'var(--cielo)' }}>
                      {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </div>
                    <div className="cf-live-meta">
                      {formData.asset_name && <span><i className="fas fa-tools"></i> {formData.asset_name}</span>}
                      {formData.category   && <span><i className="fas fa-tag"></i> {formData.category}</span>}
                      {depYears > 0        && <span><i className="fas fa-clock"></i> {depYears} años de vida útil</span>}
                      {depAnual            && <span><i className="fas fa-arrow-trend-down"></i> {depAnual.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })} / año</span>}
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

            {/* Curva de depreciación */}
            <div className="cf-sidebar-card" style={{ borderTop: '3px solid var(--cielo)' }}>
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-chart-area"></i> Curva de depreciación
              </div>
              <div style={{ padding: '16px' }}>
                {depTable.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {depTable.map(row => (
                      <div key={row.year} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--barro)', opacity: .6, width: 36, flexShrink: 0 }}>
                          Año {row.year}
                        </span>
                        <div className="cf-trend-bar-track" style={{ flex: 1 }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            width: `${row.pct}%`,
                            background: `linear-gradient(90deg, var(--cielo), rgba(91,141,184,${0.3 + row.pct / 200}))`,
                            transition: 'width .5s ease'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--cielo)', width: 52, textAlign: 'right', flexShrink: 0 }}>
                          {row.value.toLocaleString('es-CO', { notation: 'compact' as any, maximumFractionDigits: 1 })}
                        </span>
                      </div>
                    ))}
                    {depYears > 6 && (
                      <p style={{ fontSize: '.65rem', color: 'var(--barro)', opacity: .5, textAlign: 'center', marginTop: 4 }}>
                        … hasta el año {depYears} (valor $0)
                      </p>
                    )}
                    <div className="cf-divider"></div>
                    <p style={{ fontSize: '.7rem', color: 'var(--barro)', opacity: .6, fontStyle: 'italic' }}>
                      Depreciación lineal: <strong style={{ color: 'var(--cielo)' }}>
                        {depAnual!.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                      </strong> por año
                    </p>
                  </div>
                ) : (
                  <div className="cf-live-empty" style={{ padding: '14px 6px' }}>
                    <i className="fas fa-clock" style={{ fontSize: '1.2rem', color: 'var(--cielo)' }}></i>
                    <span>Ingresa monto y años de depreciación para ver la curva</span>
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