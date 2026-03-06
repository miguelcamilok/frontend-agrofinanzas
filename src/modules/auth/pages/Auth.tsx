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
    { pct: '25%', color: '#c0392b', text: 'Muy débil' },
    { pct: '50%', color: '#e67e22', text: 'Débil' },
    { pct: '75%', color: '#d4841a', text: 'Moderada' },
    { pct: '100%', color: '#4A7C3F', text: 'Fuerte' },
]

export default function Auth() {
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

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
    const [strengthColor, setStrengthColor] = useState('#c0392b')
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

    // Forgot password modal
    const [forgotOpen, setForgotOpen] = useState(false)
    const [forgotStep, setForgotStep] = useState<'email' | 'code'>('email')
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotUserId, setForgotUserId] = useState<number>(0)
    const [forgotUserEmail, setForgotUserEmail] = useState('')
    const [forgotDigits, setForgotDigits] = useState<string[]>(['', '', '', '', '', ''])
    const [forgotNewPass, setForgotNewPass] = useState('')
    const [forgotNewPassConfirm, setForgotNewPassConfirm] = useState('')
    const [forgotNewPassVisible, setForgotNewPassVisible] = useState(false)
    const [forgotNewPassConfirmVisible, setForgotNewPassConfirmVisible] = useState(false)
    const [forgotSubmitting, setForgotSubmitting] = useState(false)
    const [forgotAlert, setForgotAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null)
    const [forgotTimeLeft, setForgotTimeLeft] = useState(900)
    const [forgotResendDisabled, setForgotResendDisabled] = useState(false)
    const [forgotMatchError, setForgotMatchError] = useState(false)

    const flipRef = useRef<HTMLDivElement>(null)
    const frontRef = useRef<HTMLDivElement>(null)
    const backRef = useRef<HTMLDivElement>(null)
    const digitRefs = useRef<(HTMLInputElement | null)[]>([])
    const forgotDigitRefs = useRef<(HTMLInputElement | null)[]>([])
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const forgotCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const updateHeight = useCallback((toRegister: boolean) => {
        if (toRegister && backRef.current) setFlipHeight(backRef.current.scrollHeight + 'px')
        else if (frontRef.current) setFlipHeight(frontRef.current.scrollHeight + 'px')
    }, [])

    useEffect(() => { updateHeight(isRegister) }, [isRegister, updateHeight])

    const switchToRegister = () => { setIsRegister(true); setLoginError('') }
    const switchToLogin    = () => { setIsRegister(false); setRegError('') }

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setLoginError(''); setLoginSubmitting(true)
        try {
            const data = await authService.login(loginEmail, loginPassword, loginRemember)
            if (data.success && data.token && data.user) { authLogin(data.token, data.user); navigate('/inicio') }
            else setLoginError(data.message || 'Credenciales inválidas')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setLoginError(error.response?.data?.message || 'Error de conexión')
        } finally { setLoginSubmitting(false) }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (regPassword !== regPasswordConfirm) { setMatchError(true); return }
        setRegError(''); setRegSubmitting(true)
        const formData = new FormData()
        formData.append('name', regName); formData.append('email', regEmail)
        formData.append('phone', regPhone); formData.append('birth_date', regBirthDate)
        formData.append('password', regPassword); formData.append('password_confirmation', regPasswordConfirm)
        formData.append('gender', regGender); formData.append('experience_years', regExperience)
        try {
            const data = await authService.register(formData)
            if (data.success) { openVerifyModal(data.user_id, data.email) }
            else {
                let msg = 'No se pudo completar el registro.'
                if (data.errors) { const k = Object.keys(data.errors)[0]; if (k) msg = data.errors[k][0] }
                else if (data.message) msg = data.message
                setRegError(msg)
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
            if (error.response?.data?.errors) { const k = Object.keys(error.response.data.errors)[0]; if (k) setRegError(error.response.data.errors[k][0]) }
            else setRegError(error.response?.data?.message || 'Error de conexión')
        } finally { setRegSubmitting(false) }
    }

    const openVerifyModal = (userId: number, email: string) => {
        setVerifyUserId(userId); setVerifyEmail(email)
        setVerifyDigits(['', '', '', '', '', '']); setVerifyAlert(null)
        setVerifyOpen(true); startCountdown()
        setTimeout(() => digitRefs.current[0]?.focus(), 350)
    }
    const closeVerifyModal = () => { setVerifyOpen(false); if (countdownRef.current) clearInterval(countdownRef.current) }

    const startCountdown = () => {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setVerifyTimeLeft(900)
        countdownRef.current = setInterval(() => {
            setVerifyTimeLeft(prev => { if (prev <= 1) { if (countdownRef.current) clearInterval(countdownRef.current); return 0 } return prev - 1 })
        }, 1000)
    }

    const startForgotCountdown = () => {
        if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current)
        setForgotTimeLeft(900)
        forgotCountdownRef.current = setInterval(() => {
            setForgotTimeLeft(prev => { if (prev <= 1) { if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current); return 0 } return prev - 1 })
        }, 1000)
    }

    useEffect(() => () => {
        if (countdownRef.current) clearInterval(countdownRef.current)
        if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current)
    }, [])

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

    const handleDigitInput = (i: number, v: string) => {
        const c = v.replace(/[^0-9]/g, '').slice(-1)
        const d = [...verifyDigits]; d[i] = c; setVerifyDigits(d)
        if (c && i < 5) digitRefs.current[i + 1]?.focus()
    }
    const handleDigitKeyDown = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !verifyDigits[i] && i > 0) digitRefs.current[i - 1]?.focus() }
    const handleDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault(); const p = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (p.length === 6) { setVerifyDigits(p.split('')); digitRefs.current[5]?.focus() }
    }

    const handleForgotDigitInput = (i: number, v: string) => {
        const c = v.replace(/[^0-9]/g, '').slice(-1)
        const d = [...forgotDigits]; d[i] = c; setForgotDigits(d)
        if (c && i < 5) forgotDigitRefs.current[i + 1]?.focus()
    }
    const handleForgotDigitKeyDown = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !forgotDigits[i] && i > 0) forgotDigitRefs.current[i - 1]?.focus() }
    const handleForgotDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault(); const p = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (p.length === 6) { setForgotDigits(p.split('')); forgotDigitRefs.current[5]?.focus() }
    }

    const allVerifyFilled = verifyDigits.every(d => d !== '')
    const allForgotFilled = forgotDigits.every(d => d !== '')

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setVerifySubmitting(true); setVerifyAlert(null)
        try {
            const data = await authService.verifyCode(verifyUserId, verifyDigits.join(''))
            if (data.success || data.redirect) { if (data.token && data.user) authLogin(data.token, data.user); navigate(data.redirect || '/inicio') }
            else setVerifyAlert({ type: 'error', msg: data.message || 'Código incorrecto' })
        } catch { setVerifyAlert({ type: 'error', msg: 'Error de conexión' }) }
        finally { setVerifySubmitting(false) }
    }

    const handleResend = async () => {
        setResendDisabled(true)
        try { await authService.resendCode(verifyUserId); setVerifyAlert({ type: 'success', msg: 'Código reenviado. Revisa tu correo.' }); startCountdown() }
        catch { setVerifyAlert({ type: 'error', msg: 'No se pudo reenviar el código.' }) }
        setTimeout(() => setResendDisabled(false), 3000)
    }

    const openForgotModal = () => {
        setForgotOpen(true); setForgotStep('email'); setForgotEmail('')
        setForgotDigits(['', '', '', '', '', '']); setForgotNewPass(''); setForgotNewPassConfirm('')
        setForgotAlert(null); setForgotMatchError(false)
    }
    const closeForgotModal = () => { setForgotOpen(false); if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current) }

    const handleForgotEmail = async (e: React.FormEvent) => {
        e.preventDefault(); setForgotSubmitting(true); setForgotAlert(null)
        try {
            const data = await authService.forgotPassword(forgotEmail)
            if (data.success && data.user_id) {
                setForgotUserId(data.user_id); setForgotUserEmail(data.email ?? forgotEmail)
                setForgotStep('code'); startForgotCountdown()
                setTimeout(() => forgotDigitRefs.current[0]?.focus(), 350)
            } else setForgotAlert({ type: 'error', msg: data.message || 'No se pudo enviar el código.' })
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setForgotAlert({ type: 'error', msg: error.response?.data?.message || 'Error de conexión' })
        } finally { setForgotSubmitting(false) }
    }

    const handleForgotReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (forgotNewPass !== forgotNewPassConfirm) { setForgotMatchError(true); return }
        setForgotMatchError(false); setForgotSubmitting(true); setForgotAlert(null)
        try {
            const data = await authService.resetPassword(forgotUserId, forgotDigits.join(''), forgotNewPass, forgotNewPassConfirm)
            if (data.success) {
                setForgotAlert({ type: 'success', msg: '¡Contraseña restablecida! Ya puedes iniciar sesión.' })
                if (forgotCountdownRef.current) clearInterval(forgotCountdownRef.current)
                setTimeout(() => closeForgotModal(), 2500)
            } else {
                setForgotAlert({ type: 'error', msg: data.message || 'Código incorrecto.' })
                if (data.expired) { setForgotStep('email'); setForgotDigits(['', '', '', '', '', '']) }
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setForgotAlert({ type: 'error', msg: error.response?.data?.message || 'Error de conexión' })
        } finally { setForgotSubmitting(false) }
    }

    const handleForgotResend = async () => {
        setForgotResendDisabled(true)
        try {
            const data = await authService.forgotPassword(forgotUserEmail)
            if (data.success) { setForgotAlert({ type: 'success', msg: 'Código reenviado. Revisa tu correo.' }); startForgotCountdown(); setForgotDigits(['', '', '', '', '', '']) }
        } catch { setForgotAlert({ type: 'error', msg: 'No se pudo reenviar el código.' }) }
        setTimeout(() => setForgotResendDisabled(false), 3000)
    }

    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() - 1)

    return (
        <div className="auth-page">
            <div className="auth-bg"><img src="/img/paramo.jpg" alt="fondo" /></div>
            <div className="auth-lines" />

            <div className="auth-wrapper" id="authWrapper">

                {/* ══ PANEL IZQUIERDO ══ */}
                <div className="auth-panel">
                    <div className="panel-ornament" />
                    <div className="auth-panel-texture" />
                    <img src="/img/nvlogo.png" alt="Logo" className="panel-logo" />
                    <h1 className="panel-title">Agro<em>Finanzas</em></h1>
                    <div className="panel-divider" />
                    <p className="panel-sub">Decisiones inteligentes para el campo</p>
                    <div className="panel-features">
                        <div className="panel-feature-item"><i className="fas fa-chart-line" /><span>Gestión financiera completa</span></div>
                        <div className="panel-feature-item"><i className="fas fa-seedling" /><span>Control de cultivos y lotes</span></div>
                        <div className="panel-feature-item"><i className="fas fa-horse" /><span>Módulo ganadero integrado</span></div>
                        <div className="panel-feature-item"><i className="fas fa-users" /><span>Comunidad de agricultores</span></div>
                    </div>
                    <div className="panel-cta">
                        <p>{isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta aún?'}</p>
                        <button className="panel-switch-btn" onClick={isRegister ? switchToLogin : switchToRegister}>
                            <i className={`fas ${isRegister ? 'fa-right-to-bracket' : 'fa-user-plus'}`} />
                            <span>{isRegister ? 'Iniciar sesión' : 'Crear cuenta'}</span>
                        </button>
                    </div>
                </div>

                {/* ══ FORMULARIOS ══ */}
                <div className="auth-forms">
                    <div className="form-flip-wrapper">
                        <div className={`form-flip-inner ${isRegister ? 'flipped' : ''}`} ref={flipRef} style={{ height: flipHeight }}>

                            {/* ── LOGIN ── */}
                            <div className="form-face form-face--front" ref={frontRef}>
                                <div className="auth-form-inner">
                                    <p className="form-eyebrow">Bienvenido de vuelta</p>
                                    <h2 className="form-heading">Iniciar <em>sesión</em></h2>
                                    <p className="form-desc">Accede a tu cuenta para gestionar tu campo</p>
                                    {loginError && <div className="alert-error"><i className="fas fa-circle-exclamation" /> {loginError}</div>}
                                    <form onSubmit={handleLogin}>
                                        <div className="field-group">
                                            <label><i className="fas fa-envelope" /> Correo electrónico</label>
                                            <input type="email" placeholder="correo@ejemplo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoFocus />
                                        </div>
                                        <div className="field-group">
                                            <label><i className="fas fa-lock" /> Contraseña</label>
                                            <div className="password-container">
                                                <input type={loginPassVisible ? 'text' : 'password'} placeholder="Tu contraseña" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                                <button type="button" className="toggle-password" onClick={() => setLoginPassVisible(!loginPassVisible)}>
                                                    <i className={`fas ${loginPassVisible ? 'fa-eye-slash' : 'fa-eye'}`} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="login-extras">
                                            <div className="recordar">
                                                <input type="checkbox" id="recordar" checked={loginRemember} onChange={e => setLoginRemember(e.target.checked)} />
                                                <label htmlFor="recordar">Recordar sesión</label>
                                            </div>
                                            <button type="button" className="forgot-link" onClick={openForgotModal}>
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                        <button type="submit" className="auth-submit-btn" disabled={loginSubmitting}>
                                            {loginSubmitting ? <><i className="fas fa-spinner fa-spin" /> Ingresando...</> : <><i className="fas fa-right-to-bracket" /> Ingresar</>}
                                        </button>
                                    </form>
                                    <p className="form-footer-link">¿No tienes cuenta? <button onClick={switchToRegister}>Regístrate aquí</button></p>
                                </div>
                            </div>

                            {/* ── REGISTER ── */}
                            <div className="form-face form-face--back" ref={backRef}>
                                <div className="auth-form-inner">
                                    <p className="form-eyebrow">Únete a la comunidad</p>
                                    <h2 className="form-heading">Crear <em>cuenta</em></h2>
                                    <p className="form-desc">Gestiona tu campo con inteligencia financiera</p>
                                    {regError && <div className="alert-error"><i className="fas fa-circle-exclamation" /> {regError}</div>}
                                    <form onSubmit={handleRegister} className="register-form">
                                        <div className="field-row">
                                            <div className="field-group"><label><i className="fas fa-user" /> Nombre</label><input type="text" placeholder="Juan Pérez" value={regName} onChange={e => setRegName(e.target.value)} required /></div>
                                            <div className="field-group"><label><i className="fas fa-envelope" /> Correo</label><input type="email" placeholder="correo@ejemplo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required /></div>
                                        </div>
                                        <div className="field-row">
                                            <div className="field-group"><label><i className="fas fa-phone" /> Teléfono <span className="optional">(opc.)</span></label><input type="tel" placeholder="300 123 4567" value={regPhone} onChange={e => setRegPhone(e.target.value)} /></div>
                                            <div className="field-group"><label><i className="fas fa-calendar" /> Nacimiento</label><input type="date" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} max={maxDate.toISOString().split('T')[0]} required /></div>
                                        </div>
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-lock" /> Contraseña</label>
                                                <div className="password-container">
                                                    <input type={regPassVisible ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={regPassword} onChange={e => { setRegPassword(e.target.value); checkStrength(e.target.value) }} required />
                                                    <button type="button" className="toggle-password" onClick={() => setRegPassVisible(!regPassVisible)}><i className={`fas ${regPassVisible ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-lock" /> Confirmar</label>
                                                <div className="password-container">
                                                    <input type={regPassConfirmVisible ? 'text' : 'password'} placeholder="Repite tu contraseña" value={regPasswordConfirm} onChange={e => { setRegPasswordConfirm(e.target.value); setMatchError(e.target.value !== '' && regPassword !== e.target.value) }} required />
                                                    <button type="button" className="toggle-password" onClick={() => setRegPassConfirmVisible(!regPassConfirmVisible)}><i className={`fas ${regPassConfirmVisible ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                                                </div>
                                                {matchError && <span className="field-error">No coinciden.</span>}
                                            </div>
                                        </div>
                                        {strengthVisible && (
                                            <div className="strength-bar-wrapper">
                                                <div className="strength-bar"><div className="strength-fill" style={{ width: strengthPct, background: strengthColor }} /></div>
                                                <span className="strength-label" style={{ color: strengthColor }}>{strengthText}</span>
                                            </div>
                                        )}
                                        <div className="field-row">
                                            <div className="field-group">
                                                <label><i className="fas fa-venus-mars" /> Género <span className="optional">(opc.)</span></label>
                                                <select className="field-select" value={regGender} onChange={e => setRegGender(e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    <option value="male">Masculino</option>
                                                    <option value="female">Femenino</option>
                                                    <option value="other">Otro</option>
                                                </select>
                                            </div>
                                            <div className="field-group">
                                                <label><i className="fas fa-seedling" /> Años en campo <span className="optional">(opc.)</span></label>
                                                <input type="number" placeholder="Ej: 5" min={0} max={70} value={regExperience} onChange={e => setRegExperience(e.target.value)} />
                                            </div>
                                        </div>
                                        <button type="submit" className="auth-submit-btn" disabled={regSubmitting}>
                                            {regSubmitting ? <><i className="fas fa-spinner fa-spin" /> Creando...</> : <><i className="fas fa-user-plus" /> Crear Cuenta</>}
                                        </button>
                                    </form>
                                    <p className="form-footer-link">¿Ya tienes cuenta? <button onClick={switchToLogin}>Inicia sesión</button></p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ══ MODAL VERIFICACIÓN (registro) ══ */}
            <div className={`verify-modal-overlay ${verifyOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeVerifyModal() }}>
                <div className="verify-modal">
                    <button className="verify-modal-close" onClick={closeVerifyModal}><i className="fas fa-times" /></button>
                    <div className="verify-modal-icon"><i className="fas fa-envelope-open-text" /></div>
                    <h2 className="verify-modal-title">Verifica tu cuenta</h2>
                    <p className="verify-modal-sub">Ingresa el código de 6 dígitos enviado a<br /><strong>{verifyEmail}</strong></p>
                    {verifyAlert && (
                        <div className={`verify-modal-alert ${verifyAlert.type}`}>
                            <i className={`fas ${verifyAlert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} /><span>{verifyAlert.msg}</span>
                        </div>
                    )}
                    <form onSubmit={handleVerifySubmit}>
                        <div className="verify-code-inputs">
                            {verifyDigits.map((digit, i) => (
                                <input key={i} type="text" className="verify-digit" maxLength={1} inputMode="numeric" pattern="[0-9]" autoComplete="off" value={digit}
                                    ref={el => { digitRefs.current[i] = el }}
                                    onChange={e => handleDigitInput(i, e.target.value)}
                                    onKeyDown={e => handleDigitKeyDown(i, e)}
                                    onPaste={i === 0 ? handleDigitPaste : undefined}
                                    onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                                />
                            ))}
                        </div>
                        <button type="submit" className={`verify-modal-btn ${allVerifyFilled ? 'ready' : ''}`} disabled={!allVerifyFilled || verifySubmitting}>
                            {verifySubmitting ? <><i className="fas fa-spinner fa-spin" /> Verificando...</> : <><i className="fas fa-shield-check" /> Verificar cuenta</>}
                        </button>
                    </form>
                    <p className="verify-modal-timer">
                        {verifyTimeLeft > 0
                            ? <>El código expira en <span style={verifyTimeLeft <= 60 ? { color: '#c0392b' } : undefined}>{formatTime(verifyTimeLeft)}</span></>
                            : <span style={{ color: '#c0392b' }}>El código expiró. Reenvía uno nuevo.</span>}
                    </p>
                    <div className="verify-modal-resend">
                        ¿No llegó? <button onClick={handleResend} disabled={resendDisabled}>{resendDisabled ? 'Enviando...' : 'Reenviar código'}</button>
                    </div>
                </div>
            </div>

            {/* ══ MODAL OLVIDÉ CONTRASEÑA ══ */}
            <div className={`verify-modal-overlay ${forgotOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeForgotModal() }}>
                <div className="verify-modal">
                    <button className="verify-modal-close" onClick={closeForgotModal}><i className="fas fa-times" /></button>

                    {/* PASO 1: correo */}
                    {forgotStep === 'email' && (
                        <>
                            <div className="verify-modal-icon verify-modal-icon--key"><i className="fas fa-key" /></div>
                            <h2 className="verify-modal-title">Recuperar contraseña</h2>
                            <p className="verify-modal-sub">Ingresa tu correo y te enviaremos<br />un código de 6 dígitos</p>
                            {forgotAlert && (
                                <div className={`verify-modal-alert ${forgotAlert.type}`}>
                                    <i className={`fas ${forgotAlert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} /><span>{forgotAlert.msg}</span>
                                </div>
                            )}
                            <form onSubmit={handleForgotEmail} style={{ width: '100%' }}>
                                <div className="field-group" style={{ marginBottom: '20px' }}>
                                    <label><i className="fas fa-envelope" /> Correo electrónico</label>
                                    <input type="email" placeholder="correo@ejemplo.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus />
                                </div>
                                <button type="submit" className="verify-modal-btn verify-modal-btn--send" disabled={forgotSubmitting}>
                                    {forgotSubmitting ? <><i className="fas fa-spinner fa-spin" /> Enviando...</> : <><i className="fas fa-paper-plane" /> Enviar código</>}
                                </button>
                            </form>
                        </>
                    )}

                    {/* PASO 2: código + nueva contraseña */}
                    {forgotStep === 'code' && (
                        <>
                            <div className="verify-modal-icon"><i className="fas fa-lock-open" /></div>
                            <h2 className="verify-modal-title">Nueva contraseña</h2>
                            <p className="verify-modal-sub">Código enviado a<br /><strong>{forgotUserEmail}</strong></p>
                            {forgotAlert && (
                                <div className={`verify-modal-alert ${forgotAlert.type}`}>
                                    <i className={`fas ${forgotAlert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`} /><span>{forgotAlert.msg}</span>
                                </div>
                            )}
                            <form onSubmit={handleForgotReset} style={{ width: '100%' }}>
                                <div className="verify-code-inputs">
                                    {forgotDigits.map((digit, i) => (
                                        <input key={i} type="text" className="verify-digit" maxLength={1} inputMode="numeric" pattern="[0-9]" autoComplete="off" value={digit}
                                            ref={el => { forgotDigitRefs.current[i] = el }}
                                            onChange={e => handleForgotDigitInput(i, e.target.value)}
                                            onKeyDown={e => handleForgotDigitKeyDown(i, e)}
                                            onPaste={i === 0 ? handleForgotDigitPaste : undefined}
                                            onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                                        />
                                    ))}
                                </div>
                                <div className="field-group" style={{ marginBottom: '12px' }}>
                                    <label><i className="fas fa-lock" /> Nueva contraseña</label>
                                    <div className="password-container">
                                        <input type={forgotNewPassVisible ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={forgotNewPass} onChange={e => setForgotNewPass(e.target.value)} required />
                                        <button type="button" className="toggle-password" onClick={() => setForgotNewPassVisible(!forgotNewPassVisible)}><i className={`fas ${forgotNewPassVisible ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                                    </div>
                                </div>
                                <div className="field-group" style={{ marginBottom: '20px' }}>
                                    <label><i className="fas fa-lock" /> Confirmar contraseña</label>
                                    <div className="password-container">
                                        <input type={forgotNewPassConfirmVisible ? 'text' : 'password'} placeholder="Repite tu contraseña" value={forgotNewPassConfirm} onChange={e => { setForgotNewPassConfirm(e.target.value); setForgotMatchError(e.target.value !== '' && forgotNewPass !== e.target.value) }} required />
                                        <button type="button" className="toggle-password" onClick={() => setForgotNewPassConfirmVisible(!forgotNewPassConfirmVisible)}><i className={`fas ${forgotNewPassConfirmVisible ? 'fa-eye-slash' : 'fa-eye'}`} /></button>
                                    </div>
                                    {forgotMatchError && <span className="field-error">Las contraseñas no coinciden.</span>}
                                </div>
                                <button type="submit" className={`verify-modal-btn ${allForgotFilled ? 'ready' : ''}`} disabled={!allForgotFilled || forgotSubmitting}>
                                    {forgotSubmitting ? <><i className="fas fa-spinner fa-spin" /> Guardando...</> : <><i className="fas fa-shield-check" /> Restablecer contraseña</>}
                                </button>
                            </form>
                            <p className="verify-modal-timer">
                                {forgotTimeLeft > 0
                                    ? <>El código expira en <span style={forgotTimeLeft <= 60 ? { color: '#c0392b' } : undefined}>{formatTime(forgotTimeLeft)}</span></>
                                    : <span style={{ color: '#c0392b' }}>El código expiró. Reenvía uno nuevo.</span>}
                            </p>
                            <div className="verify-modal-resend">
                                ¿No llegó? <button onClick={handleForgotResend} disabled={forgotResendDisabled}>{forgotResendDisabled ? 'Enviando...' : 'Reenviar código'}</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    )
}