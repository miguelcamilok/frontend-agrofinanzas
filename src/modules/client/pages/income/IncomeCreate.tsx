import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function IncomeCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        description: '',
        category: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true); setError('')
        try {
            await clientService.createIncome({
                amount:      Number(formData.amount),
                date:        formData.date,
                description: formData.description,
                category:    formData.category,
            })
            navigate('/client/finances')
        } catch {
            setError('Error al guardar el ingreso.')
        } finally { setSubmitting(false) }
    }

    return (
        <div className="income-container">
            <div className="income-card">
                <div className="income-header">
                    <i className="fas fa-arrow-trend-up"></i>
                    Registrar Ingreso
                </div>
                <div className="income-body">
                    <div className="income-icon"><i className="fas fa-hand-holding-dollar"></i></div>

                    <div className="cf-eyebrow">
                        <span></span> Nuevo movimiento · Ingresos
                    </div>
                    <p className="cf-subtitle">
                        Registra ventas de productos agrícolas, animales u otros ingresos de tu finca.
                    </p>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-income">
                            <label htmlFor="income_amount">
                                <i className="fas fa-dollar-sign"></i> Monto
                            </label>
                            <div className="cf-input-wrap">
                                <span className="cf-input-prefix">$</span>
                                <input
                                    type="number" step="0.01" name="amount" id="income_amount"
                                    placeholder="0.00" value={formData.amount}
                                    onChange={handleChange} required className="cf-has-prefix"
                                />
                            </div>
                        </div>

                        <div className="form-group-income">
                            <label htmlFor="income_date">
                                <i className="fas fa-calendar-alt"></i> Fecha
                            </label>
                            <input
                                type="date" name="date" id="income_date"
                                value={formData.date} onChange={handleChange} required
                            />
                        </div>

                        <div className="form-group-income">
                            <label htmlFor="income_category">
                                <i className="fas fa-tag"></i> Categoría
                            </label>
                            <select
                                name="category"
                                id="income_category"
                                value={formData.category}
                                onChange={handleChange}
                            >
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
                            <label htmlFor="income_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description" id="income_description"
                                placeholder="Ej: Venta de productos agrícolas al mercado local..."
                                rows={3} value={formData.description} onChange={handleChange}
                            ></textarea>
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
    )
}