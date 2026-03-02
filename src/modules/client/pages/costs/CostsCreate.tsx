import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function CostsCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        date: '',
        amount: '',
        crop_name: '',
        area: '',
        cost_per_unit: '',
        production_cycle: '',
        category: '',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Auto calculate cost per unit
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
        setSubmitting(true)
        setError('')
        try {
            await clientService.createCosts({
                date: formData.date,
                amount: Number(formData.amount),
                crop_name: formData.crop_name,
                area: formData.area ? Number(formData.area) : undefined,
                cost_per_unit: formData.cost_per_unit ? Number(formData.cost_per_unit) : undefined,
                production_cycle: formData.production_cycle || undefined,
                category: formData.category || undefined,
                description: formData.description
            })
            navigate('/client/finances')
        } catch {
            setError('Hubo un error al registrar los costos.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="costs-container">
            <div className="costs-card">
                <div className="costs-header">
                    <i className="fas fa-seedling"></i> Registrar Costos de Producción
                </div>

                <div className="costs-body">
                    <div className="costs-icon">
                        <i className="fas fa-tractor"></i>
                    </div>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group-costs">
                                <label htmlFor="costs_date">
                                    <i className="fas fa-calendar-alt"></i> Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    id="costs_date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group-costs">
                                <label htmlFor="costs_amount">
                                    <i className="fas fa-dollar-sign"></i> Costo total *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="amount"
                                    id="costs_amount"
                                    placeholder="Ej: 2500000"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-costs">
                            <label htmlFor="costs_crop">
                                <i className="fas fa-leaf"></i> Cultivo/Producción *
                            </label>
                            <input
                                type="text"
                                name="crop_name"
                                id="costs_crop"
                                placeholder="Ej: Maíz"
                                value={formData.crop_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group-costs">
                                <label htmlFor="costs_area">
                                    <i className="fas fa-map"></i> Área (hectáreas)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="area"
                                    id="costs_area"
                                    placeholder="Ej: 5"
                                    value={formData.area}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group-costs">
                                <label htmlFor="costs_per_unit">
                                    <i className="fas fa-calculator"></i> Costo/Hectárea
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cost_per_unit"
                                    id="costs_per_unit"
                                    placeholder="Ej: 500000"
                                    value={formData.cost_per_unit}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-costs">
                            <label htmlFor="costs_cycle">
                                <i className="fas fa-sync-alt"></i> Ciclo de producción
                            </label>
                            <input
                                type="text"
                                name="production_cycle"
                                id="costs_cycle"
                                placeholder="Ej: Semestre A 2024"
                                value={formData.production_cycle}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-costs">
                            <label htmlFor="costs_category">
                                <i className="fas fa-tag"></i> Tipo de costo
                            </label>
                            <select
                                name="category"
                                id="costs_category"
                                value={formData.category}
                                onChange={handleChange}
                            >
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
                            <label htmlFor="costs_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description"
                                id="costs_description"
                                placeholder="Ej: Costos de siembra y preparación del terreno"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-costs-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-save"></i> Guardar Costos</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
