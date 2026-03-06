import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function InvestmentCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        amount: '', date: '', asset_name: '',
        category: '', depreciation_years: '', description: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true); setError('')
        try {
            await clientService.createInvestment({
                amount: Number(formData.amount),
                date: formData.date,
                asset_name: formData.asset_name,
                category: formData.category || undefined,
                depreciation_years: formData.depreciation_years ? Number(formData.depreciation_years) : undefined,
                description: formData.description
            })
            navigate('/client/finances')
        } catch {
            setError('Error al registrar la inversión.')
        } finally { setSubmitting(false) }
    }

    const depPct = formData.depreciation_years ? Math.min(100, (1 / Number(formData.depreciation_years)) * 100) : 0

    return (
        <div className="investment-container">
            <div className="investment-card">
                <div className="investment-header">
                    <i className="fas fa-building"></i>
                    Registrar Inversión
                </div>
                <div className="investment-body">
                    <div className="investment-icon"><i className="fas fa-chart-line"></i></div>

                    <div className="cf-eyebrow">
                        <span></span> Nuevo activo · Inversiones
                    </div>
                    <p className="cf-subtitle">
                        Registra maquinaria, infraestructura, terrenos u otros activos productivos de tu finca.
                    </p>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group-investment">
                                <label htmlFor="investment_amount">
                                    <i className="fas fa-dollar-sign"></i> Monto *
                                </label>
                                <div className="cf-input-wrap">
                                    <span className="cf-input-prefix">$</span>
                                    <input
                                        type="number" step="0.01" name="amount" id="investment_amount"
                                        placeholder="0.00" value={formData.amount}
                                        onChange={handleChange} required className="cf-has-prefix"
                                    />
                                </div>
                            </div>
                            <div className="form-group-investment">
                                <label htmlFor="investment_date">
                                    <i className="fas fa-calendar-alt"></i> Fecha de compra *
                                </label>
                                <input
                                    type="date" name="date" id="investment_date"
                                    value={formData.date} onChange={handleChange} required
                                />
                            </div>
                        </div>

                        <div className="form-group-investment">
                            <label htmlFor="investment_asset">
                                <i className="fas fa-tools"></i> Nombre del activo *
                            </label>
                            <input
                                type="text" name="asset_name" id="investment_asset"
                                placeholder="Ej: Tractor John Deere 5075E"
                                value={formData.asset_name} onChange={handleChange} required
                            />
                        </div>

                        <div className="form-group-investment">
                            <label htmlFor="investment_category">
                                <i className="fas fa-tag"></i> Tipo de inversión
                            </label>
                            <select name="category" id="investment_category"
                                value={formData.category} onChange={handleChange}>
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
                            <label htmlFor="investment_depreciation">
                                <i className="fas fa-chart-line"></i> Años de depreciación
                            </label>
                            <input
                                type="number" name="depreciation_years" id="investment_depreciation"
                                placeholder="Ej: 10" min="1"
                                value={formData.depreciation_years} onChange={handleChange}
                            />
                            {formData.depreciation_years && Number(formData.depreciation_years) > 0 && (
                                <div className="cf-dep-info">
                                    <div className="cf-dep-bar">
                                        <div className="cf-dep-fill" style={{ width: `${depPct}%` }}></div>
                                    </div>
                                    <span>{depPct.toFixed(1)}% depreciación anual</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group-investment">
                            <label htmlFor="investment_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description" id="investment_description"
                                placeholder="Ej: Tractor para labores de labranza y siembra..."
                                rows={3} value={formData.description} onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-investment-submit" disabled={submitting}>
                            {submitting
                                ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                                : <><i className="fas fa-floppy-disk"></i> Guardar Inversión</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}