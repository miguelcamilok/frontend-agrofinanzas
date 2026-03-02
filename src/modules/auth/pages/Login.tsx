import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { authService } from '../services/authService'
import './Login.css'

export default function Login() {
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [passVisible, setPassVisible] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            const data = await authService.login(email, password, remember)
            if (data.success && data.token && data.user) {
                authLogin(data.token, data.user)
                navigate('/inicio')
            } else {
                setError(data.message || 'Credenciales inválidas')
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || 'Error de conexión')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="contenido_login">
            <img src="/img/paramo.jpg" className="fondo" alt="fondo" />

            <div className="login-card">
                <img src="/img/LOGOYESLOGAN.jpeg" alt="Logo" className="login-logo" />
                <h1 className="login-title">Iniciar Sesión</h1>
                <p className="login-subtitle">Bienvenido de vuelta</p>

                {error && (
                    <div className="alert-error">
                        <i className="fas fa-circle-exclamation"></i> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field-group">
                        <label htmlFor="email"><i className="fas fa-envelope"></i> Correo electrónico</label>
                        <input
                            type="email" id="email" placeholder="correo@ejemplo.com"
                            value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password"><i className="fas fa-lock"></i> Contraseña</label>
                        <div className="password-container">
                            <input
                                type={passVisible ? 'text' : 'password'} id="password"
                                placeholder="Tu contraseña" value={password}
                                onChange={e => setPassword(e.target.value)} required
                            />
                            <button type="button" className="toggle-password" onClick={() => setPassVisible(!passVisible)}>
                                <i className={`fas ${passVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="recordar">
                        <input type="checkbox" id="recordar" checked={remember} onChange={e => setRemember(e.target.checked)} />
                        <label htmlFor="recordar">Recordar sesión</label>
                    </div>

                    <div className="login-button-wrapper">
                        <button type="submit" className="login-button" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Ingresando...</>
                            ) : (
                                <><i className="fas fa-right-to-bracket"></i> Ingresar</>
                            )}
                        </button>
                    </div>
                </form>

                <p className="registro-link">¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
            </div>
        </main>
    )
}
