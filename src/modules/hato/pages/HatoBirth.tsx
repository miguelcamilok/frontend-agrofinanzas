import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoBirth.css'

export default function HatoBirth() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [mother, setMother] = useState<Animal | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        tag_number: '',
        gender: '',
        birth_date: new Date().toISOString().split('T')[0],
        notes: '',
        photo: null as File | null
    })

    useEffect(() => {
        const fetchMother = async () => {
            if (!id) return
            try {
                const data = await hatoService.getAnimal(Number(id))
                setMother(data.animal)
            } catch (err) {
                setError('No se pudo encontrar la información de la madre.')
            } finally {
                setLoading(false)
            }
        }
        fetchMother()
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
                mother_id: mother.id,
                name: formData.name,
                tag_number: formData.tag_number,
                gender: formData.gender,
                birth_date: formData.birth_date,
                notes: formData.notes,
                photo: formData.photo
            })
            navigate('/client/hato/hato')
        } catch (err) {
            setError('Error al registrar el nacimiento.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="birth-page"><div className="birth-card"><div className="birth-header">Cargando...</div></div></div>

    return (
        <div className="birth-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver al hato
            </Link>

            <div className="birth-card">
                <div className="birth-header">
                    <h2><i className="fas fa-baby"></i> Registrar Nacimiento</h2>
                    <p>Registra el ternero nacido y queda vinculado automáticamente a su madre</p>
                </div>

                <div className="birth-body">
                    {/* Info de la madre */}
                    {mother && (
                        <div className="mother-info-box">
                            {mother.photo_url ? (
                                <img src={mother.photo_url} alt="Madre" />
                            ) : (
                                <div className="mother-placeholder">🐄</div>
                            )}
                            <div>
                                <div className="mother-info-box__name">
                                    Madre: {mother.name || 'Sin nombre'}
                                    {mother.tag_number && <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}> · Arete {mother.tag_number}</span>}
                                </div>
                                <div className="mother-info-box__meta">
                                    {mother.breed || '-'} · {mother.age_text || ''}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', fontSize: '0.85rem', marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Foto del ternero */}
                        <div className="fg">
                            <label>Foto del ternero</label>
                            <div className="photo-drop" onClick={() => fileInputRef.current?.click()}>
                                <i className="fas fa-camera"></i>
                                <p>Opcional · JPG, PNG · Máx 3MB</p>
                            </div>
                            <input
                                type="file"
                                name="photo"
                                id="calfPhotoInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                            />
                            {previewUrl && <img id="calfPreview" src={previewUrl} alt="Calf Preview" style={{ display: 'block' }} />}
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label>Nombre / Apodo</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ej: Café"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="fg">
                                <label>Número de arete</label>
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
                                <label>Sexo <span>*</span></label>
                                <select
                                    name="gender"
                                    required
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="female">♀ Hembra</option>
                                    <option value="male">♂ Macho</option>
                                </select>
                            </div>
                            <div className="fg">
                                <label>Fecha de nacimiento <span>*</span></label>
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
                            <label>Notas / Observaciones</label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Peso al nacer, condición, tratamientos..."
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="birth-submit" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Registrando...</>
                            ) : (
                                <><i className="fas fa-baby"></i> Registrar Nacimiento</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
