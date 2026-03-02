import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoCreate.css'

export default function HatoCreate() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [mothers, setMothers] = useState<Animal[]>([])
    const [previewUrl, setPreviewUrl] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        tag_number: '',
        breed: '',
        gender: '',
        purpose: '',
        weight: '',
        birth_date: '',
        origin: '',
        mother_id: '',
        notes: '',
        photo: null as File | null
    })

    useEffect(() => {
        const fetchMothers = async () => {
            try {
                const data = await hatoService.getMothers()
                setMothers(data.mothers)
            } catch (err) {
                console.error('Error fetching mothers:', err)
            }
        }
        fetchMothers()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert('La imagen no puede superar 3MB.')
                return
            }
            setFormData(prev => ({ ...prev, photo: file }))
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            await hatoService.createAnimal({
                name: formData.name,
                tag_number: formData.tag_number,
                breed: formData.breed,
                gender: formData.gender,
                purpose: formData.purpose,
                weight: Number(formData.weight) || 0,
                birth_date: formData.birth_date,
                origin: formData.origin,
                mother_id: formData.mother_id ? Number(formData.mother_id) : null,
                notes: formData.notes,
                photo: formData.photo
            })
            navigate('/client/hato/hato')
        } catch (err) {
            setError('Error al registrar el animal. Por favor, revisa todos los campos.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="cattle-form-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver al hato
            </Link>

            <div className="cattle-form-card">
                <div className="cattle-form-header">
                    <i className="fas fa-cow"></i> Registrar Nuevo Animal
                </div>
                <div className="cattle-form-body">
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', fontSize: '0.85rem', marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* FOTO */}
                        <p className="form-section-title"><i className="fas fa-camera"></i> Foto del animal</p>
                        <div className="fg">
                            <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <i className="fas fa-cloud-upload-alt"></i>
                                <p>Haz clic para subir una foto · JPG, PNG · Máx 3MB</p>
                            </div>
                            <input
                                type="file"
                                name="photo"
                                id="photoInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                            />
                            {previewUrl && <img id="photoPreviewImg" src={previewUrl} alt="Preview" style={{ display: 'block' }} />}
                        </div>

                        {/* IDENTIFICACIÓN */}
                        <p className="form-section-title"><i className="fas fa-id-card"></i> Identificación</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label>Nombre / Apodo</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Ej: Canela"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="fg">
                                <label>Número de arete</label>
                                <input
                                    type="text"
                                    name="tag_number"
                                    placeholder="Ej: A-042"
                                    value={formData.tag_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* DATOS PRINCIPALES */}
                        <p className="form-section-title"><i className="fas fa-info-circle"></i> Datos principales</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label>Raza <span>*</span></label>
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
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label>Propósito <span>*</span></label>
                                <select
                                    name="purpose"
                                    required
                                    value={formData.purpose}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="milk">🥛 Leche</option>
                                    <option value="meat">🥩 Carne</option>
                                    <option value="dual">⚖️ Doble propósito</option>
                                </select>
                            </div>
                            <div className="fg">
                                <label>Peso promedio (kg)</label>
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
                                <label>Fecha de nacimiento</label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="fg">
                                <label>Origen</label>
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

                        {/* MADRE */}
                        {mothers.length > 0 && (
                            <div className="fg">
                                <label>Madre (si aplica)</label>
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
                                            · {m.breed}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* NOTAS */}
                        <div className="fg">
                            <label>Notas / Observaciones</label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder="Vacunas, enfermedades, tratamientos..."
                                value={formData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? (
                                <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                            ) : (
                                <><i className="fas fa-save"></i> Registrar Animal</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
