import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import './Register.css'

interface StrengthLevel {
    pct: string; color: string; text: string
}

const STRENGTH_LEVELS: StrengthLevel[] = [
    { pct: '25%', color: '#e74c3c', text: 'Muy débil' },
    { pct: '50%', color: '#e67e22', text: 'Débil' },
    { pct: '75%', color: '#f1c40f', text: 'Moderada' },
    { pct: '100%', color: '#2ecc71', text: 'Fuerte' },
]

export default function Register() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [gender, setGender] = useState('')
    const [experience, setExperience] = useState('')
    const [passVisible, setPassVisible] = useState(false)
    const [passConfirmVisible, setPassConfirmVisible] = useState(false)
    const [matchError, setMatchError] = useState(false)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Password strength
    const [strengthVisible, setStrengthVisible] = useState(false)
    const [strengthPct, setStrengthPct] = useState('0')
    const [strengthColor, setStrengthColor] = useState('#e74c3c')
    const [strengthText, setStrengthText] = useState('')

    const checkStrength = (value: string) => {
        if (!value) { setStrengthVisible(false); return }
        setStrengthVisible(true)
        let score = 0
        if (value.length >= 8) score++
        if (/[A-Z]/.test(value)) score++
        if (/[0-9]/.test(value)) score++
        if (/[^A-Za-z0-9]/.test(value)) score++
        const lvl = STRENGTH_LEVELS[score - 1] || STRENGTH_LEVELS[0]
        setStrengthPct(lvl.pct); setStrengthColor(lvl.color); setStrengthText(lvl.text)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== passwordConfirm) { setMatchError(true); return }
        setError(''); setSubmitting(true)

        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('phone', phone)
        formData.append('password', password)
        formData.append('password_confirmation', passwordConfirm)
        formData.append('birth_date', birthDate)
        formData.append('gender', gender)
        formData.append('experience_years', experience)

        try {
            const data = await authService.register(formData)
            if (data.success) {
                navigate(`/verify?user_id=${data.user_id}&email=${encodeURIComponent(data.email)}`)
            } else {
                let msg = 'No se pudo completar el registro.'
                if (data.errors) { const k = Object.keys(data.errors)[0]; if (k) msg = data.errors[k][0] }
                else if (data.message) msg = data.message
                setError(msg)
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
            if (error.response?.data?.errors) {
                const k = Object.keys(error.response.data.errors)[0]
                if (k) setError(error.response.data.errors[k][0])
            } else {
                setError(error.response?.data?.message || 'Error de conexión')
            }
        } finally { setSubmitting(false) }
    }

    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() - 1)

    return (
        <main className="contedido-register">
            <img src="https://s3.amazonaws.com/rtvc-assets-qa-sistemasenalcolombia.gov.co/noticias/unnamed_4_3.jpg" className="fondo" alt="fondo" />

            <div className="register-card">
                <img src="/img/LOGOYESLOGAN.jpeg" alt="Logo" className="register-logo" />
                <h1 className="register-title">Crear cuenta</h1>
                <p className="register-subtitle">Únete a AgroFinanzas y gestiona tu campo</p>

                {error && (
                    <div className="alert-error"><i className="fas fa-circle-exclamation"></i> {error}</div>
                )}

                <form onSubmit={handleSubmit} className="register-form-agro">
                    <div className="field-group">
                        <label htmlFor="name"><i className="fas fa-user"></i> Nombre completo</label>
                        <input type="text" id="name" placeholder="Juan Pérez" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="email"><i className="fas fa-envelope"></i> Correo electrónico</label>
                        <input type="email" id="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="field-group">
                        <label htmlFor="phone"><i className="fas fa-phone"></i> Teléfono <span className="optional">(opcional)</span></label>
                        <input type="tel" id="phone" placeholder="300 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password"><i className="fas fa-lock"></i> Contraseña</label>
                        <div className="password-container">
                            <input
                                type={passVisible ? 'text' : 'password'} id="password"
                                placeholder="Mínimo 8 caracteres" value={password}
                                onChange={e => { setPassword(e.target.value); checkStrength(e.target.value) }} required
                            />
                            <button type="button" className="toggle-password" onClick={() => setPassVisible(!passVisible)}>
                                <i className={`fas ${passVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {strengthVisible && (
                            <div className="strength-bar-wrapper">
                                <div className="strength-bar"><div className="strength-fill" style={{ width: strengthPct, background: strengthColor }}></div></div>
                                <span className="strength-label" style={{ color: strengthColor }}>{strengthText}</span>
                            </div>
                        )}
                    </div>

                    <div className="field-group">
                        <label htmlFor="password_confirmation"><i className="fas fa-lock"></i> Confirmar contraseña</label>
                        <div className="password-container">
                            <input
                                type={passConfirmVisible ? 'text' : 'password'} id="password_confirmation"
                                placeholder="Repite tu contraseña" value={passwordConfirm}
                                onChange={e => { setPasswordConfirm(e.target.value); setMatchError(e.target.value !== '' && password !== e.target.value) }} required
                            />
                            <button type="button" className="toggle-password" onClick={() => setPassConfirmVisible(!passConfirmVisible)}>
                                <i className={`fas ${passConfirmVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {matchError && <span className="field-error">Las contraseñas no coinciden.</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="birth_date"><i className="fas fa-calendar"></i> Fecha de nacimiento</label>
                        <input type="date" id="birth_date" value={birthDate} onChange={e => setBirthDate(e.target.value)} max={maxDate.toISOString().split('T')[0]} required />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="gender"><i className="fas fa-venus-mars"></i> Género <span className="optional">(opcional)</span></label>
                            <select id="gender" className="field-select" value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div className="field-group">
                            <label htmlFor="experience_years"><i className="fas fa-seedling"></i> Años en el campo <span className="optional">(opcional)</span></label>
                            <input type="number" id="experience_years" placeholder="Ej: 5" min={0} max={70} value={experience} onChange={e => setExperience(e.target.value)} />
                        </div>
                    </div>

                    <div className="register-button-wrapper">
                        <button type="submit" className="register-button" disabled={submitting}>
                            {submitting ? <><i className="fas fa-spinner fa-spin"></i> Creando...</> : <>Crear Cuenta</>}
                        </button>
                    </div>
                </form>

                <p className="login-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
            </div>
        </main>
    )
}
