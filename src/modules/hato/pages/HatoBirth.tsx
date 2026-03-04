import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoBirth.css'

export default function HatoBirth() {
    const { id }        = useParams<{ id: string }>()
    const navigate      = useNavigate()
    const fileInputRef  = useRef<HTMLInputElement>(null)
    const [mother, setMother]       = useState<Animal | null>(null)
    const [loading, setLoading]     = useState(true)
    const [previewUrl, setPreviewUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]         = useState('')

    const [formData, setFormData] = useState({
        name:       '',
        tag_number: '',
        gender:     '',
        birth_date: new Date().toISOString().split('T')[0],
        notes:      '',
        photo:      null as File | null,
    })

    useEffect(() => {
        if (!id) return
        hatoService.getAnimal(Number(id))
            .then(d => setMother(d.animal))
            .catch(() => setError('No se pudo encontrar la información de la madre.'))
            .finally(() => setLoading(false))
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }))
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mother) return
        setSubmitting(true)
        setError('')
        try {
            await hatoService.registerBirth({
                mother_id:  mother.id,
                name:       formData.name,
                tag_number: formData.tag_number,
                gender:     formData.gender,
                birth_date: formData.birth_date,
                notes:      formData.notes,
                photo:      formData.photo,
            })
            navigate('/client/hato/hato')
        } catch {
            setError('Error al registrar el nacimiento. Revisa los campos e intenta de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="birth-page">
            <div className="birth-card">
                <div className="birth-header">
                    <div className="birth-header-inner">
                        <div className="birth-header-icon">
                            <i className="fas fa-circle-notch fa-spin"></i>
                        </div>
                        <div className="birth-header-text">
                            <h2>Cargando...</h2>
                            <p>Obteniendo información de la madre</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="birth-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver a Producción Animal
            </Link>

            <div className="birth-card">
                {/* Header */}
                <div className="birth-header">
                    <div className="birth-header-inner">
                        <div className="birth-header-icon">
                            <i className="fas fa-stethoscope"></i>
                        </div>
                        <div className="birth-header-text">
                            <h2>Registrar Parto</h2>
                            <p>El ternero quedará vinculado automáticamente a su madre</p>
                        </div>
                    </div>
                </div>

                <div className="birth-body">
                    {/* Info de la madre */}
                    {mother && (
                        <div className="mother-info-box">
                            {mother.photo_url || mother.photo ? (
                                <img src={mother.photo_url ?? mother.photo} alt="Madre" />
                            ) : (
                                <div className="mother-placeholder">
                                    <i className="fas fa-cow"></i>
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div className="mother-info-box__name">
                                    {mother.name || 'Sin nombre'}
                                    {mother.tag_number && (
                                        <span className="mother-info-box__tag">
                                            <i className="fas fa-tag"></i> Arete #{mother.tag_number}
                                        </span>
                                    )}
                                </div>
                                <div className="mother-info-box__meta">
                                    <i className="fas fa-dna"></i>
                                    {mother.breed || '—'}
                                    {mother.age_text && (
                                        <>
                                            <span style={{ opacity: .3 }}>·</span>
                                            <i className="fas fa-hourglass-half"></i>
                                            {mother.age_text}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,.08)',
                            border: '1px solid rgba(239,68,68,.28)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            color: '#ef4444',
                            fontSize: '0.84rem',
                            marginBottom: 22,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                        }}>
                            <i className="fas fa-triangle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Foto */}
                        <div className="fg">
                            <label><i className="fas fa-camera"></i> Foto del ternero</label>
                            <div className="photo-drop" onClick={() => fileInputRef.current?.click()}>
                                <div className="drop-icon-wrap">
                                    <i className="fas fa-cloud-arrow-up"></i>
                                </div>
                                <div className="drop-title">Subir fotografía</div>
                                <div className="drop-hint">Opcional · JPG, PNG · Máx. 3 MB</div>
                            </div>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                            />
                            {previewUrl && (
                                <img
                                    id="calfPreview"
                                    src={previewUrl}
                                    alt="Vista previa"
                                    style={{ display: 'block' }}
                                />
                            )}
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-font"></i> Nombre / Apodo</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ej: Café"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-tag"></i> Número de arete</label>
                                <input
                                    type="text"
                                    name="tag_number"
                                    placeholder="Ej: T-001"
                                    value={formData.tag_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label>
                                    <i className="fas fa-venus-mars"></i> Sexo
                                    <span>*</span>
                                </label>
                                <select
                                    name="gender"
                                    required
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="female">Hembra</option>
                                    <option value="male">Macho</option>
                                </select>
                            </div>
                            <div className="fg">
                                <label>
                                    <i className="fas fa-calendar-day"></i> Fecha de nacimiento
                                    <span>*</span>
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    required
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="fg">
                            <label><i className="fas fa-clipboard"></i> Notas / Observaciones</label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Peso al nacer, condición, tratamientos iniciales..."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="birth-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Registrando...</>
                            ) : (
                                <><i className="fas fa-stethoscope"></i> Confirmar Registro de Parto</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}