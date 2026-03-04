import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoCreate.css'

export default function HatoCreate() {
    const navigate     = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [mothers, setMothers]       = useState<Animal[]>([])
    const [previewUrl, setPreviewUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')

    const [formData, setFormData] = useState({
        name:       '',
        tag_number: '',
        breed:      '',
        gender:     '',
        purpose:    '',
        weight:     '',
        birth_date: '',
        origin:     '',
        mother_id:  '',
        notes:      '',
        photo:      null as File | null,
    })

    useEffect(() => {
        hatoService.getMothers()
            .then(d => setMothers(d.mothers))
            .catch(err => console.error('Error fetching mothers:', err))
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 3 * 1024 * 1024) {
            alert('La imagen no puede superar 3 MB.')
            return
        }
        setFormData(prev => ({ ...prev, photo: file }))
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await hatoService.createAnimal({
                name:       formData.name,
                tag_number: formData.tag_number,
                breed:      formData.breed,
                gender:     formData.gender,
                purpose:    formData.purpose,
                weight:     Number(formData.weight) || 0,
                birth_date: formData.birth_date,
                origin:     formData.origin,
                mother_id:  formData.mother_id ? Number(formData.mother_id) : null,
                notes:      formData.notes,
                photo:      formData.photo,
            })
            navigate('/client/hato/hato')
        } catch {
            setError('Error al registrar el animal. Revisa todos los campos obligatorios.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="cattle-form-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver a Producción Animal
            </Link>

            <div className="cattle-form-card">
                {/* Header */}
                <div className="cattle-form-header">
                    <div className="cattle-form-header-inner">
                        <div className="cattle-form-header-icon">
                            <i className="fas fa-cow"></i>
                        </div>
                        <div className="cattle-form-header-text">
                            <h2>Registrar Animal</h2>
                            <p>Complete los datos para añadir un animal al inventario</p>
                        </div>
                    </div>
                </div>

                <div className="cattle-form-body">
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
                        {/* ── FOTO ── */}
                        <p className="form-section-title">
                            <i className="fas fa-camera"></i> Fotografía
                        </p>
                        <div className="fg">
                            <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <div className="upload-icon-wrap">
                                    <i className="fas fa-cloud-arrow-up"></i>
                                </div>
                                <div className="upload-title">Subir fotografía del animal</div>
                                <div className="upload-hint">JPG, PNG · Máx. 3 MB · Opcional</div>
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
                                    id="photoPreviewImg"
                                    src={previewUrl}
                                    alt="Vista previa"
                                    style={{ display: 'block' }}
                                />
                            )}
                        </div>

                        {/* ── IDENTIFICACIÓN ── */}
                        <p className="form-section-title">
                            <i className="fas fa-id-card"></i> Identificación
                        </p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-font"></i> Nombre / Apodo</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ej: Canela"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-tag"></i> Número de arete</label>
                                <input
                                    type="text"
                                    name="tag_number"
                                    placeholder="Ej: A-042"
                                    value={formData.tag_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* ── DATOS PRINCIPALES ── */}
                        <p className="form-section-title">
                            <i className="fas fa-clipboard-list"></i> Datos Principales
                        </p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-dna"></i> Raza <span>*</span></label>
                                <input
                                    type="text"
                                    name="breed"
                                    placeholder="Ej: Holstein"
                                    required
                                    value={formData.breed}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-venus-mars"></i> Sexo <span>*</span></label>
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
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-scale-balanced"></i> Propósito <span>*</span></label>
                                <select
                                    name="purpose"
                                    required
                                    value={formData.purpose}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="milk">Producción de Leche</option>
                                    <option value="meat">Producción de Carne</option>
                                    <option value="dual">Doble Propósito</option>
                                </select>
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-weight-scale"></i> Peso promedio (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="Ej: 450"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-calendar-day"></i> Fecha de nacimiento</label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-location-dot"></i> Origen</label>
                                <select
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="born_here">Nacido en la finca</option>
                                    <option value="purchased">Comprado</option>
                                </select>
                            </div>
                        </div>

                        {/* ── GENEALOGÍA ── */}
                        {mothers.length > 0 && (
                            <>
                                <p className="form-section-title">
                                    <i className="fas fa-sitemap"></i> Genealogía
                                </p>
                                <div className="fg">
                                    <label><i className="fas fa-venus"></i> Madre (si aplica)</label>
                                    <select
                                        name="mother_id"
                                        value={formData.mother_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Sin madre registrada</option>
                                        {mothers.map(m => (
                                            <option value={m.id} key={m.id}>
                                                {m.name || 'Sin nombre'}
                                                {m.tag_number ? ` · Arete ${m.tag_number}` : ''}
                                                {m.breed ? ` · ${m.breed}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* ── OBSERVACIONES ── */}
                        <p className="form-section-title">
                            <i className="fas fa-clipboard"></i> Observaciones
                        </p>
                        <div className="fg">
                            <label><i className="fas fa-note-sticky"></i> Notas</label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Vacunas aplicadas, enfermedades previas, tratamientos..."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-floppy-disk"></i> Registrar Animal</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}