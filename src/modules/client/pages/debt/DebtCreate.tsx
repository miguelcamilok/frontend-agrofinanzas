import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../../services/clientService'
import '../create-forms.css'

export default function DebtCreate() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        due_date: '',
        creditor: '',
        interest_rate: '',
        installments: '',
        paid_installments: '0',
        description: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await clientService.createDebt({
                amount: Number(formData.amount),
                date: formData.date,
                creditor: formData.creditor,
                due_date: formData.due_date || undefined,
                interest_rate: formData.interest_rate ? Number(formData.interest_rate) : undefined,
                installments: formData.installments ? Number(formData.installments) : undefined,
                paid_installments: Number(formData.paid_installments),
                description: formData.description
            })
            navigate('/client/finances')
        } catch {
            setError('Error al registrar la deuda.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="debt-container">
            <div className="debt-card">
                <div className="debt-header">
                    <i className="fas fa-credit-card"></i> Registrar Deuda/Préstamo
                </div>

                <div className="debt-body">
                    <div className="debt-icon">
                        <i className="fas fa-hand-holding-usd"></i>
                    </div>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: 20 }}>
                            <i className="fas fa-exclamation-triangle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-debt">
                            <label htmlFor="debt_amount">
                                <i className="fas fa-dollar-sign"></i> Monto del préstamo *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                id="debt_amount"
                                placeholder="Ej: 50000000"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group-debt">
                                <label htmlFor="debt_date">
                                    <i className="fas fa-calendar-alt"></i> Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    id="debt_date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group-debt">
                                <label htmlFor="debt_due">
                                    <i className="fas fa-calendar-check"></i> Vencimiento
                                </label>
                                <input
                                    type="date"
                                    name="due_date"
                                    id="debt_due"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-debt">
                            <label htmlFor="debt_creditor">
                                <i className="fas fa-university"></i> Acreedor/Banco *
                            </label>
                            <input
                                type="text"
                                name="creditor"
                                id="debt_creditor"
                                placeholder="Ej: Banco Agrario"
                                value={formData.creditor}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group-debt">
                                <label htmlFor="debt_interest">
                                    <i className="fas fa-percentage"></i> Tasa de interés (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="interest_rate"
                                    id="debt_interest"
                                    placeholder="Ej: 8.5"
                                    min="0"
                                    max="100"
                                    value={formData.interest_rate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group-debt">
                                <label htmlFor="debt_installments">
                                    <i className="fas fa-list-ol"></i> Número de cuotas
                                </label>
                                <input
                                    type="number"
                                    name="installments"
                                    id="debt_installments"
                                    placeholder="Ej: 24"
                                    min="1"
                                    value={formData.installments}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group-debt">
                            <label htmlFor="debt_paid">
                                <i className="fas fa-check-circle"></i> Cuotas ya pagadas
                            </label>
                            <input
                                type="number"
                                name="paid_installments"
                                id="debt_paid"
                                placeholder="Ej: 0"
                                min="0"
                                value={formData.paid_installments}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-debt">
                            <label htmlFor="debt_description">
                                <i className="fas fa-align-left"></i> Descripción
                            </label>
                            <textarea
                                name="description"
                                id="debt_description"
                                placeholder="Ej: Préstamo para mejoras en infraestructura"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-debt-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-save"></i> Guardar Deuda</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
