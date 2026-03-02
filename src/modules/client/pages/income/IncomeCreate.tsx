import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function IncomeCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await clientService.createIncome({
                amount: Number(formData.amount),
                date: formData.date,
                description: formData.description
            })
            navigate('/client/finances')
        } catch {
            setError('Error al guardar el ingreso.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="income-container">
            <div className="income-card">
                <div className="income-header">
                    <i className="fas fa-plus-circle"></i> Registrar Ingreso
                </div>

                <div className="income-body">
                    <div className="income-icon">
                        <i className="fas fa-hand-holding-usd"></i>
                    </div>

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
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                id="income_amount"
                                placeholder="Ej: 150000"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-income">
                            <label htmlFor="income_date">
                                <i className="fas fa-calendar-alt"></i> Fecha
                            </label>
                            <input
                                type="date"
                                name="date"
                                id="income_date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-income">
                            <label htmlFor="income_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description"
                                id="income_description"
                                placeholder="Ej: Venta de productos agrícolas"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-income-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-save"></i> Guardar Ingreso</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
