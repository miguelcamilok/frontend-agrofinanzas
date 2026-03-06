import React, { useState, useEffect, useRef } from 'react'
import { hatoService } from '../services/hatoService'
import type { Animal, HatoSummary } from '../services/hatoService'
import './HatoIndex.css'

/* ── helpers ── */
const getPurposeLabel = (p?: string) =>
    ({ milk: 'Lechera', meat: 'Carne', dual: 'Doble propósito' }[p!] ?? p ?? '—')
const getPurposeIcon = (p?: string) =>
    ({ milk: 'fa-droplet', meat: 'fa-drumstick-bite', dual: 'fa-scale-balanced' }[p!] ?? 'fa-circle-question')
const getPurposeClass = (p?: string) =>
    ({ milk: 'use-milk', meat: 'use-meat' }[p!] ?? 'use-dual')
const getStatusLabel = (s: string) =>
    ({ sold: 'Vendido', dead: 'Fallecido' }[s] ?? 'Activo')
const getGenderLabel = (g: string) =>
    (g === 'female' || g === 'hembra') ? 'Hembra' : (g === 'male' || g === 'macho') ? 'Macho' : g
const isFemale = (g: string) => g === 'female' || g === 'hembra'
const isCalf   = (a: Animal) => !!a.mother_id

const calfCardClass = (a: Animal): string => {
    if (!isCalf(a)) return ''
    return isFemale(a.gender) ? ' cattle-card--calf-female' : ' cattle-card--calf-male'
}

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



interface ShowModalProps {
    animal: Animal
    onClose: () => void
    onEdit:  () => void
    onDelete: () => void
    onBirth:  () => void
}

function ShowModal({ animal, onClose, onEdit, onDelete, onBirth }: ShowModalProps) {
    const purpose = animal.purpose ?? animal.use_milk_meat
    const weight  = animal.weight  ?? animal.average_weight
    const calf    = isCalf(animal)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => { document.removeEventListener('keydown', handler) }
    }, [onClose])

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-sheet modal-sheet--wide">
                {/* Header */}
                <div className="modal-header modal-header--crema">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="modal-header-icon">
                            <i className={`fas fa-${calf ? 'paw' : 'cow'}`}></i>
                        </div>
                        <div>
                            <div className="modal-title">{animal.name || 'Sin nombre'}</div>
                            <div className="modal-subtitle">{animal.breed || 'Raza no especificada'}</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><i className="fas fa-xmark"></i></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Hero imagen + datos rápidos */}
                    <div className="show-hero-modal">
                        {animal.photo_url || animal.photo
                            ? <img src={animal.photo_url ?? animal.photo} className="show-hero-modal__img" alt={animal.name} />
                            : <div className="show-hero-modal__placeholder"><i className={`fas fa-${calf ? 'paw' : 'cow'}`}></i></div>
                        }
                        <div className="show-hero-modal__body">
                            <div className="show-hero-modal__breed">{animal.breed || 'Raza no especificada'}</div>
                            <div className="show-hero-modal__name">{animal.name || 'Sin nombre'}</div>
                            <div className="show-hero-modal__use">{getPurposeLabel(purpose)}</div>
                            <div className="hero-pills-wrap">
                                {animal.tag_number && (
                                    <span className="hero-pill-tag"><i className="fas fa-tag"></i> #{animal.tag_number}</span>
                                )}
                                {animal.age_text && (
                                    <span className="hero-pill-tag"><i className="fas fa-hourglass-half"></i> {animal.age_text}</span>
                                )}
                                {weight && (
                                    <span className="hero-pill-tag"><i className="fas fa-weight-scale"></i> {weight} kg</span>
                                )}
                                <span className={`status-badge status-${animal.status || 'active'}`}>
                                    <i className="fas fa-circle status-dot"></i> {getStatusLabel(animal.status)}
                                </span>
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
                                <div className="info-item__label"><i className="fas fa-venus-mars"></i> Sexo</div>
                                <div className="info-item__val">{getGenderLabel(animal.gender)}</div>
                            </div>
                            <div>
                                <div className="info-item__label"><i className="fas fa-scale-balanced"></i> Propósito</div>
                                <div className="info-item__val">
                                    {purpose ? (
                                        <span className={`use-badge ${getPurposeClass(purpose)}`}>
                                            <i className={`fas ${getPurposeIcon(purpose)}`}></i>
                                            {getPurposeLabel(purpose)}
                                        </span>
                                    ) : '—'}
                                </div>
                            </div>
                            <div>
                                <div className="info-item__label"><i className="fas fa-weight-scale"></i> Peso prom.</div>
                                <div className="info-item__val">{weight ? `${weight} kg` : '—'}</div>
                            </div>
                            <div>
                                <div className="info-item__label"><i className="fas fa-calendar-day"></i> Nacimiento</div>
                                <div className="info-item__val">{animal.birth_date || '—'}</div>
                            </div>
                            <div>
                                <div className="info-item__label"><i className="fas fa-location-dot"></i> Origen</div>
                                <div className="info-item__val">
                                    {animal.origin === 'born_here' ? 'Nacido en la finca' : animal.origin === 'purchased' ? 'Comprado' : animal.origin || '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Madre */}
                    {animal.mother && (
                        <div className="info-section">
                            <div className="info-section__title"><i className="fas fa-sitemap"></i> Madre</div>
                            <div className="info-grid">
                                <div>
                                    <div className="info-item__label"><i className="fas fa-font"></i> Nombre</div>
                                    <div className="info-item__val" style={{ color: 'var(--pasto)', fontWeight: 700 }}>{animal.mother.name || 'Sin nombre'}</div>
                                </div>
                                {animal.mother.tag_number && (
                                    <div>
                                        <div className="info-item__label"><i className="fas fa-tag"></i> Arete</div>
                                        <div className="info-item__val">{animal.mother.tag_number}</div>
                                    </div>
                                )}
                                {animal.mother.breed && (
                                    <div>
                                        <div className="info-item__label"><i className="fas fa-dna"></i> Raza</div>
                                        <div className="info-item__val">{animal.mother.breed}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Crías */}
                    {animal.calves && animal.calves.length > 0 && (
                        <div className="info-section">
                            <div className="info-section__title"><i className="fas fa-paw"></i> Descendencia ({animal.calves.length})</div>
                            <div className="info-grid">
                                {(animal.calves ?? []).map((c: { id: number; name?: string; gender: string; birth_date?: string; age_text?: string }) => (
                                    <div className="calf-show-chip" key={c.id}>
                                        <div className="info-item__label">
                                            <i className={`fas fa-${isFemale(c.gender) ? 'venus' : 'mars'}`}></i>
                                            {getGenderLabel(c.gender)}
                                        </div>
                                        <div className="info-item__val">{c.name || 'Sin nombre'}</div>
                                        {c.birth_date && <div style={{ fontSize: '.68rem', color: 'var(--barro)', opacity: .65 }}>{c.birth_date}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notas */}
                    {animal.notes && (
                        <div className="info-section">
                            <div className="info-section__title"><i className="fas fa-clipboard"></i> Notas</div>
                            <p className="show-notes">{animal.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer con acciones */}
                <div className="modal-footer">
                    {!calf && isFemale(animal.gender) && (animal.status || 'active') === 'active' && (
                        <button className="modal-btn-cancel" style={{ borderColor: 'var(--borde-dark)', color: 'var(--tierra)' }} onClick={onBirth}>
                            <i className="fas fa-stethoscope"></i> Registrar parto
                        </button>
                    )}
                    <button className="modal-btn-cancel" onClick={onEdit}>
                        <i className="fas fa-pen"></i> Editar
                    </button>
                    <button className="modal-btn-cancel" style={{ borderColor: 'rgba(192,57,43,.3)', color: 'var(--rojo)' }} onClick={onDelete}>
                        <i className="fas fa-trash"></i> Eliminar
                    </button>
                    <button className="modal-btn-save modal-btn-save--pasto" style={{ flex: 'unset', padding: '10px 20px' }} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   MODAL — CREAR / EDITAR ANIMAL
══════════════════════════════════════════════════════════════ */
interface AnimalFormModalProps {
    animal?: Animal | null
    mothers: Animal[]
    onClose: () => void
    onSaved: () => void
}

function AnimalFormModal({ animal, mothers, onClose, onSaved }: AnimalFormModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')
    const [previewUrl, setPreviewUrl] = useState(animal?.photo_url ?? animal?.photo ?? '')

    const isEdit = !!animal
    const purpose = animal?.purpose ?? animal?.use_milk_meat ?? ''
    const weight  = String(animal?.weight ?? animal?.average_weight ?? '')

    const [form, setForm] = useState({
        name:       animal?.name        ?? '',
        tag_number: animal?.tag_number  ?? '',
        breed:      animal?.breed       ?? '',
        gender:     animal?.gender      ?? '',
        purpose:    purpose,
        weight,
        birth_date: animal?.birth_date  ?? '',
        origin:     animal?.origin      ?? '',
        status:     animal?.status      ?? 'active',
        mother_id:  String(animal?.mother_id ?? ''),
        notes:      animal?.notes       ?? '',
        photo:      null as File | null,
    })

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => { document.removeEventListener('keydown', handler) }
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
        e.preventDefault(); setSubmitting(true); setError('')
        try {
            const payload = {
                name:       form.name,
                tag_number: form.tag_number,
                breed:      form.breed,
                gender:     form.gender,
                purpose:    form.purpose,
                weight:     Number(form.weight) || 0,
                birth_date: form.birth_date,
                origin:     form.origin,
                status:     form.status,
                mother_id:  form.mother_id ? Number(form.mother_id) : null,
                notes:      form.notes,
                photo:      form.photo,
            }
            if (isEdit && animal) {
                await hatoService.updateAnimal(animal.id, payload)
            } else {
                await hatoService.createAnimal(payload)
            }
            onSaved()
            onClose()
        } catch {
            setError('Error al guardar. Revisa los campos obligatorios.')
        } finally { setSubmitting(false) }
    }

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-sheet modal-sheet--wide">
                <div className="modal-header modal-header--tierra">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="modal-header-icon">
                            <i className={`fas ${isEdit ? 'fa-pen-to-square' : 'fa-cow'}`}></i>
                        </div>
                        <div>
                            <div className="modal-title">{isEdit ? 'Editar Animal' : 'Registrar Animal'}</div>
                            <div className="modal-subtitle">
                                {isEdit ? (animal?.name || 'Sin nombre') : 'Complete los datos del nuevo animal'}
                            </div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><i className="fas fa-xmark"></i></button>
                </div>

                <div className="modal-body">
                    {error && <div className="modal-error"><i className="fas fa-triangle-exclamation"></i> {error}</div>}

                    <form onSubmit={handleSubmit} id="animal-form">
                        {/* Foto */}
                        <p className="modal-section-title"><i className="fas fa-camera"></i> Fotografía</p>
                        <div className="fg">
                            <div className="photo-drop-zone" onClick={() => fileInputRef.current?.click()}>
                                {previewUrl ? (
                                    <div className="photo-preview">
                                        <img src={previewUrl} alt="Preview" />
                                        <div className="photo-preview-overlay"><i className="fas fa-camera"></i> Cambiar foto</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="drop-icon-wrap"><i className="fas fa-cloud-arrow-up"></i></div>
                                        <div className="drop-title">Subir fotografía del animal</div>
                                        <div className="drop-hint">JPG, PNG · Máx. 3 MB · Opcional</div>
                                    </>
                                )}
                            </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handlePhoto} />
                        </div>

                        {/* Identificación */}
                        <p className="modal-section-title"><i className="fas fa-id-card"></i> Identificación</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-font"></i> Nombre / Apodo</label>
                                <input type="text" name="name" placeholder="Ej: Canela" value={form.name} onChange={handleChange} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-tag"></i> Número de arete</label>
                                <input type="text" name="tag_number" placeholder="Ej: A-042" value={form.tag_number} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Datos principales */}
                        <p className="modal-section-title"><i className="fas fa-clipboard-list"></i> Datos Principales</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-dna"></i> Raza <span className="req">*</span></label>
                                <input type="text" name="breed" placeholder="Ej: Holstein" required value={form.breed} onChange={handleChange} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-venus-mars"></i> Sexo <span className="req">*</span></label>
                                <select name="gender" required value={form.gender} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="female">Hembra</option>
                                    <option value="male">Macho</option>
                                </select>
                            </div>
                        </div>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-scale-balanced"></i> Propósito <span className="req">*</span></label>
                                <select name="purpose" required value={form.purpose} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-weight-scale"></i> Peso promedio (kg)</label>
                                <input type="number" name="weight" placeholder="Ej: 450" value={form.weight} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-calendar-day"></i> Fecha de nacimiento</label>
                                <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
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

                        {/* Estado (solo en edición) */}
                        {isEdit && (
                            <>
                                <p className="modal-section-title"><i className="fas fa-circle-dot"></i> Estado</p>
                                <div className="status-selector">
                                    {STATUSES.map(s => (
                                        <label key={s.value} className={`status-opt status-opt--${s.value}${form.status === s.value ? ' is-sel' : ''}`}>
                                            <input type="radio" name="status" value={s.value} checked={form.status === s.value} onChange={handleChange} style={{ display: 'none' }} />
                                            <i className="fas fa-circle"></i> {s.label}
                                        </label>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Genealogía */}
                        {mothers.length > 0 && (
                            <>
                                <p className="modal-section-title"><i className="fas fa-sitemap"></i> Genealogía</p>
                                <div className="fg">
                                    <label><i className="fas fa-venus"></i> Madre (si aplica)</label>
                                    <select name="mother_id" value={form.mother_id} onChange={handleChange}>
                                        <option value="">Sin madre registrada</option>
                                        {mothers.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name || 'Sin nombre'}{m.tag_number ? ` · Arete ${m.tag_number}` : ''}{m.breed ? ` · ${m.breed}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Notas */}
                        <p className="modal-section-title"><i className="fas fa-clipboard"></i> Observaciones</p>
                        <div className="fg">
                            <textarea name="notes" rows={3} placeholder="Vacunas, enfermedades, tratamientos..." value={form.notes} onChange={handleChange} />
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="modal-btn-cancel" onClick={onClose}><i className="fas fa-xmark"></i> Cancelar</button>
                    <button type="submit" form="animal-form" className="modal-btn-save" disabled={submitting}>
                        {submitting
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Guardando...</>
                            : <><i className="fas fa-floppy-disk"></i> {isEdit ? 'Guardar cambios' : 'Registrar Animal'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   MODAL — REGISTRAR PARTO
══════════════════════════════════════════════════════════════ */
interface BirthModalProps {
    mother: Animal
    onClose: () => void
    onSaved: () => void
}

function BirthModal({ mother, onClose, onSaved }: BirthModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')
    const [previewUrl, setPreviewUrl] = useState('')

    const [form, setForm] = useState({
        name:       '',
        tag_number: '',
        gender:     '',
        birth_date: new Date().toISOString().split('T')[0],
        notes:      '',
        photo:      null as File | null,
    })

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => { document.removeEventListener('keydown', handler) }
    }, [onClose])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { setForm(prev => ({ ...prev, photo: file })); setPreviewUrl(URL.createObjectURL(file)) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true); setError('')
        try {
            await hatoService.registerBirth({
                mother_id:  mother.id,
                name:       form.name,
                tag_number: form.tag_number,
                gender:     form.gender,
                birth_date: form.birth_date,
                notes:      form.notes,
                photo:      form.photo,
            })
            onSaved(); onClose()
        } catch {
            setError('Error al registrar el nacimiento.')
        } finally { setSubmitting(false) }
    }

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div className="modal-sheet">
                <div className="modal-header modal-header--pasto">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="modal-header-icon"><i className="fas fa-stethoscope"></i></div>
                        <div>
                            <div className="modal-title">Registrar Parto</div>
                            <div className="modal-subtitle">El ternero quedará vinculado a su madre</div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}><i className="fas fa-xmark"></i></button>
                </div>

                <div className="modal-body">
                    {/* Info madre */}
                    <div className="mother-info-box">
                        {mother.photo_url || mother.photo
                            ? <img src={mother.photo_url ?? mother.photo} alt="Madre" />
                            : <div className="mother-placeholder"><i className="fas fa-cow"></i></div>
                        }
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
                                <i className="fas fa-dna"></i> {mother.breed || '—'}
                                {mother.age_text && <><span style={{ opacity: .3 }}>·</span><i className="fas fa-hourglass-half"></i> {mother.age_text}</>}
                            </div>
                        </div>
                    </div>

                    {error && <div className="modal-error"><i className="fas fa-triangle-exclamation"></i> {error}</div>}

                    <form onSubmit={handleSubmit} id="birth-form">
                        <p className="modal-section-title"><i className="fas fa-camera"></i> Foto del ternero</p>
                        <div className="fg">
                            <div className="photo-drop-zone" onClick={() => fileInputRef.current?.click()}>
                                {previewUrl ? (
                                    <div className="photo-preview">
                                        <img src={previewUrl} alt="Preview" />
                                        <div className="photo-preview-overlay"><i className="fas fa-camera"></i> Cambiar</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="drop-icon-wrap"><i className="fas fa-cloud-arrow-up"></i></div>
                                        <div className="drop-title">Foto del ternero (opcional)</div>
                                        <div className="drop-hint">JPG, PNG · Máx. 3 MB</div>
                                    </>
                                )}
                            </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handlePhoto} />
                        </div>

                        <p className="modal-section-title"><i className="fas fa-id-card"></i> Datos del ternero</p>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-font"></i> Nombre / Apodo</label>
                                <input type="text" name="name" placeholder="Ej: Café" value={form.name} onChange={handleChange} />
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-tag"></i> Número de arete</label>
                                <input type="text" name="tag_number" placeholder="Ej: T-001" value={form.tag_number} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="fg-row">
                            <div className="fg">
                                <label><i className="fas fa-venus-mars"></i> Sexo <span className="req">*</span></label>
                                <select name="gender" required value={form.gender} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="female">Hembra</option>
                                    <option value="male">Macho</option>
                                </select>
                            </div>
                            <div className="fg">
                                <label><i className="fas fa-calendar-day"></i> Fecha de nacimiento <span className="req">*</span></label>
                                <input type="date" name="birth_date" required value={form.birth_date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                        <div className="fg">
                            <label><i className="fas fa-clipboard"></i> Notas / Observaciones</label>
                            <textarea name="notes" rows={3} placeholder="Peso al nacer, condición, tratamientos iniciales..." value={form.notes} onChange={handleChange} />
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button type="button" className="modal-btn-cancel" onClick={onClose}><i className="fas fa-xmark"></i> Cancelar</button>
                    <button type="submit" form="birth-form" className="modal-btn-save modal-btn-save--pasto" disabled={submitting}>
                        {submitting
                            ? <><i className="fas fa-circle-notch fa-spin"></i> Registrando...</>
                            : <><i className="fas fa-stethoscope"></i> Confirmar Parto</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   ANIMAL CARD
══════════════════════════════════════════════════════════════ */
interface CardProps {
    animal: Animal
    index: number
    onView: (a: Animal) => void
    onDelete: (id: number) => void
    onBirth: (a: Animal) => void
}

function AnimalCard({ animal, index, onView, onDelete, onBirth }: CardProps) {
    const purpose = animal.purpose ?? animal.use_milk_meat
    const weight  = animal.weight  ?? animal.average_weight
    const calf    = isCalf(animal)

    return (
        <div
            className={`cattle-card${calfCardClass(animal)}`}
            style={{ animationDelay: `${index * 0.055}s` }}
        >
            {/* Foto */}
            {animal.photo_url || animal.photo
                ? <img src={animal.photo_url ?? animal.photo} className="cattle-photo" alt={animal.name} />
                : <div className="cattle-photo-placeholder"><i className={`fas fa-${calf ? 'paw' : 'cow'}`}></i></div>
            }

            {calf && (
                <div className="calf-ribbon">
                    <i className={`fas fa-${isFemale(animal.gender) ? 'venus' : 'mars'}`}></i>
                    Ternero
                </div>
            )}

            <div className="cattle-card__body">
                <div className="cattle-card__head">
                    <div>
                        <div className="cattle-card__name">{animal.name || 'Sin nombre'}</div>
                        {animal.tag_number && (
                            <div className="cattle-card__tag"><i className="fas fa-tag"></i> Arete #{animal.tag_number}</div>
                        )}
                        {calf && animal.mother && (
                            <div className="cattle-card__mother">
                                <i className="fas fa-venus"></i> Madre: <span className="mother-link">{animal.mother.name || 'Sin nombre'}</span>
                            </div>
                        )}
                    </div>
                    <span className={`status-badge status-${animal.status || 'active'}`}>
                        <i className="fas fa-circle status-dot"></i>
                        {getStatusLabel(animal.status)}
                    </span>
                </div>

                <div className="cattle-info">
                    <div className="cattle-info-item">
                        <span className="cattle-info-item__label"><i className="fas fa-dna"></i> Raza</span>
                        <span className="cattle-info-item__val">{animal.breed || '—'}</span>
                    </div>
                    <div className="cattle-info-item">
                        <span className="cattle-info-item__label">
                            <i className={`fas ${getPurposeIcon(purpose)}`}></i> Uso
                        </span>
                        <span className="cattle-info-item__val">{getPurposeLabel(purpose)}</span>
                    </div>
                    <div className="cattle-info-item">
                        <span className="cattle-info-item__label"><i className="fas fa-venus-mars"></i> Sexo</span>
                        <span className="cattle-info-item__val">{getGenderLabel(animal.gender)}</span>
                    </div>
                    <div className="cattle-info-item">
                        <span className="cattle-info-item__label"><i className="fas fa-hourglass-half"></i> Edad</span>
                        <span className="cattle-info-item__val">{animal.age_text || '—'}</span>
                    </div>
                    {weight && (
                        <div className="cattle-info-item">
                            <span className="cattle-info-item__label"><i className="fas fa-weight-scale"></i> Peso</span>
                            <span className="cattle-info-item__val">{weight} kg</span>
                        </div>
                    )}
                </div>

                {!calf && animal.calves && animal.calves.length > 0 && (
                    <div className="calves-section">
                        <div className="calves-label">
                            <i className="fas fa-sitemap"></i> Descendencia ({animal.calves.length})
                        </div>
                        {(animal.calves ?? []).map((c: { id: number; name?: string; gender: string; birth_date?: string; age_text?: string }) => (
                            <span className="calf-chip" key={c.id}>
                                <i className={`fas fa-${isFemale(c.gender) ? 'venus' : 'mars'}`}></i>
                                {c.name || 'Sin nombre'}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="cattle-card__foot">
                {!calf && isFemale(animal.gender) && (animal.status || 'active') === 'active' && (
                    <button className="card-btn card-btn--birth" onClick={() => onBirth(animal)}>
                        <i className="fas fa-stethoscope"></i> Parto
                    </button>
                )}
                <button className="card-btn card-btn--detail" onClick={() => onView(animal)}>
                    <i className="fas fa-file-lines"></i> Ficha
                </button>
                <button className="card-btn card-btn--delete" onClick={() => onDelete(animal.id)} title="Eliminar">
                    <i className="fas fa-trash-can"></i>
                </button>
            </div>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function GanadoIndex() {
    const [animals, setAnimals] = useState<Animal[]>([])
    const [summary, setSummary] = useState<HatoSummary | null>(null)
    const [mothers, setMothers] = useState<Animal[]>([])
    const [loading, setLoading] = useState(true)
    const [alert,   setAlert]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

    // Modal state
    const [showAnimal,   setShowAnimal]   = useState<Animal | null>(null)
    const [birthAnimal,  setBirthAnimal]  = useState<Animal | null>(null)
    const [modalCreate,  setModalCreate]  = useState(false)
    const [modalEdit,    setModalEdit]    = useState<Animal | null>(null)

    const heroBgRef = useRef<HTMLDivElement>(null)

    // Parallax hero
    useEffect(() => {
        const el = heroBgRef.current
        if (!el) return
        const onScroll = () => {
            const s = window.scrollY
            el.style.opacity   = String(Math.max(0.15, 1 - s / 320))
            el.style.transform = `translateY(${s * 0.18}px)`
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await hatoService.getAnimals()
            setAnimals(data.animals)
            setSummary(data.summary)
            // Extraemos las madres (hembras activas) para el selector
            setMothers(data.animals.filter(a => isFemale(a.gender) && (a.status || 'active') === 'active'))
        } catch {
            showAlert('error', 'Error al cargar los animales.')
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const showAlert = (type: 'success' | 'error', msg: string) => {
        setAlert({ type, msg })
        setTimeout(() => setAlert(null), 4500)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Confirmas eliminar este animal?')) return
        try {
            await hatoService.deleteAnimal(id)
            showAlert('success', 'Animal eliminado.')
            fetchData()
        } catch { showAlert('error', 'Error al eliminar.') }
    }

    const handleSaved = () => {
        showAlert('success', 'Animal guardado correctamente.')
        fetchData()
    }

    const handleBirthSaved = () => {
        showAlert('success', 'Parto registrado. El ternero aparece en el hato.')
        fetchData()
    }

    if (loading) return (
        <div className="ganado-page">
            <div className="ganado-loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>Cargando producción animal...</span>
            </div>
        </div>
    )

    return (
        <div className="ganado-page">

            {alert && (
                <div className={`ganado-alert ganado-alert--${alert.type}`}>
                    <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {alert.msg}
                </div>
            )}

            {/* ════ HERO ════ */}
            <div className="ganado-hero">
                <div className="ganado-hero-bg" ref={heroBgRef}></div>
                <div className="ganado-hero__bar" />
                <div className="ganado-hero__inner">
                    <div className="ganado-hero__left">
                        <div className="ganado-hero__tag"><i className="fas fa-cow"></i> Módulo de Ganadería</div>
                        <h1 className="ganado-hero__title">Producción <em>Animal</em></h1>
                        <p className="ganado-hero__sub">
                            Registro individual — partos, estado sanitario y trazabilidad completa
                        </p>
                        {summary && (
                            <div className="ganado-hero__pills">
                                <div className="hero-pill">
                                    <span className="hero-pill-label">Total</span>
                                    <span className="hero-pill-value">{summary.total}</span>
                                </div>
                                <div className="hero-pill-div" />
                                <div className="hero-pill">
                                    <span className="hero-pill-label">Machos</span>
                                    <span className="hero-pill-value male">{summary.machos}</span>
                                </div>
                                <div className="hero-pill-div" />
                                <div className="hero-pill">
                                    <span className="hero-pill-label">Hembras</span>
                                    <span className="hero-pill-value female">{summary.hembras}</span>
                                </div>
                                <div className="hero-pill-div" />
                                <div className="hero-pill">
                                    <span className="hero-pill-label">Terneros</span>
                                    <span className="hero-pill-value calf">{summary.crias}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ════ GRID ════ */}
            <div className="cattle-grid-wrapper">
                <div className="cattle-grid">
                    {animals.map((a, i) => (
                        <AnimalCard
                            key={a.id}
                            animal={a}
                            index={i}
                            onView={setShowAnimal}
                            onDelete={handleDelete}
                            onBirth={setBirthAnimal}
                        />
                    ))}

                    {/* Card punteada siempre al final del grid */}
                    <div
                        className="cattle-card--add"
                        onClick={() => setModalCreate(true)}
                        title="Registrar nuevo animal"
                    >
                        <div className="add-card-icon"><i className="fas fa-plus"></i></div>
                        <div className="add-card-label">Registrar Animal</div>
                        <div className="add-card-sub">Añadir nuevo animal al hato</div>
                    </div>
                </div>
            </div>

            {/* ════ MODALES ════ */}

            {/* Ficha (show) */}
            {showAnimal && (
                <ShowModal
                    animal={showAnimal}
                    onClose={() => setShowAnimal(null)}
                    onEdit={() => { setModalEdit(showAnimal); setShowAnimal(null) }}
                    onDelete={() => { handleDelete(showAnimal.id); setShowAnimal(null) }}
                    onBirth={() => { setBirthAnimal(showAnimal); setShowAnimal(null) }}
                />
            )}

            {/* Crear */}
            {modalCreate && (
                <AnimalFormModal
                    mothers={mothers}
                    onClose={() => setModalCreate(false)}
                    onSaved={handleSaved}
                />
            )}

            {/* Editar */}
            {modalEdit && (
                <AnimalFormModal
                    animal={modalEdit}
                    mothers={mothers}
                    onClose={() => setModalEdit(null)}
                    onSaved={handleSaved}
                />
            )}

            {/* Registrar parto */}
            {birthAnimal && (
                <BirthModal
                    mother={birthAnimal}
                    onClose={() => setBirthAnimal(null)}
                    onSaved={handleBirthSaved}
                />
            )}
        </div>
    )
}