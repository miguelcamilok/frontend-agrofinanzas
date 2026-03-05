import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { axiosClient } from '@shared/services/api/axiosClient'
import './EditProfile.css'

interface Tip {
    field: string
    icon: string
    title: string
    desc: string
}

const TIPS: Tip[] = [
    { field: 'name', icon: 'fa-user', title: 'Nombre completo', desc: 'Usa tu nombre real para que otros agricultores puedan reconocerte en la comunidad.' },
    { field: 'email', icon: 'fa-envelope', title: 'Correo electrónico', desc: 'Te enviamos alertas de precios y recomendaciones agrícolas a este correo.' },
    { field: 'phone', icon: 'fa-phone', title: 'Teléfono', desc: 'Opcional pero útil para recibir notificaciones de emergencia climática en tu zona.' },
    { field: 'birth_date', icon: 'fa-calendar', title: 'Fecha de nacimiento', desc: 'Nos permite personalizar recomendaciones según tu etapa de vida productiva.' },
    { field: 'gender', icon: 'fa-venus-mars', title: 'Género', desc: 'Ayuda a generar estadísticas de inclusión en el sector agrícola colombiano.' },
    { field: 'experience_years', icon: 'fa-seedling', title: 'Años en el campo', desc: 'Con más experiencia registrada, las recomendaciones serán más avanzadas y específicas.' },
]

interface Particle {
    x: number; y: number; r: number; dx: number; dy: number; alpha: number; dAlpha: number
}

export default function EditProfile() {
    const { user, updateUser, logout } = useAuth()
    const navigate = useNavigate()

    // ── Form states ──
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [gender, setGender] = useState('')
    const [experience, setExperience] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || '/img/foto_perfil.jpg')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setEmail(user.email || '')
            setPhone(user.phone || '')
            setBirthDate(user.birth_date || '')
            setGender(user.gender || '')
            setExperience(String(user.experience_years || ''))
            if (user.profile_photo) setPhotoPreview(user.profile_photo)
        }
    }, [user])

    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [activeTip, setActiveTip] = useState('name')

    // ── Delete account states ──
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [deleteCodeSent, setDeleteCodeSent] = useState(false)
    const [deleteDigits, setDeleteDigits] = useState(['', '', '', '', '', ''])
    const [deleteSending, setDeleteSending] = useState(false)
    const deleteDigitRefs = useRef<(HTMLInputElement | null)[]>([])

    const canvasRef = useRef<HTMLCanvasElement>(null)

    // ── Canvas particles ──
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)

        const particles: Particle[] = Array.from({ length: 55 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 2.5 + 0.5, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.15, dAlpha: (Math.random() - 0.5) * 0.004,
        }))

        let raf: number
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.dx; p.y += p.dy; p.alpha += p.dAlpha
                if (p.alpha <= 0.05 || p.alpha >= 0.65) p.dAlpha *= -1
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(138,201,38,${p.alpha})`; ctx.fill()
            })
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y)
                    if (dist < 100) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(138,201,38,${0.06 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke()
                    }
                }
            }
            raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    }, [])

    // ── Photo ──
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { alert('La imagen no puede superar 2MB.'); return }
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    // ── Submit perfil ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setSubmitting(true); setSuccessMsg(''); setErrorMsg('')

        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('phone', phone)
        formData.append('birth_date', birthDate)
        formData.append('gender', gender)
        formData.append('experience_years', experience)
        if (photoFile) formData.append('profile_photo', photoFile)

        try {
            const { data } = await axiosClient.post(`/users/${user.id}/update-profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            if (data.success) {
                setSuccessMsg(data.message || 'Perfil actualizado correctamente.')
                if (data.user) updateUser(data.user)
            } else {
                setErrorMsg(data.message || 'No se pudo actualizar el perfil.')
            }
        } catch {
            setErrorMsg('Error de conexión o datos inválidos.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Delete: abrir modal de confirmación ──
    const handleDeleteRequest = () => {
        setConfirmDeleteOpen(true)
    }

    // ── Delete: confirmar en modal → enviar código por correo ──
    const handleDeleteRequestConfirmed = async () => {
        if (!user) return
        setConfirmDeleteOpen(false)
        setDeleteSending(true)
        setErrorMsg('')
        try {
            await axiosClient.post(`/users/${user.id}/send-delete-code`)
            setDeleteCodeSent(true)
            setTimeout(() => deleteDigitRefs.current[0]?.focus(), 300)
        } catch {
            setErrorMsg('No se pudo enviar el código.')
        } finally {
            setDeleteSending(false)
        }
    }

    // ── Delete digit handlers ──
    const handleDeleteDigitInput = (index: number, value: string) => {
        const clean = value.replace(/[^0-9]/g, '').slice(-1)
        const newDigits = [...deleteDigits]
        newDigits[index] = clean
        setDeleteDigits(newDigits)
        if (clean && index < 5) deleteDigitRefs.current[index + 1]?.focus()
    }

    const handleDeleteDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !deleteDigits[index] && index > 0) {
            deleteDigitRefs.current[index - 1]?.focus()
        }
    }

    const handleDeleteDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (pasted.length === 6) {
            setDeleteDigits(pasted.split(''))
            deleteDigitRefs.current[5]?.focus()
        }
    }

    const allDeleteFilled = deleteDigits.every(d => d !== '')

    // ── Delete: confirmar con código ──
    const handleDeleteConfirm = useCallback(async () => {
    if (!user) return
    const code = deleteDigits.join('')
    try {
        // Cambia DELETE por POST
        await axiosClient.post(`/users/${user.id}/delete-confirm`, { code })
        logout()
        navigate('/')
    } catch {
        setErrorMsg('Código incorrecto o error al eliminar.')
    }
}, [deleteDigits, user, logout, navigate])

    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() - 1)

    const genderLabel = user?.gender === 'male' ? 'Masculino'
        : user?.gender === 'female' ? 'Femenino'
        : user?.gender === 'other' ? 'Otro'
        : 'Sin cambiar...'

    return (
        <>
            <canvas id="particles-canvas" ref={canvasRef}></canvas>

            <div className="edit-layout">

                {/* ===== TIPS PANEL ===== */}
                <aside className="tips-panel">
                    <div className="tips-header">
                        <i className="fas fa-lightbulb"></i>
                        <span>Consejos de perfil</span>
                    </div>
                    <ul className="tips-list">
                        {TIPS.map(tip => (
                            <li key={tip.field} className={`tip-item ${activeTip === tip.field ? 'active' : ''}`}>
                                <div className="tip-icon"><i className={`fas ${tip.icon}`}></i></div>
                                <div className="tip-content"><strong>{tip.title}</strong><p>{tip.desc}</p></div>
                            </li>
                        ))}
                    </ul>
                    <div className="tips-footer">
                        <i className="fas fa-circle-info"></i>
                        Solo edita los campos que desees cambiar. El resto se mantiene igual.
                    </div>
                </aside>

                {/* ===== FORM PANEL ===== */}
                <main className="profile-wrapper">
                    <div className="profile-card">
                        <h2 className="profile-title"><i className="fas fa-user-pen"></i> Editar Perfil</h2>

                        {successMsg && <div className="alert-success"><i className="fas fa-circle-check"></i> {successMsg}</div>}
                        {errorMsg && <div className="alert-error"><i className="fas fa-circle-exclamation"></i> {errorMsg}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Foto */}
                            <div className="profile-photo-container">
                                <div className="profile-photo-circle">
                                    <img id="imgPreview" src={photoPreview} alt="Foto de perfil" />
                                    <label htmlFor="photo_preview" className="photo-overlay">
                                        <i className="fas fa-camera"></i><span>Cambiar</span>
                                    </label>
                                </div>
                            </div>
                            <input type="file" id="photo_preview" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                            <p className="photo-hint">Haz clic en la foto para cambiarla · JPG, PNG · Máx 2MB</p>

                            <div className="field-group" onFocus={() => setActiveTip('name')}>
                                <label><i className="fas fa-user"></i> Nombre completo <span className="optional">(opcional)</span></label>
                                <input type="text" placeholder={user?.name || ''} value={name} onChange={e => setName(e.target.value)} />
                            </div>

                            <div className="field-group" onFocus={() => setActiveTip('email')}>
                                <label><i className="fas fa-envelope"></i> Correo electrónico <span className="optional">(opcional)</span></label>
                                <input type="email" placeholder={user?.email || ''} value={email} onChange={e => setEmail(e.target.value)} />
                            </div>

                            <div className="field-group" onFocus={() => setActiveTip('phone')}>
                                <label><i className="fas fa-phone"></i> Teléfono <span className="optional">(opcional)</span></label>
                                <input type="tel" placeholder={user?.phone || '300 123 4567'} value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>

                            <div className="field-group" onFocus={() => setActiveTip('birth_date')}>
                                <label><i className="fas fa-calendar"></i> Fecha de nacimiento <span className="optional">(opcional)</span></label>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} max={maxDate.toISOString().split('T')[0]} />
                            </div>

                            <div className="field-row">
                                <div className="field-group" onFocus={() => setActiveTip('gender')}>
                                    <label><i className="fas fa-venus-mars"></i> Género <span className="optional">(opcional)</span></label>
                                    <select className="field-select" value={gender} onChange={e => setGender(e.target.value)}>
                                        <option value="">{genderLabel}</option>
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                                <div className="field-group" onFocus={() => setActiveTip('experience_years')}>
                                    <label><i className="fas fa-seedling"></i> Años en el campo <span className="optional">(opcional)</span></label>
                                    <input type="number" placeholder={String(user?.experience_years ?? 'Ej: 5')} min={0} max={70} value={experience} onChange={e => setExperience(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting
                                    ? <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                                    : <><i className="fas fa-floppy-disk"></i> Guardar Cambios</>
                                }
                            </button>
                        </form>

                        {/* ===== DANGER ZONE ===== */}
                        <div className="danger-zone">
                            <div className="danger-zone-header">
                                <i className="fas fa-triangle-exclamation"></i>
                                <span>Zona de peligro</span>
                            </div>

                            {!deleteCodeSent ? (
                                <>
                                    <p className="danger-desc">
                                        Al eliminar tu cuenta se cerrarán todos tus datos financieros.
                                        Tus comentarios en la comunidad quedarán como anónimos.
                                    </p>
                                    <button className="delete-btn" onClick={handleDeleteRequest} disabled={deleteSending}>
                                        {deleteSending
                                            ? <><i className="fas fa-spinner fa-spin"></i> Enviando código...</>
                                            : <><i className="fas fa-trash"></i> Eliminar mi cuenta</>
                                        }
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="danger-desc">
                                        Ingresa el código de 6 dígitos enviado a{' '}
                                        <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.email}</strong>
                                    </p>
                                    <div className="delete-code-inputs">
                                        {deleteDigits.map((digit, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                className="delete-digit"
                                                maxLength={1}
                                                inputMode="numeric"
                                                autoComplete="off"
                                                value={digit}
                                                ref={el => { deleteDigitRefs.current[i] = el }}
                                                onChange={e => handleDeleteDigitInput(i, e.target.value)}
                                                onKeyDown={e => handleDeleteDigitKeyDown(i, e)}
                                                onPaste={i === 0 ? handleDeleteDigitPaste : undefined}
                                                onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                                            />
                                        ))}
                                    </div>
                                    <div className="delete-actions">
                                        <button
                                            className="delete-btn-confirm"
                                            disabled={!allDeleteFilled}
                                            onClick={handleDeleteConfirm}
                                        >
                                            <i className="fas fa-trash"></i> Confirmar eliminación
                                        </button>
                                        <button
                                            className="resend-delete-btn"
                                            onClick={handleDeleteRequestConfirmed}
                                            disabled={deleteSending}
                                        >
                                            <i className="fas fa-rotate-right"></i> Reenviar código
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            {/* ══ MODAL CONFIRMAR ELIMINACIÓN ══ */}
            <div
                className={`verify-modal-overlay ${confirmDeleteOpen ? 'open' : ''}`}
                onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteOpen(false) }}
            >
                <div className="verify-modal" style={{ borderColor: 'rgba(231,76,60,0.3)' }}>
                    <button className="verify-modal-close" onClick={() => setConfirmDeleteOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>

                    <div className="verify-modal-icon" style={{
                        background: 'rgba(231,76,60,0.08)',
                        borderColor: 'rgba(231,76,60,0.3)',
                        color: '#e74c3c',
                        animation: 'none'
                    }}>
                        <i className="fas fa-triangle-exclamation"></i>
                    </div>

                    <h2 className="verify-modal-title" style={{ color: '#e74c3c' }}>
                        ¿Eliminar cuenta?
                    </h2>
                    <p className="verify-modal-sub">
                        Esta acción es{' '}
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>irreversible</strong>.<br />
                        Se eliminarán todos tus datos financieros,<br />
                        ganado y registros permanentemente.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                        <button
                            className="verify-modal-btn"
                            onClick={handleDeleteRequestConfirmed}
                            disabled={deleteSending}
                            style={{
                                background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                                marginBottom: 0,
                                color: '#fff'
                            }}
                        >
                            {deleteSending
                                ? <><i className="fas fa-spinner fa-spin"></i> Enviando código...</>
                                : <><i className="fas fa-trash"></i> Sí, eliminar mi cuenta</>
                            }
                        </button>
                        <button
                            onClick={() => setConfirmDeleteOpen(false)}
                            style={{
                                width: '100%',
                                padding: '11px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}