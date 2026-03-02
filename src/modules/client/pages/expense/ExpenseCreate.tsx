import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function ExpenseCreate() {
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
            await clientService.createExpense({
                amount: Number(formData.amount),
                date: formData.date,
                description: formData.description
            })
            navigate('/client/finances')
        } catch {
            setError('Error al registrar el gasto.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="expense-container">
            <div className="expense-card">
                <div className="expense-header">
                    <i className="fas fa-minus-circle"></i> Registrar Gasto
                </div>

                <div className="expense-body">
                    <div className="expense-icon">
                        <i className="fas fa-money-bill-wave"></i>
                    </div>

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
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                id="expense_amount"
                                placeholder="Ej: 50000"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-expense">
                            <label htmlFor="expense_date">
                                <i className="fas fa-calendar-alt"></i> Fecha
                            </label>
                            <input
                                type="date"
                                name="date"
                                id="expense_date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-expense">
                            <label htmlFor="expense_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description"
                                id="expense_description"
                                placeholder="Ej: Compra de fertilizantes"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-expense-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-save"></i> Guardar Gasto</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
