import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const TIPS = [
  { icon: 'fa-university',    text: 'FINAGRO ofrece créditos con tasas preferenciales para pequeños agricultores colombianos.' },
  { icon: 'fa-shield-alt',    text: 'Conocer tu tasa efectiva anual (EA) es clave para comparar diferentes opciones de crédito.' },
  { icon: 'fa-calendar-check',text: 'Pagar cuotas a tiempo mejora tu historial crediticio y facilita futuros préstamos.' },
  { icon: 'fa-lightbulb',     text: 'Los créditos bien gestionados son una herramienta para crecer, no una carga.' },
]

export default function DebtCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    amount: '', date: '', due_date: '', creditor: '',
    interest_rate: '', installments: '', paid_installments: '0', description: ''
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
      await clientService.createDebt({
        amount: Number(formData.amount), date: formData.date,
        creditor: formData.creditor,
        due_date: formData.due_date || undefined,
        interest_rate: formData.interest_rate ? Number(formData.interest_rate) : undefined,
        installments: formData.installments ? Number(formData.installments) : undefined,
        paid_installments: Number(formData.paid_installments),
        description: formData.description
      })
      navigate('/client/finances')
    } catch { setError('Error al registrar la deuda.') }
    finally { setSubmitting(false) }
  }

  const amountNum      = parseFloat(formData.amount) || 0
  const rateNum        = parseFloat(formData.interest_rate) || 0
  const installNum     = parseInt(formData.installments) || 0
  const paidNum        = parseInt(formData.paid_installments) || 0
  const pagoPct        = installNum > 0 ? Math.round((paidNum / installNum) * 100) : 0

  // Simulador: cuota mensual con interés (fórmula francesa)
  const monthlyRate    = rateNum / 100 / 12
  const cuotaMensual   = amountNum > 0 && installNum > 0
    ? monthlyRate > 0
      ? amountNum * (monthlyRate * Math.pow(1 + monthlyRate, installNum)) / (Math.pow(1 + monthlyRate, installNum) - 1)
      : amountNum / installNum
    : 0
  const totalPagar     = cuotaMensual * installNum
  const totalIntereses = totalPagar - amountNum

  return (
    <div className="cf-page-wrap">
      <div className="cf-bg"></div>
      <div className="cf-bg-overlay"></div>
      <div className="cf-page-inner">

        <nav className="cf-breadcrumb">
          <Link to="/client/finances"><i className="fas fa-wallet"></i> Finanzas</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Nueva Deuda</span>
        </nav>

        <div className="cf-layout">
          <div className="cf-form-col">
            <div className="debt-card">
              <div className="debt-header">
                <i className="fas fa-credit-card"></i> Registrar Deuda / Préstamo
              </div>
              <div className="debt-body">
                <div className="debt-icon"><i className="fas fa-building-columns"></i></div>
                <div className="cf-eyebrow"><span></span> Nuevo pasivo · Deudas</div>
                <p className="cf-subtitle">Registra préstamos bancarios, créditos FINAGRO u otras obligaciones financieras de tu operación.</p>

                {error && <div className="modern-alert error" style={{ marginBottom: 20 }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group-debt">
                    <label htmlFor="debt_amount"><i className="fas fa-dollar-sign"></i> Monto del préstamo *</label>
                    <div className="cf-input-wrap">
                      <span className="cf-input-prefix">$</span>
                      <input type="number" step="0.01" name="amount" id="debt_amount"
                        placeholder="0.00" value={formData.amount} onChange={handleChange} required className="cf-has-prefix" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group-debt">
                      <label htmlFor="debt_date"><i className="fas fa-calendar-alt"></i> Fecha *</label>
                      <input type="date" name="date" id="debt_date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group-debt">
                      <label htmlFor="debt_due"><i className="fas fa-calendar-check"></i> Vencimiento</label>
                      <input type="date" name="due_date" id="debt_due" value={formData.due_date} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group-debt">
                    <label htmlFor="debt_creditor"><i className="fas fa-university"></i> Acreedor / Banco *</label>
                    <input type="text" name="creditor" id="debt_creditor"
                      placeholder="Ej: Banco Agrario de Colombia" value={formData.creditor} onChange={handleChange} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group-debt">
                      <label htmlFor="debt_interest"><i className="fas fa-percentage"></i> Tasa de interés (%)</label>
                      <input type="number" step="0.01" name="interest_rate" id="debt_interest"
                        placeholder="Ej: 8.5" min="0" max="100" value={formData.interest_rate} onChange={handleChange} />
                    </div>
                    <div className="form-group-debt">
                      <label htmlFor="debt_installments"><i className="fas fa-list-ol"></i> Número de cuotas</label>
                      <input type="number" name="installments" id="debt_installments"
                        placeholder="Ej: 24" min="1" value={formData.installments} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-group-debt">
                    <label htmlFor="debt_paid"><i className="fas fa-check-circle"></i> Cuotas ya pagadas</label>
                    <input type="number" name="paid_installments" id="debt_paid"
                      placeholder="0" min="0" value={formData.paid_installments} onChange={handleChange} />
                    {installNum > 0 && (
                      <div className="cf-dep-info">
                        <div className="cf-dep-bar cf-dep-bar--acento">
                          <div className="cf-dep-fill cf-dep-fill--acento" style={{ width: `${pagoPct}%` }}></div>
                        </div>
                        <span>{pagoPct}% pagado</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group-debt">
                    <label htmlFor="debt_description"><i className="fas fa-align-left"></i> Descripción</label>
                    <textarea name="description" id="debt_description"
                      placeholder="Ej: Préstamo para mejoras en infraestructura..." rows={3}
                      value={formData.description} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="btn-debt-submit" disabled={submitting}>
                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-floppy-disk"></i> Guardar Deuda</>}
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
                {amountNum > 0 && <span className="cf-live-dot" style={{ background: 'var(--acento)', boxShadow: '0 0 0 3px rgba(212,132,26,.2)' }}></span>}
              </div>
              <div className="cf-live-body">
                {amountNum > 0 ? (
                  <>
                    <div className="cf-live-amount" style={{ color: 'var(--acento)' }}>
                      {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </div>
                    <div className="cf-live-meta">
                      {formData.creditor   && <span><i className="fas fa-university"></i> {formData.creditor}</span>}
                      {installNum > 0      && <span><i className="fas fa-list-ol"></i> {installNum} cuotas</span>}
                      {rateNum > 0         && <span><i className="fas fa-percentage"></i> {rateNum}% anual</span>}
                      {formData.due_date   && <span><i className="fas fa-calendar-check"></i> Vence: {new Date(formData.due_date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
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

            {/* Simulador de cuotas */}
            <div className="cf-sidebar-card" style={{ borderTop: '3px solid var(--acento)' }}>
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-calculator"></i> Simulador de crédito
              </div>
              <div style={{ padding: '16px' }}>
                {cuotaMensual > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Cuota mensual grande */}
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(212,132,26,.06)', borderRadius: 4, border: '1px solid rgba(212,132,26,.2)' }}>
                      <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--barro)', opacity: .6, marginBottom: 4 }}>
                        Cuota mensual estimada
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 900, color: 'var(--acento)', letterSpacing: '-1px' }}>
                        {cuotaMensual.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    {/* Desglose */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="cf-trend-row">
                        <span className="cf-trend-lbl"><i className="fas fa-circle-dot"></i> Capital</span>
                        <span className="cf-trend-val cf-trend-val--main">
                          {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                        </span>
                      </div>
                      {totalIntereses > 0 && (
                        <div className="cf-trend-row">
                          <span className="cf-trend-lbl" style={{ color: 'var(--rojo)', opacity: .8 }}>
                            <i className="fas fa-percentage" style={{ color: 'var(--rojo)' }}></i> Intereses
                          </span>
                          <span className="cf-trend-val" style={{ color: 'var(--rojo)' }}>
                            {totalIntereses.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                          </span>
                        </div>
                      )}
                      <div className="cf-divider"></div>
                      <div className="cf-trend-row">
                        <span className="cf-trend-lbl" style={{ color: 'var(--noche)' }}><i className="fas fa-sigma"></i> Total a pagar</span>
                        <span className="cf-trend-val cf-trend-val--main" style={{ fontWeight: 900 }}>
                          {totalPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                        </span>
                      </div>
                    </div>

                    {/* Barra capital vs intereses */}
                    {totalIntereses > 0 && (
                      <div>
                        <div style={{ fontSize: '.6rem', color: 'var(--barro)', opacity: .55, marginBottom: 5, letterSpacing: .5 }}>
                          Capital vs Intereses
                        </div>
                        <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${(amountNum / totalPagar) * 100}%`, background: 'var(--cielo)', transition: 'width .5s ease' }}></div>
                          <div style={{ flex: 1, background: 'var(--rojo)', opacity: .7 }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: '.58rem', color: 'var(--cielo)', fontWeight: 700 }}>
                            Capital {Math.round((amountNum / totalPagar) * 100)}%
                          </span>
                          <span style={{ fontSize: '.58rem', color: 'var(--rojo)', fontWeight: 700 }}>
                            Interés {Math.round((totalIntereses / totalPagar) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <p style={{ fontSize: '.65rem', color: 'var(--barro)', opacity: .5, fontStyle: 'italic', marginTop: 2 }}>
                      * Cálculo con cuota fija (sistema francés). Tu banco puede variar.
                    </p>
                  </div>
                ) : (
                  <div className="cf-live-empty" style={{ padding: '14px 6px' }}>
                    <i className="fas fa-calculator" style={{ fontSize: '1.2rem', color: 'var(--acento)' }}></i>
                    <span>Ingresa monto, tasa e cuotas para simular el crédito</span>
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