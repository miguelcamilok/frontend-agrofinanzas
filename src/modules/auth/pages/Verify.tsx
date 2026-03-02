import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { authService } from '../services/authService'
import './Verify.css'

export default function Verify() {
    const { login: authLogin } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const userId = Number(searchParams.get('user_id') ?? 0)
    const email = searchParams.get('email') ?? 'tu correo'

    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
    const [submitting, setSubmitting] = useState(false)
    const [alert, setAlert] = useState<{ type: 'error' | 'success'; msg: string } | null>(null)
    const [timeLeft, setTimeLeft] = useState(900) // 15 min
    const [resendDisabled, setResendDisabled] = useState(false)

    const digitRefs = useRef<(HTMLInputElement | null)[]>([])
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Countdown ──
    const startCountdown = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setTimeLeft(900)
        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) clearInterval(countdownRef.current)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [])

    useEffect(() => {
        startCountdown()
        setTimeout(() => digitRefs.current[0]?.focus(), 950)
        return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
    }, [startCountdown])

    const formatTime = (s: number) => {
        const m = String(Math.floor(s / 60)).padStart(2, '0')
        const sec = String(s % 60).padStart(2, '0')
        return `${m}:${sec}`
    }

    const allFilled = digits.every(d => d !== '')

    // ── Digit handlers ──
    const handleInput = (index: number, value: string) => {
        const clean = value.replace(/[^0-9]/g, '').slice(-1)
        const newDigits = [...digits]
        newDigits[index] = clean
        setDigits(newDigits)
        if (clean && index < 5) digitRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                const newDigits = [...digits]
                newDigits[index - 1] = ''
                setDigits(newDigits)
                digitRefs.current[index - 1]?.focus()
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (pasted.length >= 6) {
            setDigits(pasted.slice(0, 6).split(''))
            digitRefs.current[5]?.focus()
        }
    }

    // ── Submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const code = digits.join('')
        setSubmitting(true)
        setAlert(null)
        try {
            const data = await authService.verifyCode(userId, code)
            if (data.success || data.redirect) {
                if (data.token && data.user) {
                    authLogin(data.token, data.user)
                }
                navigate(data.redirect || '/inicio')
            } else {
                setAlert({ type: 'error', msg: data.message || 'Código incorrecto' })
            }
        } catch {
            setAlert({ type: 'error', msg: 'Error de conexión' })
        } finally {
            setSubmitting(false)
        }
    }

    // ── Resend ──
    const handleResend = async () => {
        setResendDisabled(true)
        try {
            await authService.resendCode(userId)
            setAlert({ type: 'success', msg: 'Código reenviado. Revisa tu correo.' })
            startCountdown()
        } catch {
            setAlert({ type: 'error', msg: 'No se pudo reenviar el código.' })
        }
        setTimeout(() => setResendDisabled(false), 3000)
    }

    return (
        <div className="verify-page">
            <img src="/img/paramo.jpg" className="verify-bg-img" alt="fondo" />
            <div className="verify-bg-glow"></div>
            <div className="verify-particles"></div>

            <div className="verify-card">

                {/* Ícono */}
                <div className="verify-icon-wrap">
                    <div className="verify-icon-ring">
                        <i className="fas fa-envelope-open-text"></i>
                        <span className="verify-icon-dot"></span>
                    </div>
                </div>

                {/* Textos */}
                <p className="verify-eyebrow">Paso final</p>
                <h1 className="verify-title">Verifica tu correo</h1>
                <p className="verify-subtitle">
                    Ingresa el código de 6 dígitos que enviamos a
                    <strong>{email}</strong>
                </p>

                {/* Alertas */}
                {alert && (
                    <div className={`v-alert ${alert.type}`}>
                        <i className={`fas ${alert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                        {alert.msg}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="code-inputs">
                        {digits.map((digit, i) => (
                            <input
                                key={i}
                                type="text"
                                className={`digit-input ${digit ? 'filled' : ''}`}
                                maxLength={1}
                                inputMode="numeric"
                                pattern="[0-9]"
                                autoComplete="off"
                                value={digit}
                                ref={el => { digitRefs.current[i] = el }}
                                onChange={e => handleInput(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className={`verify-btn ${allFilled ? 'ready' : ''}`}
                        disabled={!allFilled || submitting}
                    >
                        {submitting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Verificando...</>
                        ) : (
                            <><i className="fas fa-shield-check"></i> Verificar cuenta</>
                        )}
                    </button>
                </form>

                {/* Separador */}
                <div className="verify-sep">
                    <div className="verify-sep-line"></div>
                    <div className="verify-sep-dot"></div>
                    <div className="verify-sep-line"></div>
                </div>

                {/* Timer */}
                <div className="verify-timer">
                    {timeLeft > 0 ? (
                        <>
                            <span>Expira en</span>
                            <span className={`timer-badge ${timeLeft <= 60 ? 'expiring' : ''}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </>
                    ) : (
                        <span className="timer-expired-text">
                            <i className="fas fa-clock"></i> El código expiró. Reenvía uno nuevo.
                        </span>
                    )}
                </div>

                {/* Reenviar */}
                <div className="resend-section">
                    <p className="resend-label">¿No llegó el correo?</p>
                    <button className="resend-btn" onClick={handleResend} disabled={resendDisabled}>
                        {resendDisabled ? (
                            <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
                        ) : (
                            <><i className="fas fa-rotate-right"></i> Reenviar código</>
                        )}
                    </button>
                </div>

                {/* Volver */}
                <div className="back-link">
                    <Link to="/register">
                        <i className="fas fa-arrow-left"></i> Volver al registro
                    </Link>
                </div>

            </div>
        </div>
    )
}
