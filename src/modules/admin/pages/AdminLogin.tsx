    import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@shared/context/AuthContext'
import { adminService } from '../services/adminService'
import './AdminLogin.css'

export default function AdminLogin() {
    const { adminLogin } = useAdminAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSubmitting(true)
        try {
            const data = await adminService.login(email, password)
            if (data.success && data.token) {
                adminLogin(data.token, { id: data.admin?.id || 0, name: data.admin?.name || 'Admin', email: data.admin?.email || email })
                navigate('/admin/dashboard')
            } else {
                setError(data.message || 'Credenciales inválidas')
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            setError(e.response?.data?.message || 'Error de conexión')
        } finally { setSubmitting(false) }
    }

    return (
        <div className="admin-login-page">
            <div className="login-wrap">
                <div className="login-logo">
                    <h1>Agro<span>Finanzas</span></h1>
                    <p>Panel de Administración</p>
                </div>
                <div className="login-card">
                    <div className="login-header">
                        <i className="fas fa-shield-halved"></i>
                        <h2>Acceso Administrativo</h2>
                        <p>Solo personal autorizado</p>
                    </div>
                    <div className="login-body">
                        {error && <div className="error-box"><i className="fas fa-exclamation-circle"></i> {error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="fg">
                                <label>Correo electrónico</label>
                                <div className="fg-input">
                                    <i className="fas fa-envelope"></i>
                                    <input type="email" placeholder="admin@agrofinanzas.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                                </div>
                            </div>
                            <div className="fg">
                                <label>Contraseña</label>
                                <div className="fg-input">
                                    <i className="fas fa-lock"></i>
                                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="login-btn" disabled={submitting}>
                                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Ingresando...</> : <><i className="fas fa-right-to-bracket"></i> Ingresar al Panel</>}
                            </button>
                        </form>
                        <div className="security-note">
                            <i className="fas fa-triangle-exclamation"></i>
                            Acceso restringido. Todas las sesiones quedan registradas.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
