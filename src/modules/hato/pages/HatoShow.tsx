import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal } from '../services/hatoService'
import './HatoShow.css'

export default function HatoShow() {
    const { id } = useParams<{ id: string }>()
    const [animal, setAnimal] = useState<Animal | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAnimal = async () => {
            if (!id) return
            setLoading(true)
            try {
                const data = await hatoService.getAnimal(Number(id))
                setAnimal(data.animal)
            } catch (err) {
                setError('No se pudo encontrar la información del animal.')
            } finally {
                setLoading(false)
            }
        }
        fetchAnimal()
    }, [id])

    const getUseLabel = (purpose: string) => {
        switch (purpose) {
            case 'milk': return '🥛 Producción de Leche'
            case 'meat': return '🥩 Producción de Carne'
            case 'dual': return '⚖️ Doble Propósito'
            default: return purpose || '-'
        }
    }

    const getUseClass = (purpose: string) => {
        switch (purpose) {
            case 'milk': return 'use-milk'
            case 'meat': return 'use-meat'
            default: return 'use-dual'
        }
    }

    if (loading) return <div className="cattle-show-page"><div className="show-hero">Cargando ficha técnica...</div></div>
    if (error || !animal) return <div className="cattle-show-page"><div className="show-hero">{error || 'Animal no encontrado'}</div></div>

    return (
        <div className="cattle-show-page">
            <Link to="/client/hato/hato" className="back-link">
                <i className="fas fa-arrow-left"></i> Volver al hato
            </Link>

            {/* ── HERO ── */}
            <div className="show-hero">
                {animal.photo_url ? (
                    <img
                        src={animal.photo_url}
                        className="show-hero__img"
                        alt={animal.breed}
                    />
                ) : (
                    <div className="show-hero__placeholder">🐄</div>
                )}

                <div className="show-hero__body">
                    <div className="show-hero__breed">{animal.breed || 'Raza no especificada'}</div>
                    <h1 className="show-hero__title">{animal.name || 'Sin nombre'}</h1>
                    <p className="show-hero__use">{getUseLabel(animal.purpose)}</p>

                    <div className="hero-pills">
                        {animal.weight && (
                            <span className="hero-pill">
                                <i className="fas fa-weight-scale"></i> {animal.weight} kg
                            </span>
                        )}
                        {animal.purpose && (
                            <span className="hero-pill">
                                <i className="fas fa-tag"></i> {getUseLabel(animal.purpose)}
                            </span>
                        )}
                        {animal.tag_number && (
                            <span className="hero-pill">
                                <i className="fas fa-fingerprint"></i> Arete #{animal.tag_number}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── DATOS TÉCNICOS ── */}
            <div className="info-section">
                <div className="info-section__title">
                    <i className="fas fa-clipboard-list"></i> Datos Técnicos
                </div>
                <div className="info-grid">
                    <div>
                        <div className="info-item__label">Raza</div>
                        <div className="info-item__val">{animal.breed || '-'}</div>
                    </div>
                    <div>
                        <div className="info-item__label">Peso promedio</div>
                        <div className="info-item__val">
                            {animal.weight ? `${animal.weight} kg` : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="info-item__label">Propósito productivo</div>
                        <div className="info-item__val">
                            <span className={`use-badge ${getUseClass(animal.purpose)}`}>
                                {getUseLabel(animal.purpose)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="info-item__label">Sexo</div>
                        <div className="info-item__val">
                            {animal.gender === 'female' || (animal.gender as any) === 'hembra' ? '♀ Hembra' : '♂ Macho'}
                        </div>
                    </div>
                    <div>
                        <div className="info-item__label">Fecha de nacimiento</div>
                        <div className="info-item__val">
                            {animal.birth_date || '-'}
                        </div>
                    </div>
                    <div>
                        <div className="info-item__label">Edad</div>
                        <div className="info-item__val">{animal.age_text || 'N/D'}</div>
                    </div>
                    <div>
                        <div className="info-item__label">Origen</div>
                        <div className="info-item__val">
                            {animal.origin === 'born_here' ? 'Nacido en la finca' : 'Comprado'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── NOTAS ── */}
            {animal.notes && (
                <div className="info-section">
                    <div className="info-section__title">
                        <i className="fas fa-sticky-note"></i> Notas y Observaciones
                    </div>
                    <div style={{ color: '#dde8c8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {animal.notes}
                    </div>
                </div>
            )}

            {/* ── MADRE ── */}
            {animal.mother && (
                <div className="info-section">
                    <div className="info-section__title">
                        <i className="fas fa-venus"></i> Genealogía (Madre)
                    </div>
                    <div className="info-grid">
                        <div>
                            <div className="info-item__label">Nombre</div>
                            <div className="info-item__val">
                                <Link to={`/client/hato/${animal.mother.id}`} style={{ color: '#8ac926' }}>
                                    {animal.mother.name || 'Sin nombre'}
                                </Link>
                            </div>
                        </div>
                        <div>
                            <div className="info-item__label">Arete</div>
                            <div className="info-item__val">{animal.mother.tag_number || '-'}</div>
                        </div>
                        <div>
                            <div className="info-item__label">Raza</div>
                            <div className="info-item__val">{animal.mother.breed || '-'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CRÍAS ── */}
            {animal.calves && animal.calves.length > 0 && (
                <div className="info-section">
                    <div className="info-section__title">
                        <i className="fas fa-baby-carriage"></i> Descendencia ({animal.calves.length})
                    </div>
                    <div className="info-grid">
                        {animal.calves.map(calf => (
                            <div key={calf.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div className="info-item__label">
                                    {calf.gender === 'female' || (calf.gender as any) === 'hembra' ? '♀ Hembra' : '♂ Macho'}
                                </div>
                                <div className="info-item__val">
                                    <Link to={`/client/hato/${calf.id}`} style={{ color: '#f59e0b' }}>
                                        {calf.name || 'Sin nombre'}
                                    </Link>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#7a8a6a', marginTop: '4px' }}>
                                    Nacido el: {calf.birth_date || 'N/D'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
