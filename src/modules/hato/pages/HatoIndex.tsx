import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { hatoService } from '../services/hatoService'
import type { Animal, HatoSummary } from '../services/hatoService'
import './HatoIndex.css'

const getPurposeLabel = (p?: string) =>
    ({ milk: 'Lechera', meat: 'Carne', dual: 'Doble propósito' }[p!] ?? p ?? '—')
const getPurposeIcon = (p?: string) =>
    ({ milk: 'fa-droplet', meat: 'fa-drumstick-bite', dual: 'fa-scale-balanced' }[p!] ?? 'fa-circle-question')
const getStatusLabel = (s: string) => ({ sold: 'Vendido', dead: 'Fallecido' }[s] ?? 'Activo')
const getGenderLabel = (g: string) =>
    (g==='female'||g==='hembra') ? 'Hembra' : (g==='male'||g==='macho') ? 'Macho' : g
const isFemale = (g: string) => g==='female' || g==='hembra'
const isCalf   = (a: Animal) => !!a.mother_id

/** Returns the extra CSS class for a calf card based on sex */
const calfCardClass = (a: Animal): string => {
    if (!isCalf(a)) return ''
    return isFemale(a.gender) ? ' cattle-card--calf-female' : ' cattle-card--calf-male'
}

interface CardProps { animal: Animal; index: number; onDelete: (id: number) => void }

function AnimalCard({ animal, index, onDelete }: CardProps) {
    const purpose = animal.purpose ?? animal.use_milk_meat
    const weight  = animal.weight  ?? animal.average_weight
    const calf    = isCalf(animal)

    return (
        <div
            className={`cattle-card${calfCardClass(animal)}`}
            style={{ animationDelay: `${index * 0.055}s` }}
        >
            {/* Photo or placeholder */}
            {animal.photo_url || animal.photo
                ? <img src={animal.photo_url ?? animal.photo} className="cattle-photo" alt={animal.name} />
                : <div className="cattle-photo-placeholder">
                    <i className={`fas ${calf ? 'fa-paw' : 'fa-cow'}`}></i>
                  </div>
            }

            {/* Calf ribbon */}
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
                            <div className="cattle-card__tag">
                                <i className="fas fa-tag"></i> Arete #{animal.tag_number}
                            </div>
                        )}
                        {calf && animal.mother && (
                            <div className="cattle-card__mother">
                                <i className="fas fa-venus"></i> Madre:&nbsp;
                                <Link to={`/client/hato/${animal.mother.id}`} className="mother-link">
                                    {animal.mother.name || 'Sin nombre'}
                                </Link>
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
                            <span className="cattle-info-item__label"><i className="fas fa-weight-scale"></i> Peso prom.</span>
                            <span className="cattle-info-item__val">{weight} kg</span>
                        </div>
                    )}
                </div>

                {!calf && animal.calves && animal.calves.length > 0 && (
                    <div className="calves-section">
                        <div className="calves-label">
                            <i className="fas fa-sitemap"></i> Descendencia ({animal.calves.length})
                        </div>
                        {animal.calves.map(c => (
                            <Link to={`/client/hato/${c.id}`} className="calf-chip" key={c.id}>
                                <i className={`fas fa-${isFemale(c.gender) ? 'venus' : 'mars'}`}></i>
                                {c.name || 'Sin nombre'}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="cattle-card__foot">
                {!calf && isFemale(animal.gender) && (animal.status || 'active') === 'active' && (
                    <Link to={`/client/hato/${animal.id}/nacimiento`} className="card-btn card-btn--birth">
                        <i className="fas fa-stethoscope"></i> Registrar parto
                    </Link>
                )}
                <Link to={`/client/hato/${animal.id}`} className="card-btn card-btn--detail">
                    <i className="fas fa-file-lines"></i> Ficha
                </Link>
                <button onClick={() => onDelete(animal.id)} className="card-btn card-btn--delete" title="Eliminar">
                    <i className="fas fa-trash-can"></i>
                </button>
            </div>
        </div>
    )
}

export default function GanadoIndex() {
    const [animals, setAnimals] = useState<Animal[]>([])
    const [summary, setSummary] = useState<HatoSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await hatoService.getAnimals()
            setAnimals(data.animals)
            setSummary(data.summary)
        } catch { setError('Error al cargar los animales.') }
        finally  { setLoading(false) }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Confirmas eliminar este animal del registro?')) return
        try {
            await hatoService.deleteAnimal(id)
            setSuccess('Animal eliminado.')
            fetchData()
            setTimeout(() => setSuccess(''), 4500)
        } catch { setError('Error al eliminar el animal.') }
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
            {success && <div className="ganado-alert ganado-alert--success"><i className="fas fa-check-circle"></i> {success}</div>}
            {error   && <div className="ganado-alert ganado-alert--error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

            <div className="ganado-hero">
                <div className="ganado-hero__bar" />
                <div className="ganado-hero__left">
                    <span className="ganado-hero__tag"><i className="fas fa-cow"></i> Módulo de Ganadería</span>
                    <h1 className="ganado-hero__title">Producción Animal</h1>
                    <p className="ganado-hero__sub">
                        Registro individual por animal — partos, estado sanitario y trazabilidad completa
                    </p>
                </div>
                <Link to="/client/hato/nuevo" className="btn-add-animal">
                    <i className="fas fa-plus"></i> Registrar Animal
                </Link>
            </div>

            {summary && (
                <div className="summary-row">
                    {[
                        { mod: '--total',  icon: 'fa-cow',   num: summary.total,   label: 'Total animales' },
                        { mod: '--male',   icon: 'fa-mars',  num: summary.machos,  label: 'Machos' },
                        { mod: '--female', icon: 'fa-venus', num: summary.hembras, label: 'Hembras' },
                        { mod: '--cria',   icon: 'fa-paw',   num: summary.crias,   label: 'Terneros' },
                    ].map(({ mod, icon, num, label }) => (
                        <div className="summary-pill" key={label}>
                            <div className={`summary-pill__icon-wrap summary-pill__icon-wrap${mod}`}>
                                <i className={`fas ${icon}`}></i>
                            </div>
                            <div>
                                <div className="summary-pill__num">{num}</div>
                                <div className="summary-pill__label">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {animals.length > 0 ? (
                <div className="cattle-grid">
                    {animals.map((a, i) => (
                        <AnimalCard key={a.id} animal={a} index={i} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="ganado-empty">
                    <div className="ganado-empty__icon"><i className="fas fa-cow"></i></div>
                    <h3>Sin animales registrados</h3>
                    <p>Añade tu primer animal para comenzar a llevar el control de tu producción.</p>
                    <Link to="/client/hato/nuevo" className="btn-add-animal" style={{ marginTop: 24 }}>
                        <i className="fas fa-plus"></i> Registrar primer animal
                    </Link>
                </div>
            )}
        </div>
    )
}