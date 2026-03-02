import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal, HatoSummary } from '../services/hatoService'
import './HatoIndex.css'

export default function HatoIndex() {
    const [animals, setAnimals] = useState<Animal[]>([])
    const [summary, setSummary] = useState<HatoSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await hatoService.getAnimals()
            setAnimals(data.animals)
            setSummary(data.summary)
        } catch (err) {
            setError('Error al cargar los animales.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este animal?')) return
        try {
            await hatoService.deleteAnimal(id)
            setSuccess('Animal eliminado correctamente.')
            fetchData()
            setTimeout(() => setSuccess(''), 4500)
        } catch {
            setError('Error al eliminar el animal.')
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'sold': return 'Vendido'
            case 'dead': return 'Fallecido'
            default: return 'Activo'
        }
    }

    const getUseLabel = (purpose: string) => {
        switch (purpose) {
            case 'milk': return 'Lechera'
            case 'meat': return 'Carne'
            case 'dual': return 'Doble propósito'
            default: return purpose || '-'
        }
    }

    if (loading) return <div className="hato-page"><div className="hato-hero">Cargando hato...</div></div>

    return (
        <div className="hato-page">
            {/* Alertas */}
            {success && (
                <div className="hato-alert hato-alert--success">
                    <i className="fas fa-check-circle"></i> {success}
                </div>
            )}
            {error && (
                <div className="hato-alert hato-alert--error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            {/* Hero */}
            <div className="hato-hero">
                <div>
                    <div className="hato-hero__title">
                        <i className="fas fa-cow"></i> Mi Hato Ganadero
                    </div>
                    <p className="hato-hero__sub">Control individual por animal — registra nacimientos, estado y fotos</p>
                </div>
                <Link to="/client/hato/nuevo" className="btn-add-animal">
                    <i className="fas fa-plus"></i> Añadir Animal
                </Link>
            </div>

            {/* Summary pills */}
            {summary && (
                <div className="summary-row">
                    <div className="summary-pill">
                        <span className="summary-pill__icon">🐄</span>
                        <div>
                            <div className="summary-pill__num">{summary.total}</div>
                            <div className="summary-pill__label">Total</div>
                        </div>
                    </div>
                    <div className="summary-pill">
                        <span className="summary-pill__icon">♂️</span>
                        <div>
                            <div className="summary-pill__num">{summary.machos}</div>
                            <div className="summary-pill__label">Machos</div>
                        </div>
                    </div>
                    <div className="summary-pill">
                        <span className="summary-pill__icon">♀️</span>
                        <div>
                            <div className="summary-pill__num">{summary.hembras}</div>
                            <div className="summary-pill__label">Hembras</div>
                        </div>
                    </div>
                    <div className="summary-pill">
                        <span className="summary-pill__icon">🍼</span>
                        <div>
                            <div className="summary-pill__num">{summary.crias}</div>
                            <div className="summary-pill__label">Terneros</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de animales */}
            {animals.length > 0 ? (
                <div className="cattle-grid">
                    {animals.map((animal, index) => (
                        <div className="cattle-card" key={animal.id} style={{ animationDelay: `${index * 0.06}s` }}>
                            {/* Foto */}
                            {animal.photo_url ? (
                                <img src={animal.photo_url} className="cattle-photo" alt={animal.name} />
                            ) : (
                                <div className="cattle-photo-placeholder"><i className="fas fa-cow"></i></div>
                            )}

                            <div className="cattle-card__body">
                                <div className="cattle-card__head">
                                    <div>
                                        <div className="cattle-card__name">{animal.name || 'Sin nombre'}</div>
                                        {animal.tag_number && (
                                            <div className="cattle-card__tag">
                                                <i className="fas fa-tag"></i> Arete #{animal.tag_number}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`status-badge status-${animal.status || 'active'}`}>
                                        {getStatusLabel(animal.status)}
                                    </span>
                                </div>

                                <div className="cattle-info">
                                    <div className="cattle-info-item">
                                        <span className="cattle-info-item__label">Raza</span>
                                        <span className="cattle-info-item__val">{animal.breed || '-'}</span>
                                    </div>
                                    <div className="cattle-info-item">
                                        <span className="cattle-info-item__label">Uso</span>
                                        <span className="cattle-info-item__val">{getUseLabel(animal.purpose)}</span>
                                    </div>
                                    <div className="cattle-info-item">
                                        <span className="cattle-info-item__label">Sexo</span>
                                        <span className="cattle-info-item__val">{animal.gender === 'female' || (animal.gender as any) === 'hembra' ? '♀ Hembra' : '♂ Macho'}</span>
                                    </div>
                                    <div className="cattle-info-item">
                                        <span className="cattle-info-item__label">Edad</span>
                                        <span className="cattle-info-item__val">{animal.age_text || 'N/D'}</span>
                                    </div>
                                    {animal.weight && (
                                        <div className="cattle-info-item">
                                            <span className="cattle-info-item__label">Peso prom.</span>
                                            <span className="cattle-info-item__val">{animal.weight} kg</span>
                                        </div>
                                    )}
                                </div>

                                {/* Terneros / crías */}
                                {animal.calves && animal.calves.length > 0 && (
                                    <div className="calves-section">
                                        <div className="calves-label">
                                            <i className="fas fa-baby"></i> Crías ({animal.calves.length})
                                        </div>
                                        {animal.calves.map(calf => (
                                            <span className="calf-chip" key={calf.id}>
                                                {calf.gender === 'female' || (calf.gender as any) === 'hembra' ? '♀' : '♂'} {calf.name || 'Sin nombre'}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="cattle-card__foot">
                                {(animal.gender === 'female' || (animal.gender as any) === 'hembra') && (animal.status || 'active') === 'active' && (
                                    <Link to={`/client/hato/${animal.id}/nacimiento`} className="card-btn card-btn--birth">
                                        <i className="fas fa-baby"></i> Registrar parto
                                    </Link>
                                )}
                                <Link to={`/client/hato/${animal.id}`} className="card-btn card-btn--detail">
                                    <i className="fas fa-eye"></i> Detalle
                                </Link>
                                <button onClick={() => handleDelete(animal.id)} className="card-btn card-btn--delete">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="hato-empty">
                    <i className="fas fa-cow"></i>
                    <h3>No tienes animales registrados</h3>
                    <p>Añade tu primer animal para comenzar a llevar el control de tu hato.</p>
                </div>
            )}
        </div>
    )
}
