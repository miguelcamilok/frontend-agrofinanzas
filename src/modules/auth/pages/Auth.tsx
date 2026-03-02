import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { authService } from '../services/authService'
import './Auth.css'

interface StrengthLevel {
    pct: string
    color: string
    text: string
}

const STRENGTH_LEVELS: StrengthLevel[] = [
    { pct: '25%', color: '#e74c3c', text: 'Muy débil' },
    { pct: '50%', color: '#e67e22', text: 'Débil' },
    { pct: '75%', color: '#f1c40f', text: 'Moderada' },
    { pct: '100%', color: '#8ac926', text: 'Fuerte' },
]

export default function Auth() {
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // ── Form state ──
    const isRegisterRoute = location.pathname === '/register'
    const [isRegister, setIsRegister] = useState(isRegisterRoute)
    const [flipHeight, setFlipHeight] = useState<string>('auto')

    // Login
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [loginRemember, setLoginRemember] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [loginSubmitting, setLoginSubmitting] = useState(false)
    const [loginPassVisible, setLoginPassVisible] = useState(false)

    // Register
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPhone, setRegPhone] = useState('')
    const [regBirthDate, setRegBirthDate] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
    const [regGender, setRegGender] = useState('')
    const [regExperience, setRegExperience] = useState('')
    const [regError, setRegError] = useState('')
    const [regSubmitting, setRegSubmitting] = useState(false)
    const [regPassVisible, setRegPassVisible] = useState(false)
    const [regPassConfirmVisible, setRegPassConfirmVisible] = useState(false)
    const [matchError, setMatchError] = useState(false)

    // Password strength
    const [strengthVisible, setStrengthVisible] = useState(false)
    const [strengthPct, setStrengthPct] = useState('0')
    const [strengthColor, setStrengthColor] = useState('#e74c3c')
    const [strengthText, setStrengthText] = useState('')

    // Verification modal
    const [verifyOpen, setVerifyOpen] = useState(false)
    const [verifyUserId, setVerifyUserId] = useState<number>(0)
    const [verifyEmail, setVerifyEmail] = useState('')
    const [verifyDigits, setVerifyDigits] = useState<string[]>(['', '', '', '', '', ''])
    const [verifySubmitting, setVerifySubmitting] = useState(false)
    const [verifyAlert, setVerifyAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null)
    const [verifyTimeLeft, setVerifyTimeLeft] = useState(900)
    const [resendDisabled, setResendDisabled] = useState(false)

    const flipRef = useRef<HTMLDivElement>(null)
    const frontRef = useRef<HTMLDivElement>(null)
    const backRef = useRef<HTMLDivElement>(null)
    const digitRefs = useRef<(HTMLInputElement | null)[]>([])
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Flip height ──
    const updateHeight = useCallback((toRegister: boolean) => {
        if (toRegister && backRef.current) {
            setFlipHeight(backRef.current.scrollHeight + 'px')
        } else if (frontRef.current) {
            setFlipHeight(frontRef.current.scrollHeight + 'px')
        }
    }, [])

    useEffect(() => {
        updateHeight(isRegister)
    }, [isRegister, updateHeight])

    // ── Flip handlers ──
    const switchToRegister = () => {
        setIsRegister(true)
        setLoginError('')
    }

    const switchToLogin = () => {
        setIsRegister(false)
        setRegError('')
    }

    // ── Password strength ──
    const checkStrength = (value: string) => {
        if (!value) { setStrengthVisible(false); return }
        setStrengthVisible(true)
        let score = 0
        if (value.length >= 8) score++
        if (/[A-Z]/.test(value)) score++
        if (/[0-9]/.test(value)) score++
        if (/[^A-Za-z0-9]/.test(value)) score++
        const lvl = STRENGTH_LEVELS[score - 1] || STRENGTH_LEVELS[0]
        setStrengthPct(lvl.pct)
        setStrengthColor(lvl.color)
        setStrengthText(lvl.text)
    }

    // ── Login submit ──
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setLoginSubmitting(true)
        try {
            const data = await authService.login(loginEmail, loginPassword, loginRemember)
            if (data.success && data.token && data.user) {
                authLogin(data.token, data.user)
                navigate('/inicio')
            } else {
                setLoginError(data.message || 'Credenciales inválidas')
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setLoginError(error.response?.data?.message || 'Error de conexión')
        } finally {
            setLoginSubmitting(false)
        }
    }

    // ── Register submit ──
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (regPassword !== regPasswordConfirm) {
            setMatchError(true)
            return
        }
        setRegError('')
        setRegSubmitting(true)

        const formData = new FormData()
        formData.append('name', regName)
        formData.append('email', regEmail)
        formData.append('phone', regPhone)
        formData.append('birth_date', regBirthDate)
        formData.append('password', regPassword)
        formData.append('password_confirmation', regPasswordConfirm)
        formData.append('gender', regGender)
        formData.append('experience_years', regExperience)

        try {
            const data = await authService.register(formData)
            if (data.success) {
                openVerifyModal(data.user_id, data.email)
            } else {
                let msg = 'No se pudo completar el registro.'
                if (data.errors) {
                    const firstKey = Object.keys(data.errors)[0]
                    if (firstKey) msg = data.errors[firstKey][0]
                } else if (data.message) {
                    msg = data.message
                }
                setRegError(msg)
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
            if (error.response?.data?.errors) {
                const firstKey = Object.keys(error.response.data.errors)[0]
                if (firstKey) setRegError(error.response.data.errors[firstKey][0])
            } else {
                setRegError(error.response?.data?.message || 'Error de conexión')
            }
        } finally {
            setRegSubmitting(false)
        }
    }

    // ── Verify modal ──
    const openVerifyModal = (userId: number, email: string) => {
        setVerifyUserId(userId)
        setVerifyEmail(email)
        setVerifyDigits(['', '', '', '', '', ''])
        setVerifyAlert(null)
        setVerifyOpen(true)
        startCountdown()
        setTimeout(() => digitRefs.current[0]?.focus(), 350)
    }

    const closeVerifyModal = () => {
        setVerifyOpen(false)
        if (countdownRef.current) clearInterval(countdownRef.current)
    }

    const startCountdown = () => {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setVerifyTimeLeft(900)
        countdownRef.current = setInterval(() => {
            setVerifyTimeLeft(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    useEffect(() => {
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [])

    const formatTime = (seconds: number) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0')
        const s = String(seconds % 60).padStart(2, '0')
        return `${m}:${s}`
    }

    // ── Digit input handlers ──
    const handleDigitInput = (index: number, value: string) => {
        const clean = value.replace(/[^0-9]/g, '').slice(-1)
        const newDigits = [...verifyDigits]
        newDigits[index] = clean
        setVerifyDigits(newDigits)
        if (clean && index < 5) digitRefs.current[index + 1]?.focus()
    }

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verifyDigits[index] && index > 0) {
            digitRefs.current[index - 1]?.focus()
        }
    }

    const handleDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (pasted.length === 6) {
            const newDigits = pasted.split('')
            setVerifyDigits(newDigits)
            digitRefs.current[5]?.focus()
        }
    }

    const allDigitsFilled = verifyDigits.every(d => d !== '')

    // ── Verify submit ──
    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const code = verifyDigits.join('')
        setVerifySubmitting(true)
        setVerifyAlert(null)
        try {
            const data = await authService.verifyCode(verifyUserId, code)
            if (data.success || data.redirect) {
                if (data.token && data.user) {
                    authLogin(data.token, data.user)
                }
                navigate(data.redirect || '/inicio')
            } else {
                setVerifyAlert({ type: 'error', msg: data.message || 'Código incorrecto' })
            }
        } catch {
            setVerifyAlert({ type: 'error', msg: 'Error de conexión' })
        } finally {
            setVerifySubmitting(false)
        }
    }

    const handleResend = async () => {
        setResendDisabled(true)
        try {
            await authService.resendCode(verifyUserId)
            setVerifyAlert({ type: 'success', msg: 'Código reenviado. Revisa tu correo.' })
            startCountdown()
        } catch {
            setVerifyAlert({ type: 'error', msg: 'No se pudo reenviar el código.' })
        }
        setTimeout(() => setResendDisabled(false), 3000)
    }

    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() - 1)

    return (
        <div className="auth-page">
            {/* Fondo */}
            <div className="auth-bg">
                <img src="/img/paramo.jpg" alt="fondo" />
            </div>
            <div className="auth-lines"></div>

            <div className="auth-wrapper" id="authWrapper">
                {/* ══ PANEL IZQUIERDO ══ */}
                <div className="auth-panel">
                    <div className="panel-ornament"></div>
                    <img src="/img/LOGOYESLOGAN.jpeg" alt="Logo" className="panel-logo" />
                    <h1 className="panel-title">Agro<em>Finanzas</em></h1>
                    <div className="panel-divider"></div>
                    <p className="panel-sub">Decisiones inteligentes para el campo</p>

                    <div className="panel-cta">
                        <p>{isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta aún?'}</p>
                        <button
                            className="panel-switch-btn"
                            onClick={isRegister ? switchToLogin : switchToRegister}
                        >
                            <i className={`fas ${isRegister ? 'fa-right-to-bracket' : 'fa-user-plus'}`}></i>
                            <span>{isRegister ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                        </button>
                    </div>
                </div>

                {/* ══ FORMULARIOS ══ */}
                <div className="auth-forms">
                    <div className="form-flip-wrapper">
                        <div
                            className={`form-flip-inner ${isRegister ? 'flipped' : ''}`}
                            ref={flipRef}
                            style={{ height: flipHeight }}
                        >
                            {/* ── CARA FRONTAL: LOGIN ── */}
                            <div className="form-face form-face--front" ref={frontRef}>
                                <div className="auth-form-inner">
                                    <p className="form-eyebrow">Bienvenido de vuelta</p>
                                    <h2 className="form-heading">Iniciar <em>sesión</em></h2>
                                    <p className="form-desc">Accede a tu cuenta para gestionar tu campo</p>

                                    {loginError && (
                                        <div className="alert-error">
                                            <i className="fas fa-circle-exclamation"></i> {loginError}
                                        </div>
                                    )}

                                    <form onSubmit={handleLogin}>
                                        <div className="field-group">
                                            <label><i className="fas fa-envelope"></i> Correo electrónico</label>
                                            <input
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={loginEmail}
                                                onChange={e => setLoginEmail(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label><i className="fas fa-lock"></i> Contraseña</label>
                                            <div className="password-container">
                                                <input
                                                    type={loginPassVisible ? 'text' : 'password'}
                                                    placeholder="Tu contraseña"
                                                    value={loginPassword}
                                                    onChange={e => setLoginPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={() => setLoginPassVisible(!loginPassVisible)}
                                                >
                                                    <i className={`fas ${loginPassVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="recordar">
                                            <input
                                                type="checkbox"
                                                id="recordar"
                                                checked={loginRemember}
                                                onChange={e => setLoginRemember(e.target.checked)}
                                            />
                                            <label htmlFor="recordar">Recordar sesión</label>
                                        </div>
                                        <button type="submit" className="auth-submit-btn" disabled={loginSubmitting}>
                                            {loginSubmitting ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Ingresando...</>
                                            ) : (
                                                <><i className="fas fa-right-to-bracket"></i> Ingresar</>
                                            )}
                                        </button>
                                    </form>

                                    <p className="form-footer-link">
                                        ¿No tienes cuenta? <button onClick={switchToRegister}>Regístrate aquí</button>
                                    </p>
                                </div>
                            </div>

                            {/* ── CARA TRASERA: REGISTER ── */}
                            <div className="form-face form-face--back" ref={backRef}>
                                <div className="auth-form-inner">
                                    <p className="form-eyebrow">Únete a la comunidad</p>
                                    <h2 className="form-heading">Crear <em>cuenta</em></h2>
                                    <p className="form-desc">Gestiona tu campo con inteligencia financiera</p>

                                    {regError && (
                                        <div className="alert-error">
                                            <i className="fas fa-circle-exclamation"></i> {regError}
                                        </div>
                                    )}

                                    <form onSubmit={handleRegister} className="register-form">
                                        {/* Fila 1: Nombre + Correo */}
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-user"></i> Nombre</label>
                                                <input type="text" placeholder="Juan Pérez" value={regName} onChange={e => setRegName(e.target.value)} required />
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-envelope"></i> Correo</label>
                                                <input type="email" placeholder="correo@ejemplo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                                            </div>
                                        </div>

                                        {/* Fila 2: Teléfono + Nacimiento */}
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-phone"></i> Teléfono <span className="optional">(opc.)</span></label>
                                                <input type="tel" placeholder="300 123 4567" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-calendar"></i> Nacimiento</label>
                                                <input type="date" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} max={maxDate.toISOString().split('T')[0]} required />
                                            </div>
                                        </div>

                                        {/* Fila 3: Contraseña + Confirmar */}
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-lock"></i> Contraseña</label>
                                                <div className="password-container">
                                                    <input
                                                        type={regPassVisible ? 'text' : 'password'}
                                                        placeholder="Mínimo 8 caracteres"
                                                        value={regPassword}
                                                        onChange={e => { setRegPassword(e.target.value); checkStrength(e.target.value) }}
                                                        required
                                                    />
                                                    <button type="button" className="toggle-password" onClick={() => setRegPassVisible(!regPassVisible)}>
                                                        <i className={`fas ${regPassVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-lock"></i> Confirmar</label>
                                                <div className="password-container">
                                                    <input
                                                        type={regPassConfirmVisible ? 'text' : 'password'}
                                                        placeholder="Repite tu contraseña"
                                                        value={regPasswordConfirm}
                                                        onChange={e => {
                                                            setRegPasswordConfirm(e.target.value)
                                                            setMatchError(e.target.value !== '' && regPassword !== e.target.value)
                                                        }}
                                                        required
                                                    />
                                                    <button type="button" className="toggle-password" onClick={() => setRegPassConfirmVisible(!regPassConfirmVisible)}>
                                                        <i className={`fas ${regPassConfirmVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                {matchError && <span className="field-error">No coinciden.</span>}
                                            </div>
                                        </div>

                                        {/* Barra fuerza contraseña */}
                                        {strengthVisible && (
                                            <div className="strength-bar-wrapper">
                                                <div className="strength-bar">
                                                    <div className="strength-fill" style={{ width: strengthPct, background: strengthColor }}></div>
                                                </div>
                                                <span className="strength-label" style={{ color: strengthColor }}>{strengthText}</span>
                                            </div>
                                        )}

                                        {/* Fila 4: Género + Experiencia */}
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-venus-mars"></i> Género <span className="optional">(opc.)</span></label>
                                                <select className="field-select" value={regGender} onChange={e => setRegGender(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="male">Masculino</option>
                                                    <option value="female">Femenino</option>
                                                    <option value="other">Otro</option>
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-seedling"></i> Años en campo <span className="optional">(opc.)</span></label>
                                                <input type="number" placeholder="Ej: 5" min={0} max={70} value={regExperience} onChange={e => setRegExperience(e.target.value)} />
                                            </div>
                                        </div>

                                        <button type="submit" className="auth-submit-btn" disabled={regSubmitting}>
                                            {regSubmitting ? (
                                                <><i className="fas fa-spinner fa-spin"></i> Creando...</>
                                            ) : (
                                                <><i className="fas fa-user-plus"></i> Crear Cuenta</>
                                            )}
                                        </button>
                                    </form>

                                    <p className="form-footer-link">
                                        ¿Ya tienes cuenta? <button onClick={switchToLogin}>Inicia sesión</button>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ══ MODAL VERIFICACIÓN ══ */}
            <div
                className={`verify-modal-overlay ${verifyOpen ? 'open' : ''}`}
                onClick={e => { if (e.target === e.currentTarget) closeVerifyModal() }}
            >
                <div className="verify-modal">
                    <button className="verify-modal-close" onClick={closeVerifyModal} aria-label="Cerrar">
                        <i className="fas fa-times"></i>
                    </button>

                    <div className="verify-modal-icon">
                        <i className="fas fa-envelope-open-text"></i>
                    </div>

                    <h2 className="verify-modal-title">Verifica tu cuenta</h2>
                    <p className="verify-modal-sub">
                        Ingresa el código de 6 dígitos enviado a<br />
                        <strong>{verifyEmail}</strong>
                    </p>

                    {verifyAlert && (
                        <div className={`verify-modal-alert ${verifyAlert.type}`}>
                            <i className={`fas ${verifyAlert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                            <span>{verifyAlert.msg}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerifySubmit}>
                        <div className="verify-code-inputs">
                            {verifyDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    className="verify-digit"
                                    maxLength={1}
                                    inputMode="numeric"
                                    pattern="[0-9]"
                                    autoComplete="off"
                                    value={digit}
                                    ref={el => { digitRefs.current[i] = el }}
                                    onChange={e => handleDigitInput(i, e.target.value)}
                                    onKeyDown={e => handleDigitKeyDown(i, e)}
                                    onPaste={i === 0 ? handleDigitPaste : undefined}
                                    onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className={`verify-modal-btn ${allDigitsFilled ? 'ready' : ''}`}
                            disabled={!allDigitsFilled || verifySubmitting}
                        >
                            {verifySubmitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Verificando...</>
                            ) : (
                                <><i className="fas fa-shield-check"></i> Verificar cuenta</>
                            )}
                        </button>
                    </form>

                    <p className="verify-modal-timer">
                        {verifyTimeLeft > 0 ? (
                            <>El código expira en <span style={verifyTimeLeft <= 60 ? { color: '#e74c3c' } : undefined}>{formatTime(verifyTimeLeft)}</span></>
                        ) : (
                            <span style={{ color: '#e74c3c' }}>El código expiró. Reenvía uno nuevo.</span>
                        )}
                    </p>

                    <div className="verify-modal-resend">
                        ¿No llegó?
                        <button onClick={handleResend} disabled={resendDisabled}>
                            {resendDisabled ? 'Enviando...' : 'Reenviar código'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}
