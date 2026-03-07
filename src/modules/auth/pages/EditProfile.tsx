import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/context/AuthContext'
import { axiosClient } from '@shared/services/api/axiosClient'
import './EditProfile.css'
import { recommendationsService } from '@modules/recommendations/services/recommendationsService'

interface Tip {
    field: string; icon: string; title: string; desc: string
}

const TIPS: Tip[] = [
    { field: 'name',             icon: 'fa-user',       title: 'Nombre completo',    desc: 'Usa tu nombre real para que otros productores puedan reconocerte en la comunidad.' },
    { field: 'email',            icon: 'fa-envelope',   title: 'Correo electrónico',  desc: 'Te enviamos alertas de precios y recomendaciones agrícolas a este correo.' },
    { field: 'phone',            icon: 'fa-phone',      title: 'Teléfono',            desc: 'Opcional pero útil para recibir notificaciones de emergencia climática en tu zona.' },
    { field: 'birth_date',       icon: 'fa-calendar',   title: 'Fecha de nacimiento', desc: 'Nos permite personalizar recomendaciones según tu etapa de vida productiva.' },
    { field: 'gender',           icon: 'fa-venus-mars', title: 'Género',              desc: 'Ayuda a generar estadísticas de inclusión en el sector agrícola colombiano.' },
    { field: 'experience_years', icon: 'fa-seedling',   title: 'Años en el campo',   desc: 'Con más experiencia registrada, las recomendaciones serán más avanzadas.' },
]

export default function EditProfile() {
    const { user, updateUser, logout } = useAuth()
    const navigate = useNavigate()

    // ── Formulario ──
    const [name, setName]                 = useState('')
    const [email, setEmail]               = useState('')
    const [phone, setPhone]               = useState('')
    const [birthDate, setBirthDate]       = useState('')
    const [gender, setGender]             = useState('')
    const [experience, setExperience]     = useState('')
    const [photoFile, setPhotoFile]       = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || '/img/foto_perfil.jpg')
    const [submitting, setSubmitting]     = useState(false)
    const [successMsg, setSuccessMsg]     = useState('')
    const [errorMsg, setErrorMsg]         = useState('')
    const [activeTip, setActiveTip]       = useState('name')

    // ── Likes carrusel ──
    const [likedRecs, setLikedRecs]     = useState<any[]>([])
    const [carouselIdx, setCarouselIdx] = useState(0)

    // ── Eliminar cuenta ──
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [deleteCodeSent, setDeleteCodeSent]       = useState(false)
    const [deleteDigits, setDeleteDigits]           = useState(['', '', '', '', '', ''])
    const [deleteSending, setDeleteSending]         = useState(false)
    const deleteDigitRefs = useRef<(HTMLInputElement | null)[]>([])

    // ── Efectos ──
    useEffect(() => {
        recommendationsService.getLikedRecommendations()
            .then(data => setLikedRecs(data))
            .catch(() => {})
    }, [])

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

    // ── Handlers ──
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { alert('La imagen no puede superar 2MB.'); return }
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

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

    const handleDeleteRequestConfirmed = async () => {
        if (!user) return
        setConfirmDeleteOpen(false); setDeleteSending(true); setErrorMsg('')
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

    const handleDeleteDigitInput = (index: number, value: string) => {
        const clean = value.replace(/[^0-9]/g, '').slice(-1)
        const nd = [...deleteDigits]; nd[index] = clean; setDeleteDigits(nd)
        if (clean && index < 5) deleteDigitRefs.current[index + 1]?.focus()
    }

    const handleDeleteDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !deleteDigits[index] && index > 0)
            deleteDigitRefs.current[index - 1]?.focus()
    }

    const handleDeleteDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
        if (pasted.length === 6) { setDeleteDigits(pasted.split('')); deleteDigitRefs.current[5]?.focus() }
    }

    const allDeleteFilled = deleteDigits.every(d => d !== '')

    const handleDeleteConfirm = useCallback(async () => {
        if (!user) return
        try {
            await axiosClient.post(`/users/${user.id}/delete-confirm`, { code: deleteDigits.join('') })
            logout(); navigate('/')
        } catch {
            setErrorMsg('Código incorrecto o error al eliminar.')
        }
    }, [deleteDigits, user, logout, navigate])

    // ── Helpers ──
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() - 1)

    const genderLabel = user?.gender === 'male' ? 'Masculino'
        : user?.gender === 'female' ? 'Femenino'
        : user?.gender === 'other' ? 'Otro'
        : 'Sin cambiar...'

    const initials = (user?.name || 'A').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    const activeTipData = TIPS.find(t => t.field === activeTip)

    return (
        <div className="ep-root">

            {/* ══ FONDO ══ */}
            <div className="ep-bg">
                <div className="ep-bg__field"></div>
                <div className="ep-bg__overlay"></div>
                <div className="ep-bg__texture"></div>
            </div>

            <div className="ep-layout">

                {/* ══ SIDEBAR ══ */}
                <aside className="ep-sidebar">

                    <div className="ep-profile-card">
                        <div className="ep-avatar-wrap">
                            <div className="ep-avatar">
                                {photoPreview
                                    ? <img src={photoPreview} alt="Foto de perfil" className="ep-avatar__img" />
                                    : <span className="ep-avatar__initials">{initials}</span>
                                }
                                <label htmlFor="photo_input" className="ep-avatar__overlay">
                                    <i className="fas fa-camera"></i>
                                    <span>Cambiar</span>
                                </label>
                            </div>
                            <input
                                type="file" id="photo_input" accept="image/*"
                                style={{ display: 'none' }} onChange={handlePhotoChange}
                            />
                        </div>
                        <div className="ep-profile-card__info">
                            <h2 className="ep-profile-card__name">{user?.name || 'Productor'}</h2>
                            <span className="ep-profile-card__email">{user?.email || ''}</span>
                            {user?.experience_years && (
                                <div className="ep-profile-card__badge">
                                    <i className="fas fa-seedling"></i>
                                    {user.experience_years} años en el campo
                                </div>
                            )}
                        </div>
                        <p className="ep-avatar-hint">
                            <i className="fas fa-circle-info"></i>
                            JPG o PNG · Máx 2 MB
                        </p>
                    </div>

                    <div className="ep-tip-card">
                        <div className="ep-tip-card__header">
                            <i className="fas fa-lightbulb"></i>
                            <span>Consejo</span>
                        </div>
                        {activeTipData && (
                            <div className="ep-tip-card__body" key={activeTip}>
                                <div className="ep-tip-card__icon">
                                    <i className={`fas ${activeTipData.icon}`}></i>
                                </div>
                                <strong>{activeTipData.title}</strong>
                                <p>{activeTipData.desc}</p>
                            </div>
                        )}
                        <div className="ep-tip-card__dots">
                            {TIPS.map(t => (
                                <span
                                    key={t.field}
                                    className={`ep-tip-dot ${activeTip === t.field ? 'active' : ''}`}
                                    onClick={() => setActiveTip(t.field)}
                                ></span>
                            ))}
                        </div>
                    </div>

                    <div className="ep-tips-list">
                        {TIPS.map(tip => (
                            <div
                                key={tip.field}
                                className={`ep-tips-item ${activeTip === tip.field ? 'active' : ''}`}
                                onClick={() => setActiveTip(tip.field)}
                            >
                                <span className="ep-tips-item__icon">
                                    <i className={`fas ${tip.icon}`}></i>
                                </span>
                                <span className="ep-tips-item__label">{tip.title}</span>
                                {activeTip === tip.field && <i className="fas fa-chevron-right ep-tips-item__arrow"></i>}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ══ MAIN ══ */}
                <main className="ep-main">

                    {/* 1. Encabezado */}
                    <div className="ep-main__header">
                        <div className="ep-main__eyebrow">
                            <span></span>
                            AgroFinanzas · Mi Cuenta
                        </div>
                        <h1 className="ep-main__title">
                            Editar <em>Perfil</em>
                        </h1>
                        <p className="ep-main__sub">
                            Actualiza tu información para recibir recomendaciones personalizadas del campo colombiano.
                        </p>
                    </div>

                    {/* 2. Alertas */}
                    {successMsg && (
                        <div className="ep-alert ep-alert--success">
                            <i className="fas fa-circle-check"></i>
                            <span>{successMsg}</span>
                        </div>
                    )}
                    {errorMsg && (
                        <div className="ep-alert ep-alert--error">
                            <i className="fas fa-circle-exclamation"></i>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* 3. Formulario */}
                    <form className="ep-form" onSubmit={handleSubmit}>

                        <div className="ep-section">
                            <div className="ep-section__label">
                                <i className="fas fa-id-card"></i> Información personal
                            </div>
                            <div className="ep-field" onFocus={() => setActiveTip('name')}>
                                <label className="ep-label">
                                    <i className="fas fa-user"></i> Nombre completo
                                    <span className="ep-label__opt">opcional</span>
                                </label>
                                <input
                                    type="text" className="ep-input"
                                    placeholder={user?.name || 'Tu nombre completo'}
                                    value={name} onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="ep-row">
                                <div className="ep-field" onFocus={() => setActiveTip('birth_date')}>
                                    <label className="ep-label">
                                        <i className="fas fa-calendar"></i> Fecha de nacimiento
                                        <span className="ep-label__opt">opcional</span>
                                    </label>
                                    <input
                                        type="date" className="ep-input"
                                        value={birthDate} onChange={e => setBirthDate(e.target.value)}
                                        max={maxDate.toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="ep-field" onFocus={() => setActiveTip('gender')}>
                                    <label className="ep-label">
                                        <i className="fas fa-venus-mars"></i> Género
                                        <span className="ep-label__opt">opcional</span>
                                    </label>
                                    <select className="ep-input ep-select" value={gender} onChange={e => setGender(e.target.value)}>
                                        <option value="">{genderLabel}</option>
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="ep-section">
                            <div className="ep-section__label">
                                <i className="fas fa-address-book"></i> Contacto
                            </div>
                            <div className="ep-field" onFocus={() => setActiveTip('email')}>
                                <label className="ep-label">
                                    <i className="fas fa-envelope"></i> Correo electrónico
                                    <span className="ep-label__opt">opcional</span>
                                </label>
                                <input
                                    type="email" className="ep-input"
                                    placeholder={user?.email || 'tucorreo@campo.co'}
                                    value={email} onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="ep-field" onFocus={() => setActiveTip('phone')}>
                                <label className="ep-label">
                                    <i className="fas fa-phone"></i> Teléfono
                                    <span className="ep-label__opt">opcional</span>
                                </label>
                                <input
                                    type="tel" className="ep-input"
                                    placeholder={user?.phone || '300 123 4567'}
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="ep-section">
                            <div className="ep-section__label">
                                <i className="fas fa-wheat-awn"></i> Experiencia agrícola
                            </div>
                            <div className="ep-field ep-field--experience" onFocus={() => setActiveTip('experience_years')}>
                                <label className="ep-label">
                                    <i className="fas fa-seedling"></i> Años trabajando el campo
                                    <span className="ep-label__opt">opcional</span>
                                </label>
                                <div className="ep-experience-wrap">
                                    <input
                                        type="number" className="ep-input ep-input--exp"
                                        placeholder={String(user?.experience_years ?? '0')}
                                        min={0} max={70}
                                        value={experience} onChange={e => setExperience(e.target.value)}
                                    />
                                    <div className="ep-exp-bar">
                                        <div
                                            className="ep-exp-bar__fill"
                                            style={{ width: `${Math.min(100, (parseInt(experience || '0') / 50) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="ep-exp-label">
                                        {!experience || experience === '0' ? 'Sin experiencia registrada'
                                            : parseInt(experience) < 3  ? 'Productor nuevo'
                                            : parseInt(experience) < 10 ? 'Productor con experiencia'
                                            : parseInt(experience) < 25 ? 'Productor veterano'
                                            : 'Maestro del campo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="ep-submit" disabled={submitting}>
                            {submitting
                                ? <><i className="fas fa-spinner fa-spin"></i> Guardando cambios...</>
                                : <><i className="fas fa-floppy-disk"></i> Guardar Cambios</>}
                        </button>
                    </form>

                    {/* 4. Zona de peligro */}
                    <div className="ep-danger">
                        <div className="ep-danger__header">
                            <i className="fas fa-triangle-exclamation"></i>
                            <span>Zona de peligro</span>
                        </div>
                        {!deleteCodeSent ? (
                            <>
                                <p className="ep-danger__desc">
                                    Al eliminar tu cuenta se borrarán todos tus datos financieros y registros.
                                    Tus comentarios en la comunidad quedarán como anónimos.
                                </p>
                                <button className="ep-danger__btn" onClick={() => setConfirmDeleteOpen(true)} disabled={deleteSending}>
                                    {deleteSending
                                        ? <><i className="fas fa-spinner fa-spin"></i> Enviando código...</>
                                        : <><i className="fas fa-trash"></i> Eliminar mi cuenta</>}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="ep-danger__desc">
                                    Ingresa el código de 6 dígitos enviado a{' '}
                                    <strong style={{ color: 'rgba(192,57,43,.7)' }}>{user?.email}</strong>
                                </p>
                                <div className="ep-code-inputs">
                                    {deleteDigits.map((digit, i) => (
                                        <input
                                            key={i} type="text" className="ep-code-digit"
                                            maxLength={1} inputMode="numeric" autoComplete="off"
                                            value={digit}
                                            ref={el => { deleteDigitRefs.current[i] = el }}
                                            onChange={e => handleDeleteDigitInput(i, e.target.value)}
                                            onKeyDown={e => handleDeleteDigitKeyDown(i, e)}
                                            onPaste={i === 0 ? handleDeleteDigitPaste : undefined}
                                            onKeyPress={e => { if (!/[0-9]/.test(e.key)) e.preventDefault() }}
                                        />
                                    ))}
                                </div>
                                <div className="ep-danger__actions">
                                    <button
                                        className="ep-danger__confirm"
                                        disabled={!allDeleteFilled}
                                        onClick={handleDeleteConfirm}
                                    >
                                        <i className="fas fa-trash"></i> Confirmar eliminación
                                    </button>
                                    <button className="ep-danger__resend" onClick={handleDeleteRequestConfirmed} disabled={deleteSending}>
                                        <i className="fas fa-rotate-right"></i> Reenviar código
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 5. Carrusel de likes — debajo de zona de peligro ══ */}
                    {likedRecs.length > 0 && (
                        <div className="ep-likes-section">
                            <div className="ep-likes-header">
                                <div className="ep-likes-title">
                                    <i className="fas fa-heart"></i>
                                    Publicaciones que te gustaron
                                </div>
                                <button
                                    className="ep-likes-verall"
                                    onClick={() => navigate('/editar-perfil/likes')}
                                >
                                    Ver todas <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>

                            <div className="ep-likes-carousel">
                                {likedRecs.slice(0, 10).map((rec, i) => (
                                    <div
                                        key={rec.id}
                                        className={`ep-like-card ${i === carouselIdx ? 'active' : ''}`}
                                        onClick={() => setCarouselIdx(i)}
                                    >
                                        <div className="ep-like-card__cat">{rec.category}</div>
                                        <p className="ep-like-card__text">
                                            {rec.content?.slice(0, 80)}{rec.content?.length > 80 ? '…' : ''}
                                        </p>
                                        <div className="ep-like-card__author">
                                            <i className="fas fa-user-circle"></i>
                                            {rec.user?.name || 'Anónimo'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ep-likes-dots">
                                {likedRecs.slice(0, 10).map((_, i) => (
                                    <span
                                        key={i}
                                        className={`ep-likes-dot ${i === carouselIdx ? 'active' : ''}`}
                                        onClick={() => setCarouselIdx(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* ══ MODAL CONFIRMAR ══ */}
            <div
                className={`ep-modal-overlay ${confirmDeleteOpen ? 'open' : ''}`}
                onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteOpen(false) }}
            >
                <div className="ep-modal">
                    <button className="ep-modal__close" onClick={() => setConfirmDeleteOpen(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="ep-modal__icon">
                        <i className="fas fa-triangle-exclamation"></i>
                    </div>
                    <h2 className="ep-modal__title">¿Eliminar cuenta?</h2>
                    <p className="ep-modal__sub">
                        Esta acción es <strong>irreversible</strong>.<br />
                        Se eliminarán todos tus datos financieros,<br />
                        ganado y registros permanentemente.
                    </p>
                    <button
                        className="ep-modal__btn ep-modal__btn--danger"
                        onClick={handleDeleteRequestConfirmed}
                        disabled={deleteSending}
                    >
                        {deleteSending
                            ? <><i className="fas fa-spinner fa-spin"></i> Enviando código...</>
                            : <><i className="fas fa-trash"></i> Sí, eliminar mi cuenta</>}
                    </button>
                    <button className="ep-modal__btn ep-modal__btn--cancel" onClick={() => setConfirmDeleteOpen(false)}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}