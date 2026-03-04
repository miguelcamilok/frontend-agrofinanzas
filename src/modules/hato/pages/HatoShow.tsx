import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoShow.css'

/* ── helpers ── */
const getPurposeLabel = (p?: string) => ({ milk:'Producción de Leche', meat:'Producción de Carne', dual:'Doble Propósito' }[p!] ?? p ?? '—')
const getPurposeClass = (p?: string) => ({ milk:'use-milk', meat:'use-meat' }[p!] ?? 'use-dual')
const getPurposeIcon  = (p?: string) => ({ milk:'fa-droplet', meat:'fa-drumstick-bite' }[p!] ?? 'fa-scale-balanced')
const getGenderLabel  = (g: string)  => (g==='female'||g==='hembra') ? 'Hembra' : (g==='male'||g==='macho') ? 'Macho' : g || '—'
const getOriginLabel  = (o?: string) => ({ born_here:'Nacido en la finca', purchased:'Comprado' }[o!] ?? o ?? '—')

const PURPOSES = [
    { value: 'milk', label: 'Producción de Leche' },
    { value: 'meat', label: 'Producción de Carne' },
    { value: 'dual', label: 'Doble Propósito' },
]
const STATUSES = [
    { value: 'active', label: 'Activo' },
    { value: 'sold',   label: 'Vendido' },
    { value: 'dead',   label: 'Fallecido' },
]

/* ══ MODAL DE EDICIÓN ══ */
interface EditModalProps {
    animal:   Animal
    onClose:  () => void
    onSaved:  (updated: Animal) => void
}

function EditModal({ animal, onClose, onSaved }: EditModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error,      setError]      = useState('')
    const [previewUrl, setPreviewUrl] = useState(animal.photo_url ?? animal.photo ?? '')

    const purpose = animal.purpose ?? animal.use_milk_meat ?? ''
    const weight  = String(animal.weight ?? animal.average_weight ?? '')

    const [form, setForm] = useState({
        name:       animal.name        ?? '',
        tag_number: animal.tag_number  ?? '',
        breed:      animal.breed       ?? '',
        gender:     animal.gender      ?? '',
        purpose,
        weight,
        birth_date: animal.birth_date  ?? '',
        origin:     animal.origin      ?? '',
        status:     animal.status      ?? 'active',
        notes:      animal.notes       ?? '',
        photo:      null as File | null,
    })

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handler)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 3 * 1024 * 1024) { alert('Máx. 3 MB'); return }
        setForm(prev => ({ ...prev, photo: file }))
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const res = await hatoService.updateAnimal(animal.id, {
                name:       form.name,
                tag_number: form.tag_number,
                breed:      form.breed,
                gender:     form.gender,
                purpose:    form.purpose,
                weight:     Number(form.weight) || 0,
                birth_date: form.birth_date,
                origin:     form.origin,
                status:     form.status,
                notes:      form.notes,
                photo:      form.photo,
            })
            if (res.animal) onSaved(res.animal)
            onClose()
        } catch {
            setError('Error al guardar los cambios.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-sheet">
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-inner">
                        <div className="modal-header-icon">
                            <i className="fas fa-pen-to-square"></i>
                        </div>
                        <div>
                            <h2 className="modal-title">Editar Animal</h2>
                            <p className="modal-subtitle">{animal.name || 'Sin nombre'}</p>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} title="Cerrar">
                        <i className="fas fa-xmark"></i>
                    </button>
                </div>

                {/* Scroll body */}
                <div className="modal-body">
                    {error && (
                        <div className="modal-error">
                            <i className="fas fa-triangle-exclamation"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="edit-form">

                        {/* ── FOTO ── */}
                        <p className="modal-section-title"><i className="fas fa-camera"></i> Fotografía</p>
                        <div className="fg">
                            <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                {previewUrl ? (
                                    <div className="photo-preview-wrap">
                                        <img src={previewUrl} alt="Preview" className="photo-preview-img" />
                                        <div className="photo-preview-overlay">
                                            <i className="fas fa-camera"></i> Cambiar foto
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="upload-icon-wrap">
                                            <i className="fas fa-cloud-arrow-up"></i>
                                        </div>
                                        <div className="upload-title">Subir fotografía</div>
                                        <div className="upload-hint">JPG, PNG · Máx. 3 MB</div>
                                    </>
                                )}
                            </div>
                            <input type="file" accept="image/*" style={{ display:'none' }}
                                ref={fileInputRef} onChange={handlePhoto} />
                        </div>

                        {/* ── IDENTIFICACIÓN ── */}
                        <p className="modal-section-title"><i className="fas fa-id-card"></i> Identificación</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-font"></i> Nombre</label>
                                <input type="text" name="name" placeholder="Ej: Canela"
                                    value={form.name} onChange={handleChange} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-tag"></i> Arete</label>
                                <input type="text" name="tag_number" placeholder="Ej: A-042"
                                    value={form.tag_number} onChange={handleChange} />
                            </div>
                        </div>

                        {/* ── DATOS ── */}
                        <p className="modal-section-title"><i className="fas fa-clipboard-list"></i> Datos Principales</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-dna"></i> Raza <span>*</span></label>
                                <input type="text" name="breed" required
                                    value={form.breed} onChange={handleChange} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-venus-mars"></i> Sexo <span>*</span></label>
                                <select name="gender" required value={form.gender} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="female">Hembra</option>
                                    <option value="male">Macho</option>
                                </select>
                            </div>
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-scale-balanced"></i> Propósito <span>*</span></label>
                                <select name="purpose" required value={form.purpose} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    {PURPOSES.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-weight-scale"></i> Peso (kg)</label>
                                <input type="number" name="weight" placeholder="Ej: 450"
                                    value={form.weight} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-calendar-day"></i> Fecha nacimiento</label>
                                <input type="date" name="birth_date"
                                    value={form.birth_date} onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-location-dot"></i> Origen</label>
                                <select name="origin" value={form.origin} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="born_here">Nacido en la finca</option>
                                    <option value="purchased">Comprado</option>
                                </select>
                            </div>
                        </div>

                        {/* ── ESTADO ── */}
                        <p className="modal-section-title"><i className="fas fa-circle-dot"></i> Estado</p>
                        <div className="status-selector">
                            {STATUSES.map(s => (
                                <label
                                    key={s.value}
                                    className={`status-option status-option--${s.value}${form.status === s.value ? ' is-active' : ''}`}
                                >
                                    <input type="radio" name="status" value={s.value}
                                        checked={form.status === s.value}
                                        onChange={handleChange}
                                        style={{ display:'none' }} />
                                    <i className="fas fa-circle"></i> {s.label}
                                </label>
                            ))}
                        </div>

                        {/* ── NOTAS ── */}
                        <p className="modal-section-title"><i className="fas fa-clipboard"></i> Observaciones</p>
                        <div className="fg">
                            <textarea name="notes" rows={3}
                                placeholder="Vacunas, enfermedades, tratamientos..."
                                value={form.notes} onChange={handleChange} />
                        </div>
                    </form>
                </div>

                {/* Footer sticky */}
                <div className="modal-footer">
                    <button type="button" className="modal-btn-cancel" onClick={onClose}>
                        <i className="fas fa-xmark"></i> Cancelar
                    </button>
                    <button type="submit" form="edit-form" className="modal-btn-save" disabled={submitting}>
                        {submitting
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Guardando...</>
                            : <><i className="fas fa-floppy-disk"></i> Guardar cambios</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ══ PÁGINA SHOW ══ */
export default function HatoShow() {
    const { id } = useParams<{ id: string }>()
    const [animal,    setAnimal]    = useState<Animal | null>(null)
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        hatoService.getAnimal(Number(id))
            .then(d => setAnimal(d.animal))
            .catch(() => setError('No se pudo cargar la información del animal.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="cattle-show-page">
            <div style={{ padding:'80px 0', textAlign:'center', color:'rgba(221,232,200,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize:'1.4rem', color:'#8ac926' }}></i>
                Cargando ficha técnica...
            </div>
        </div>
    )

    if (error || !animal) return (
        <div className="cattle-show-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver a Producción Animal
            </Link>
            <div style={{ padding:'60px 0', textAlign:'center', color:'#ef4444' }}>
                <i className="fas fa-triangle-exclamation" style={{ fontSize:'2rem', marginBottom:12, display:'block' }}></i>
                {error || 'Animal no encontrado'}
            </div>
        </div>
    )

    const purpose = animal.purpose ?? animal.use_milk_meat
    const weight  = animal.weight  ?? animal.average_weight

    return (
        <>
        <div className="cattle-show-page">
            <div className="show-top-bar">
                <Link to="/client/hato/hato" className="back-link">
                    <i className="fas fa-arrow-left"></i> Volver a Producción Animal
                </Link>
                <button className="btn-edit-animal" onClick={() => setShowModal(true)}>
                    <i className="fas fa-pen-to-square"></i> Editar
                </button>
            </div>

            {/* Hero */}
            <div className="show-hero">
                {animal.photo_url || animal.photo ? (
                    <img src={animal.photo_url ?? animal.photo} className="show-hero__img" alt={animal.name} />
                ) : (
                    <div className="show-hero__placeholder">
                        <i className="fas fa-cow"></i>
                    </div>
                )}
                <div className="show-hero__body">
                    <div className="show-hero__breed">{animal.breed || 'Raza no especificada'}</div>
                    <h1 className="show-hero__title">{animal.name || 'Sin nombre'}</h1>
                    <p className="show-hero__use">{getPurposeLabel(purpose)}</p>
                    <div className="hero-pills">
                        {weight && <span className="hero-pill"><i className="fas fa-weight-scale"></i> {weight} kg</span>}
                        {purpose && <span className="hero-pill"><i className={`fas ${getPurposeIcon(purpose)}`}></i> {getPurposeLabel(purpose)}</span>}
                        {animal.tag_number && <span className="hero-pill"><i className="fas fa-tag"></i> Arete #{animal.tag_number}</span>}
                        {animal.age_text   && <span className="hero-pill"><i className="fas fa-hourglass-half"></i> {animal.age_text}</span>}
                    </div>
                </div>
            </div>

            {/* Datos técnicos */}
            <div className="info-section">
                <div className="info-section__title"><i className="fas fa-clipboard-list"></i> Datos Técnicos</div>
                <div className="info-grid">
                    <div>
                        <div className="info-item__label"><i className="fas fa-dna"></i> Raza</div>
                        <div className="info-item__val">{animal.breed || '—'}</div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-weight-scale"></i> Peso promedio</div>
                        <div className="info-item__val">{weight ? `${weight} kg` : '—'}</div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-scale-balanced"></i> Propósito</div>
                        <div className="info-item__val">
                            <span className={`use-badge ${getPurposeClass(purpose)}`}>
                                <i className={`fas ${getPurposeIcon(purpose)}`}></i>
                                {getPurposeLabel(purpose)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-venus-mars"></i> Sexo</div>
                        <div className="info-item__val">{getGenderLabel(animal.gender)}</div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-calendar-day"></i> Fecha de nacimiento</div>
                        <div className="info-item__val">{animal.birth_date || '—'}</div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-hourglass-half"></i> Edad</div>
                        <div className="info-item__val">{animal.age_text || '—'}</div>
                    </div>
                    <div>
                        <div className="info-item__label"><i className="fas fa-location-dot"></i> Origen</div>
                        <div className="info-item__val">{getOriginLabel(animal.origin)}</div>
                    </div>
                </div>
            </div>

            {/* Notas */}
            {animal.notes && (
                <div className="info-section">
                    <div className="info-section__title"><i className="fas fa-clipboard"></i> Notas y Observaciones</div>
                    <p style={{ color:'rgba(221,232,200,.75)', fontSize:'.9rem', lineHeight:'1.7', margin:0 }}>
                        {animal.notes}
                    </p>
                </div>
            )}

            {/* Madre */}
            {animal.mother && (
                <div className="info-section">
                    <div className="info-section__title"><i className="fas fa-sitemap"></i> Genealogía — Madre</div>
                    <div className="info-grid">
                        <div>
                            <div className="info-item__label"><i className="fas fa-font"></i> Nombre</div>
                            <div className="info-item__val">
                                <Link to={`/client/hato/${animal.mother.id}`} style={{ color:'#8ac926', textDecoration:'none' }}>
                                    {animal.mother.name || 'Sin nombre'}
                                </Link>
                            </div>
                        </div>
                        <div>
                            <div className="info-item__label"><i className="fas fa-tag"></i> Arete</div>
                            <div className="info-item__val">{animal.mother.tag_number || '—'}</div>
                        </div>
                        <div>
                            <div className="info-item__label"><i className="fas fa-dna"></i> Raza</div>
                            <div className="info-item__val">{animal.mother.breed || '—'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Crías */}
            {animal.calves && animal.calves.length > 0 && (
                <div className="info-section">
                    <div className="info-section__title"><i className="fas fa-paw"></i> Descendencia ({animal.calves.length})</div>
                    <div className="info-grid">
                        {animal.calves.map(calf => (
                            <div key={calf.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(245,158,11,.1)', borderRadius:'10px' }}>
                                <div className="info-item__label">
                                    <i className={`fas fa-${calf.gender==='female'||calf.gender==='hembra'?'venus':'mars'}`}></i>
                                    {getGenderLabel(calf.gender)}
                                </div>
                                <div className="info-item__val">
                                    <Link to={`/client/hato/${calf.id}`} style={{ color:'#f59e0b', textDecoration:'none' }}>
                                        {calf.name || 'Sin nombre'}
                                    </Link>
                                </div>
                                {calf.birth_date && (
                                    <div style={{ fontSize:'.7rem', color:'#4a5a3a', marginTop:5, display:'flex', alignItems:'center', gap:5 }}>
                                        <i className="fas fa-calendar-day" style={{ fontSize:'.6rem' }}></i>
                                        {calf.birth_date}
                                        {calf.age_text && <span style={{ opacity:.5 }}>· {calf.age_text}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Modal de edición */}
        {showModal && (
            <EditModal
                animal={animal}
                onClose={() => setShowModal(false)}
                onSaved={(updated) => setAnimal(updated)}
            />
        )}
        </>
    )
}