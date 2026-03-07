import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const CATEGORY_OPTIONS = [
  { group: 'Café',          emoji: '☕', items: ['Café pergamino', 'Café cereza', 'Café tostado'] },
  { group: 'Aguacate',      emoji: '🥑', items: ['Aguacate Hass', 'Aguacate criollo'] },
  { group: 'Otros Cultivos',emoji: '🌽', items: ['Maíz', 'Fríjol', 'Caña', 'Plátano', 'Yuca'] },
  { group: 'Insumos',       emoji: '🧪', items: ['Fertilizante', 'Plaguicida', 'Semillas', 'Abono orgánico'] },
  { group: 'Otros',         emoji: '📦', items: ['Producto procesado', 'otro'] },
]

const TIPS = [
  { icon: 'fa-warehouse',   text: 'Un inventario actualizado evita comprar insumos que ya tienes en bodega.' },
  { icon: 'fa-chart-bar',   text: 'Registrar el valor de tu stock te muestra el capital que tienes invertido en productos.' },
  { icon: 'fa-boxes-stacked', text: 'Controlar las salidas de inventario te ayuda a calcular el costo real de producción.' },
  { icon: 'fa-rotate',      text: 'Revisa tu inventario al inicio de cada ciclo productivo para planificar mejor.' },
]

export default function InventoryCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    date: '', category: '', product_name: '', quantity: '',
    unit: '', unit_cost: '', amount: '', description: ''
  })
  const [showCustom, setShowCustom]   = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [tipIdx, setTipIdx]           = useState(0)
  const [stockTotal, setStockTotal]   = useState<number | null>(null)
  const [stockCount, setStockCount]   = useState<number | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Total del inventario existente
  useEffect(() => {
    clientService.getFinances('inventory')
      .then((data: any) => {
        const all: any[] = data?.finances ?? data?.data ?? []
        setStockTotal(all.reduce((s: number, f: any) => s + Number(f.amount ?? 0), 0))
        setStockCount(all.length)
      }).catch(() => { setStockTotal(0); setStockCount(0) })
  }, [])

  useEffect(() => {
    const q = parseFloat(formData.quantity) || 0
    const uc = parseFloat(formData.unit_cost) || 0
    if (q > 0 && uc > 0) setFormData(prev => ({ ...prev, amount: (q * uc).toFixed(2) }))
  }, [formData.quantity, formData.unit_cost])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'category') {
      setShowCustom(value === 'otro')
      setFormData(prev => ({ ...prev, category: value, product_name: value === 'otro' ? '' : value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await clientService.createInventory({
        date: formData.date, category: formData.category,
        product_name: formData.product_name, quantity: Number(formData.quantity),
        unit: formData.unit, amount: Number(formData.amount),
        unit_cost: formData.unit_cost ? Number(formData.unit_cost) : undefined,
        description: formData.description
      })
      navigate('/client/finances')
    } catch { setError('Error al registrar el inventario.') }
    finally { setSubmitting(false) }
  }

  const amountNum   = parseFloat(formData.amount) || 0
  const quantityNum = parseFloat(formData.quantity) || 0
  const ucNum       = parseFloat(formData.unit_cost) || 0
  const totalValue  = amountNum ? amountNum.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : null
  const newTotal    = stockTotal !== null ? stockTotal + amountNum : null
  const addPct      = stockTotal && amountNum ? Math.round((amountNum / stockTotal) * 100) : null

  return (
    <div className="cf-page-wrap">
      <div className="cf-bg"></div>
      <div className="cf-bg-overlay"></div>
      <div className="cf-page-inner">

        <nav className="cf-breadcrumb">
          <Link to="/client/finances"><i className="fas fa-wallet"></i> Finanzas</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Nuevo Inventario</span>
        </nav>

        <div className="cf-layout">
          <div className="cf-form-col">
            <div className="inventory-card">
              <div className="inventory-header">
                <i className="fas fa-boxes-stacked"></i> Registrar Inventario Agrícola
              </div>
              <div className="inventory-body">
                <div className="inventory-icon"><i className="fas fa-seedling"></i></div>
                <div className="cf-eyebrow"><span></span> Stock · Inventario</div>
                <p className="cf-subtitle">Lleva el control de tus productos almacenados, insumos y cosechas disponibles.</p>

                <div className="cattle-notice">
                  <i className="fas fa-cow"></i>
                  <span>¿Quieres registrar ganado o animales? Gestiona cada animal individualmente en{' '}
                    <Link to="/client/hato/hato">Mi Hato Ganadero</Link>.
                  </span>
                </div>

                {error && <div className="modern-alert error" style={{ marginBottom: 20 }}><i className="fas fa-exclamation-triangle"></i> {error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group-inventory">
                    <label htmlFor="inventory_date"><i className="fas fa-calendar-alt"></i> Fecha de registro *</label>
                    <input type="date" name="date" id="inventory_date" value={formData.date} onChange={handleChange} required />
                  </div>

                  <div className="form-group-inventory">
                    <label htmlFor="inventory_category"><i className="fas fa-tag"></i> Tipo de producto *</label>
                    <select name="category" id="inventory_category" value={formData.category} onChange={handleChange} required>
                      <option value="">Seleccionar...</option>
                      {CATEGORY_OPTIONS.map(g => (
                        <optgroup key={g.group} label={`${g.emoji} ${g.group}`}>
                          {g.items.map(i => <option key={i} value={i}>{i === 'otro' ? 'Otro (especificar)' : i}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {showCustom && (
                    <div className="form-group-inventory">
                      <label htmlFor="inventory_product"><i className="fas fa-pencil"></i> Especifica el producto *</label>
                      <input type="text" name="product_name" id="inventory_product"
                        placeholder="Ej: Mora, Tomate de árbol..." value={formData.product_name} onChange={handleChange} required />
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group-inventory">
                      <label htmlFor="inventory_quantity"><i className="fas fa-sort-numeric-up"></i> Cantidad *</label>
                      <input type="number" step="0.01" name="quantity" id="inventory_quantity"
                        placeholder="Ej: 500" value={formData.quantity} onChange={handleChange} required />
                    </div>
                    <div className="form-group-inventory">
                      <label htmlFor="inventory_unit"><i className="fas fa-balance-scale"></i> Unidad *</label>
                      <select name="unit" id="inventory_unit" value={formData.unit} onChange={handleChange} required>
                        <option value="">Seleccionar...</option>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="toneladas">Toneladas</option>
                        <option value="litros">Litros</option>
                        <option value="arrobas">Arrobas</option>
                        <option value="bultos">Bultos</option>
                        <option value="unidades">Unidades</option>
                        <option value="cajas">Cajas</option>
                        <option value="hectareas">Hectáreas</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group-inventory">
                      <label htmlFor="inventory_unit_cost"><i className="fas fa-tag"></i> Valor unitario</label>
                      <div className="cf-input-wrap">
                        <span className="cf-input-prefix">$</span>
                        <input type="number" step="0.01" name="unit_cost" id="inventory_unit_cost"
                          placeholder="0.00" value={formData.unit_cost} onChange={handleChange} className="cf-has-prefix" />
                      </div>
                    </div>
                    <div className="form-group-inventory">
                      <label htmlFor="inventory_amount"><i className="fas fa-dollar-sign"></i> Valor total *</label>
                      <div className="cf-input-wrap">
                        <span className="cf-input-prefix">$</span>
                        <input type="number" step="0.01" name="amount" id="inventory_amount"
                          placeholder="Auto-calculado" value={formData.amount} onChange={handleChange} required className="cf-has-prefix" />
                      </div>
                    </div>
                  </div>

                  {totalValue && quantityNum > 0 && ucNum > 0 && (
                    <div className="cf-calc-pill">
                      <i className="fas fa-equals"></i>
                      {quantityNum} {formData.unit || 'unid.'} × ${ucNum.toLocaleString('es-CO')} = <strong>${totalValue}</strong>
                      <span className="cf-calc-badge">auto</span>
                    </div>
                  )}

                  <div className="form-group-inventory">
                    <label htmlFor="inventory_description"><i className="fas fa-map-marker-alt"></i> Ubicación / Descripción</label>
                    <textarea name="description" id="inventory_description"
                      placeholder="Ej: Bodega principal, lote 5, cosecha de marzo..." rows={3}
                      value={formData.description} onChange={handleChange}></textarea>
                  </div>

                  <button type="submit" className="btn-inventory-submit" disabled={submitting}>
                    {submitting ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</> : <><i className="fas fa-floppy-disk"></i> Guardar Inventario</>}
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
                {amountNum > 0 && <span className="cf-live-dot" style={{ background: 'var(--noche)', boxShadow: '0 0 0 3px rgba(28,43,26,.2)' }}></span>}
              </div>
              <div className="cf-live-body">
                {amountNum > 0 ? (
                  <>
                    <div className="cf-live-amount" style={{ color: 'var(--noche)' }}>
                      {amountNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </div>
                    <div className="cf-live-meta">
                      {formData.product_name && <span><i className="fas fa-box"></i> {formData.product_name}</span>}
                      {quantityNum > 0 && <span><i className="fas fa-sort-numeric-up"></i> {quantityNum} {formData.unit}</span>}
                      {formData.description && (
                        <span className="cf-live-desc"><i className="fas fa-map-marker-alt"></i>
                          {formData.description.length > 40 ? formData.description.slice(0, 40) + '…' : formData.description}
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

            {/* Stock acumulado */}
            <div className="cf-sidebar-card" style={{ borderTop: '3px solid var(--noche)' }}>
              <div className="cf-sidebar-card-hdr">
                <i className="fas fa-warehouse"></i> Valor del stock
              </div>
              <div style={{ padding: '16px' }}>
                {stockTotal !== null ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--barro)', opacity: .6, marginBottom: 3 }}>
                          Stock actual ({stockCount} items)
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--noche)', letterSpacing: '-1px' }}>
                          {stockTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                        </div>
                      </div>
                      {amountNum > 0 && (
                        <>
                          <div className="cf-divider"></div>
                          <div>
                            <div style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--barro)', opacity: .6, marginBottom: 3 }}>
                              Después de este registro
                            </div>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 900, color: 'var(--hoja)', letterSpacing: '-0.5px' }}>
                              {newTotal!.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0, notation: 'compact' as any })}
                            </div>
                            {addPct !== null && (
                              <div style={{ fontSize: '.72rem', color: 'var(--pasto)', fontWeight: 600, marginTop: 4 }}>
                                <i className="fas fa-arrow-up" style={{ fontSize: '.6rem' }}></i> +{addPct}% al stock total
                              </div>
                            )}
                          </div>
                          <div className="cf-trend-bars" style={{ marginTop: 4 }}>
                            <div className="cf-trend-bar-row">
                              <span style={{ width: 36, fontSize: '.58rem' }}>Actual</span>
                              <div className="cf-trend-bar-track">
                                <div className="cf-trend-bar-fill cf-trend-bar-fill--prev" style={{ width: `${Math.min(100, (stockTotal / Math.max(newTotal!, 1)) * 100)}%`, background: 'var(--barro)', opacity: .4, border: 'none' }}></div>
                              </div>
                            </div>
                            <div className="cf-trend-bar-row">
                              <span style={{ width: 36, fontSize: '.58rem' }}>Nuevo</span>
                              <div className="cf-trend-bar-track">
                                <div className="cf-trend-bar-fill cf-trend-bar-fill--up" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="cf-stats-loading"><i className="fas fa-circle-notch fa-spin"></i> Cargando…</div>
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