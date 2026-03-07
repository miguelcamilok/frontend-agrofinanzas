import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function ExpenseCreate() {
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
            await clientService.createExpense({
                amount:      Number(formData.amount),
                date:        formData.date,
                description: formData.description,
                category:    formData.category,
            })
            navigate('/client/finances')
        } catch {
            setError('Error al registrar el gasto.')
        } finally { setSubmitting(false) }
    }

    return (
        <div className="expense-container">
            <div className="expense-card">
                <div className="expense-header">
                    <i className="fas fa-arrow-trend-down"></i>
                    Registrar Gasto
                </div>
                <div className="expense-body">
                    <div className="expense-icon"><i className="fas fa-money-bill-wave"></i></div>

                    <div className="cf-eyebrow">
                        <span></span> Nuevo movimiento · Gastos
                    </div>
                    <p className="cf-subtitle">
                        Registra egresos de tu operación: insumos, mano de obra, transporte u otros gastos.
                    </p>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-expense">
                            <label htmlFor="expense_amount">
                                <i className="fas fa-dollar-sign"></i> Monto
                            </label>
                            <div className="cf-input-wrap">
                                <span className="cf-input-prefix">$</span>
                                <input
                                    type="number" step="0.01" name="amount" id="expense_amount"
                                    placeholder="0.00" value={formData.amount}
                                    onChange={handleChange} required className="cf-has-prefix"
                                />
                            </div>
                        </div>

                        <div className="form-group-expense">
                            <label htmlFor="expense_date">
                                <i className="fas fa-calendar-alt"></i> Fecha
                            </label>
                            <input
                                type="date" name="date" id="expense_date"
                                value={formData.date} onChange={handleChange} required
                            />
                        </div>

                        <div className="form-group-expense">
                            <label htmlFor="expense_category">
                                <i className="fas fa-tag"></i> Categoría
                            </label>
                            <select
                                name="category"
                                id="expense_category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Sin categoría</option>
                                <option value="Insumos agrícolas">Insumos agrícolas</option>
                                <option value="Mano de obra">Mano de obra</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Maquinaria / herramientas">Maquinaria / herramientas</option>
                                <option value="Alimentación animal">Alimentación animal</option>
                                <option value="Servicios públicos">Servicios públicos</option>
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Otros gastos">Otros gastos</option>
                            </select>
                        </div>

                        <div className="form-group-expense">
                            <label htmlFor="expense_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description" id="expense_description"
                                placeholder="Ej: Compra de fertilizantes y agroquímicos..."
                                rows={3} value={formData.description} onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-expense-submit" disabled={submitting}>
                            {submitting
                                ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                                : <><i className="fas fa-floppy-disk"></i> Guardar Gasto</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}