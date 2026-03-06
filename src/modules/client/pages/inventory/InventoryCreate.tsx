import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

const CATEGORY_OPTIONS = [
    { group: 'Café', emoji: '☕', items: ['Café pergamino', 'Café cereza', 'Café tostado'] },
    { group: 'Aguacate', emoji: '🥑', items: ['Aguacate Hass', 'Aguacate criollo'] },
    { group: 'Otros Cultivos', emoji: '🌽', items: ['Maíz', 'Fríjol', 'Caña', 'Plátano', 'Yuca'] },
    { group: 'Insumos', emoji: '🧪', items: ['Fertilizante', 'Plaguicida', 'Semillas', 'Abono orgánico'] },
    { group: 'Otros', emoji: '📦', items: ['Producto procesado', 'otro'] },
]

export default function InventoryCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        date: '', category: '', product_name: '', quantity: '',
        unit: '', unit_cost: '', amount: '', description: ''
    })
    const [showCustom, setShowCustom] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const q = parseFloat(formData.quantity) || 0
        const uc = parseFloat(formData.unit_cost) || 0
        if (q > 0 && uc > 0) {
            setFormData(prev => ({ ...prev, amount: (q * uc).toFixed(2) }))
        }
    }, [formData.quantity, formData.unit_cost])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === 'category') {
            setShowCustom(value === 'otro')
            setFormData(prev => ({
                ...prev, category: value,
                product_name: value === 'otro' ? '' : value
            }))
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
        } catch {
            setError('Error al registrar el inventario.')
        } finally { setSubmitting(false) }
    }

    const totalValue = formData.amount
        ? Number(formData.amount).toLocaleString('es-CO', { maximumFractionDigits: 0 })
        : null

    return (
        <div className="inventory-container">
            <div className="inventory-card">
                <div className="inventory-header">
                    <i className="fas fa-boxes-stacked"></i>
                    Registrar Inventario Agrícola
                </div>
                <div className="inventory-body">
                    <div className="inventory-icon"><i className="fas fa-seedling"></i></div>

                    <div className="cf-eyebrow">
                        <span></span> Stock · Inventario
                    </div>
                    <p className="cf-subtitle">
                        Lleva el control de tus productos almacenados, insumos y cosechas disponibles.
                    </p>

                    <div className="cattle-notice">
                        <i className="fas fa-cow"></i>
                        <span>
                            ¿Quieres registrar ganado o animales?
                            Gestiona cada animal individualmente en{' '}
                            <Link to="/client/hato/hato">Mi Hato Ganadero</Link>.
                        </span>
                    </div>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-inventory">
                            <label htmlFor="inventory_date">
                                <i className="fas fa-calendar-alt"></i> Fecha de registro *
                            </label>
                            <input
                                type="date" name="date" id="inventory_date"
                                value={formData.date} onChange={handleChange} required
                            />
                        </div>

                        <div className="form-group-inventory">
                            <label htmlFor="inventory_category">
                                <i className="fas fa-tag"></i> Tipo de producto *
                            </label>
                            <select name="category" id="inventory_category"
                                value={formData.category} onChange={handleChange} required>
                                <option value="">Seleccionar...</option>
                                {CATEGORY_OPTIONS.map(g => (
                                    <optgroup key={g.group} label={`${g.emoji} ${g.group}`}>
                                        {g.items.map(i => (
                                            <option key={i} value={i}>
                                                {i === 'otro' ? 'Otro (especificar)' : i}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {showCustom && (
                            <div className="form-group-inventory">
                                <label htmlFor="inventory_product">
                                    <i className="fas fa-pencil"></i> Especifica el producto *
                                </label>
                                <input
                                    type="text" name="product_name" id="inventory_product"
                                    placeholder="Ej: Mora, Tomate de árbol, Fresas..."
                                    value={formData.product_name} onChange={handleChange} required
                                />
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group-inventory">
                                <label htmlFor="inventory_quantity">
                                    <i className="fas fa-sort-numeric-up"></i> Cantidad *
                                </label>
                                <input
                                    type="number" step="0.01" name="quantity" id="inventory_quantity"
                                    placeholder="Ej: 500" value={formData.quantity}
                                    onChange={handleChange} required
                                />
                            </div>
                            <div className="form-group-inventory">
                                <label htmlFor="inventory_unit">
                                    <i className="fas fa-balance-scale"></i> Unidad *
                                </label>
                                <select name="unit" id="inventory_unit"
                                    value={formData.unit} onChange={handleChange} required>
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
                                <label htmlFor="inventory_unit_cost">
                                    <i className="fas fa-tag"></i> Valor unitario
                                </label>
                                <div className="cf-input-wrap">
                                    <span className="cf-input-prefix">$</span>
                                    <input
                                        type="number" step="0.01" name="unit_cost" id="inventory_unit_cost"
                                        placeholder="0.00" value={formData.unit_cost}
                                        onChange={handleChange} className="cf-has-prefix"
                                    />
                                </div>
                            </div>
                            <div className="form-group-inventory">
                                <label htmlFor="inventory_amount">
                                    <i className="fas fa-dollar-sign"></i> Valor total *
                                </label>
                                <div className="cf-input-wrap">
                                    <span className="cf-input-prefix">$</span>
                                    <input
                                        type="number" step="0.01" name="amount" id="inventory_amount"
                                        placeholder="Auto-calculado" value={formData.amount}
                                        onChange={handleChange} required className="cf-has-prefix"
                                    />
                                </div>
                            </div>
                        </div>

                        {totalValue && formData.quantity && formData.unit_cost && (
                            <div className="cf-calc-pill">
                                <i className="fas fa-equals"></i>
                                {formData.quantity} {formData.unit || 'unid.'} × ${Number(formData.unit_cost).toLocaleString('es-CO')} = <strong>${totalValue}</strong>
                                <span className="cf-calc-badge">auto</span>
                            </div>
                        )}

                        <div className="form-group-inventory">
                            <label htmlFor="inventory_description">
                                <i className="fas fa-map-marker-alt"></i> Ubicación / Descripción
                            </label>
                            <textarea
                                name="description" id="inventory_description"
                                placeholder="Ej: Bodega principal, lote 5, cosecha de marzo..."
                                rows={3} value={formData.description} onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-inventory-submit" disabled={submitting}>
                            {submitting
                                ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                                : <><i className="fas fa-floppy-disk"></i> Guardar Inventario</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}