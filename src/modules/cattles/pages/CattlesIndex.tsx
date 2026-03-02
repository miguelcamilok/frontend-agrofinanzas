import { useState, useEffect } from 'react'
import './Cattles.css'

interface CattleTopic {
    id: string
    title: string
    category: string
    shortDesc: string
    fullDesc: string
    image: string
    stats: { label: string; value: string }[]
    tags: string[]
}

const BREEDS: CattleTopic[] = [
    {
        id: 'angus',
        title: 'Angus',
        category: 'Carne Premium',
        shortDesc: 'Raza especializada en carne premium con excelente marmoleo. Base de los mejores cortes mundiales.',
        fullDesc: 'La raza Angus es originaria de Escocia y es reconocida mundialmente por la calidad de su carne. Posee un excelente marmoleo (grasa intramuscular) que le otorga un sabor y suavidad superior. Es ideal para programas de carne certificada.',
        image: 'https://asoangusbrangus.org.co/images/razas/raza_angus.jpg',
        stats: [
            { label: 'Tipo', value: 'Cárnico' },
            { label: 'Marmoleo', value: 'Excelente' },
            { label: 'Peso Macho', value: '700-900 kg' }
        ],
        tags: ['Escocia', 'Precocidad', 'Fertilidad', 'Sin Cuernos']
    },
    {
        id: 'holstein',
        title: 'Holstein',
        category: 'Alta Leche',
        shortDesc: 'Principal raza lechera del mundo. Alta producción diaria con manejo nutricional preciso.',
        fullDesc: 'La Holstein es la raza lechera por excelencia. Proveniente de Holanda, destaca por su gran volumen de producción. Requiere un manejo nutricional y ambiental riguroso para expresar su máximo potencial genético.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Koe_zijaanzicht_2.JPG',
        stats: [
            { label: 'Tipo', value: 'Lechero' },
            { label: 'Leche/día', value: '25 – 45 L' },
            { label: 'Grasa', value: '3.6%' }
        ],
        tags: ['Holanda', 'Volumen', 'Especializada', 'Trópico Alto']
    },
    {
        id: 'brahman',
        title: 'Brahman',
        category: 'Trópico',
        shortDesc: 'Adaptado a climas tropicales calientes. Resistente al calor, parásitos y enfermedades.',
        fullDesc: 'El Brahman es la base de la ganadería en el trópico bajo colombiano. Su robustez, resistencia a ectoparásitos y capacidad de termorregulación lo hacen indispensable para cruces industriales y producción extensiva.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv3lIeK4cZ4g7u_3WHY4cRiyGjWIKeW4ammQ&s',
        stats: [
            { label: 'Tipo', value: 'Doble Propósito' },
            { label: 'Clima', value: 'Tropical' },
            { label: 'Resistencia', value: 'Alta' }
        ],
        tags: ['Giba', 'Rusticidad', 'Cruzamiento', 'Longevidad']
    }
]

const FEEDING_SYSTEMS: CattleTopic[] = [
    {
        id: 'extensivo',
        title: 'Pastoreo Extensivo',
        category: 'Bajo Insumo',
        shortDesc: 'Animales en grandes áreas libres. Menor inversión inicial pero baja carga animal por hectárea.',
        fullDesc: 'Sistema tradicional donde los animales forrajean libremente en grandes extensiones. Aunque requiere poca inversión en cercas, la eficiencia por área es limitada y exige mayor tiempo para la finalización.',
        image: 'https://www.uoc.edu/content/dam/news/images/noticies/2023/200-la-tecnologia-dona-pas-al-pasturatge-digital.jpg',
        stats: [
            { label: 'Inversión', value: 'Baja' },
            { label: 'Carga/ha', value: '0.5 – 1 UA' },
            { label: 'Manejo', value: 'Simple' }
        ],
        tags: ['Tradicional', 'Grandes áreas', 'Bajo costo', 'Llanos']
    },
    {
        id: 'rotacional',
        title: 'Rotacional (Voisin)',
        category: 'Alta Eficiencia',
        shortDesc: 'Potreros divididos con cercas eléctricas. Optimiza el descanso del pasto y la nutrición animal.',
        fullDesc: 'Basado en las leyes de Voisin, este sistema divide la finca en potreros pequeños. Permite un pastoreo intensivo seguido de un periodo de descanso óptimo para el pasto, duplicando la carga animal usual.',
        image: 'https://infopastosyforrajes.com/wp-content/uploads/2020/04/Sistemas-de-Pastoreo-2.jpg',
        stats: [
            { label: 'Carga/ha', value: '2 – 4 UA' },
            { label: 'Eficiencia', value: 'Alta' },
            { label: 'Inversión', value: 'Media (Cercas)' }
        ],
        tags: ['Divisiones', 'Descanso', 'Leyes de Voisin', 'Productivo']
    },
    {
        id: 'feedlot',
        title: 'Confinamiento (Feedlot)',
        category: 'Intensivo',
        shortDesc: 'Alimentación controlada en corrales. Máxima ganancia de peso diaria en el menor tiempo posible.',
        fullDesc: 'Los animales se mantienen en corrales y se les suministra una dieta balanceada rica en granos y fibra. Es el sistema más rápido para finalización, pero exige altos conocimientos en nutrición y gestión de costos.',
        image: 'https://a.storyblok.com/f/160385/a33fe0d0ac/aumentar-espacio-vital-ganado-esta-confinamiento.jpg',
        stats: [
            { label: 'GDP', value: '1.2 – 1.8 kg' },
            { label: 'Inversión', value: 'Alta' },
            { label: 'Tiempo', value: 'Finalización rápida' }
        ],
        tags: ['Corrales', 'Maíz', 'Ceba Intensiva', 'Control Total']
    }
]

const PRACTICE_TOPICS: Record<string, CattleTopic> = {
    nutricion: {
        id: 'nutricion',
        title: 'Manejo Nutricional',
        category: 'Nutrición',
        shortDesc: 'Dietas balanceadas según etapa productiva para maximizar ganancia de peso y salud digestiva.',
        fullDesc: 'La nutrición es el pilar de la producción. Analizamos requerimientos de proteína, energía y minerales para cada etapa (inicio, levante, ceba). El uso de ensilajes y suplementos estratégicos es vital fuera de temporada.',
        image: 'https://desarrollorural.yucatan.gob.mx/files-content/galerias/5e35b133328bb9efa0466a7ee62e7606.jpg',
        stats: [{ label: 'Conversión', value: 'Óptima' }, { label: 'GDP', value: '+1.0kg' }],
        tags: ['Proteína', 'Energía', 'Sales', 'Agua']
    },
    sanidad: {
        id: 'sanidad',
        title: 'Control Sanitario',
        category: 'Salud',
        shortDesc: 'Vacunación, desparasitación y seguimiento veterinario continuo.',
        fullDesc: 'Un hato sano es un hato rentable. Seguimos el calendario oficial del ICA (Aftosa, Brucelosis) y mantenemos un control estricto de parásitos internos y externos (garrapatas, moscas).',
        image: 'https://img.lalr.co/cms/2020/04/13165837/Eco_vacunacionAftosa_AGRO.jpg?r=4_3',
        stats: [{ label: 'Vacunación', value: '100% Cobertura' }, { label: 'Mortalidad', value: '<2%' }],
        tags: ['Vacunas', 'Bioseguridad', 'Diagnóstico', 'ICA']
    },
    bienestar: {
        id: 'bienestar',
        title: 'Bienestar Animal',
        category: 'Bienestar',
        shortDesc: 'Espacios adecuados y manejo sin estrés bajo normativas vigentes.',
        fullDesc: 'El bienestar animal impacta directamente en la calidad de la carne y leche. Reducir el estrés en el manejo, proveer sombra y agua limpia son requisitos para el éxito productivo moderno.',
        image: 'https://images.unsplash.com/photo-1547496613-4e193f0b830d?auto=format&fit=crop&q=80&w=800',
        stats: [{ label: 'Estrés', value: 'Mínimo' }, { label: 'Confort', value: 'Alto' }],
        tags: ['Sombra', 'Hidratación', 'Trato Ético', 'Suelo Seco']
    }
}

const HERO_IMAGES = [
    "https://aurocha.com/wp-content/uploads/2021/12/vacas-angus-aberdeen-scaled.jpg",
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30",
    "https://i.pinimg.com/736x/3d/3a/6e/3d3a6e311ff5e5285a84de5dc938cc42.jpg",
    "https://montanaweb-bucket.s3.amazonaws.com/web/blog/1/produccion-de-terneros.png"
]

export default function CattlesIndex() {
    const [selectedTopic, setSelectedTopic] = useState<CattleTopic | null>(null)
    const [heroIndex, setHeroIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="cattle-page">
            {/* ── HERO SECTION ── */}
            <section className="cattle-hero">
                <div className="cattle-hero-text">
                    <span className="hero-eyebrow">AgroFinanzas</span>
                    <h1>Manejo y Producción<br /><em>Ganadera</em></h1>
                    <p>Gestión integral del ganado bovino — genética, nutrición, sanidad y comercialización bajo un enfoque técnico y sostenible.</p>
                    <div className="hero-actions">
                        <a href="#razasBovinas" className="btn-cattle btn-cattle-primary"><i className="fas fa-paw"></i> Razas Bovinas</a>
                        <a href="#procesoGanado" className="btn-cattle btn-cattle-outline"><i className="fas fa-route"></i> Ciclo Productivo</a>
                    </div>
                </div>

                <div className="cattle-hero-carousel">
                    <img src={HERO_IMAGES[heroIndex]} alt="Carrusel Ganadería" style={{ transition: 'opacity 1s ease-in-out' }} />
                    <div className="carousel-indicators">
                        {HERO_IMAGES.map((_, i) => (
                            <button
                                key={i}
                                className={i === heroIndex ? 'active' : ''}
                                onClick={() => setHeroIndex(i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ── RAZAS SECTION ── */}
            <section className="cattle-section" id="razasBovinas">
                <div className="container">
                    <span className="section-label">Genética Bovina</span>
                    <h2 className="section-heading">Razas <em>Bovinas</em></h2>
                    <p className="section-sub">Selecciona la raza adecuada según objetivo productivo, clima y sistema de manejo.</p>

                    <div className="cattle-cards-grid">
                        {BREEDS.map(breed => (
                            <div className="cattle-card-pro" key={breed.id} onClick={() => setSelectedTopic(breed)}>
                                <div className="card-img-wrap">
                                    <img src={breed.image} alt={breed.title} />
                                    <span className="card-badge">{breed.category}</span>
                                </div>
                                <div className="card-body-pro">
                                    <h5>{breed.title}</h5>
                                    <p>{breed.shortDesc}</p>
                                    <div className="card-stats">
                                        {breed.stats.slice(0, 2).map((s, idx) => (
                                            <div className="card-stat" key={idx}>
                                                <span>{s.label}</span>
                                                <span>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="card-open-btn">Ver detalles técnicos <i className="fas fa-arrow-right"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="reference-panel">
                        <h4>Criterios de Selección Racial</h4>
                        <p>La selección de razas bovinas debe basarse en criterios técnicos objetivos que garanticen rentabilidad y sostenibilidad del sistema productivo a largo plazo.</p>
                        <ul className="reference-list">
                            <li><strong>Objetivo productivo:</strong> carne, leche o doble propósito.</li>
                            <li><strong>Adaptación climática:</strong> impacto directo en rendimiento.</li>
                            <li><strong>Sistema de manejo:</strong> intensivo, semi-intensivo o extensivo.</li>
                            <li><strong>Calidad genética:</strong> EPDs y registros de producción verificados.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ── CYCLE SECTION ── */}
            <section className="cattle-section cycle-section" id="procesoGanado">
                <div className="container">
                    <span className="section-label">Ciclo Productivo</span>
                    <h2 className="section-heading">Del Nacimiento<br /><em>al Mercado</em></h2>
                    <p className="section-sub">Cada etapa del ciclo exige un manejo específico para maximizar el potencial productivo.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px', marginTop: '40px' }}>
                        <div>
                            <ul className="timeline-clean">
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-star"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Nacimiento & Calostrado</strong>
                                        <p>Ingesta temprana de calostro para garantizar inmunidad pasiva y reducir mortalidad neonatal.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-seedling"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Crianza (Lactancia)</strong>
                                        <p>Desarrollo del sistema digestivo y fortalecimiento del crecimiento inicial mediante manejo nutricional cuidadoso.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-cut"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Destete</strong>
                                        <p>Transición controlada a dieta sólida para minimizar estrés y pérdidas productivas.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-chart-line"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Levante (Recría)</strong>
                                        <p>Crecimiento óseo y muscular sostenido que define el potencial productivo futuro del animal.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-weight"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Ceba (Engorde)</strong>
                                        <p>Optimización de ganancia de peso diaria y eficiencia de conversión alimenticia.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot-c"><i className="fas fa-store"></i></div>
                                    <div className="tl-body-c">
                                        <strong>Comercialización</strong>
                                        <p>Logística, trazabilidad completa y transporte bajo normas de bienestar animal.</p>
                                    </div>
                                </li>
                            </ul>

                            <div style={{ marginTop: '40px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <iframe
                                    src="https://www.youtube.com/embed/0b5iyRCG3P0"
                                    style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                                    title="Ciclo Ganadero"
                                    allowFullScreen
                                />
                            </div>
                        </div>

                        <div className="process-side">
                            <div className="process-img-c" style={{ height: '280px', marginBottom: '24px' }}>
                                <img src="https://desarrollorural.yucatan.gob.mx/files-content/galerias/5e35b133328bb9efa0466a7ee62e7606.jpg" alt="Ciclo productivo" />
                            </div>

                            <div className="practices-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                                <div className="practice-card" onClick={() => setSelectedTopic(PRACTICE_TOPICS.nutricion)} style={{ cursor: 'pointer' }}>
                                    <div className="practice-icon"><i className="fas fa-apple-alt"></i></div>
                                    <h5>Manejo Nutricional</h5>
                                    <p>Dietas balanceadas según etapa productiva para maximizar ganancia de peso y salud digestiva.</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="practice-card" onClick={() => setSelectedTopic(PRACTICE_TOPICS.sanidad)} style={{ cursor: 'pointer' }}>
                                        <div className="practice-icon"><i className="fas fa-syringe"></i></div>
                                        <h5>Control Sanitario</h5>
                                        <p>Vacunación, desparasitación y seguimiento veterinario continuo.</p>
                                    </div>
                                    <div className="practice-card" onClick={() => setSelectedTopic(PRACTICE_TOPICS.bienestar)} style={{ cursor: 'pointer' }}>
                                        <div className="practice-icon"><i className="fas fa-heart"></i></div>
                                        <h5>Bienestar Animal</h5>
                                        <p>Espacios adecuados y manejo sin estrés bajo normativas vigentes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ── FEEDING SYSTEMS SECTION ── */}
            <section className="cattle-section" id="metodosCosecha">
                <div className="container">
                    <span className="section-label">Alimentación</span>
                    <h2 className="section-heading">Sistemas de <em>Pastoreo</em></h2>
                    <p className="section-sub">El sistema de alimentación determina la productividad, sostenibilidad y rentabilidad de la finca.</p>

                    <div className="cattle-cards-grid">
                        {FEEDING_SYSTEMS.map(sys => (
                            <div className="cattle-card-pro" key={sys.id} onClick={() => setSelectedTopic(sys)}>
                                <div className="card-img-wrap">
                                    <img src={sys.image} alt={sys.title} />
                                    <span className="card-badge">{sys.category}</span>
                                </div>
                                <div className="card-body-pro">
                                    <h5>{sys.title}</h5>
                                    <p>{sys.shortDesc}</p>
                                    <div className="card-stats">
                                        {sys.stats.slice(0, 2).map((s, idx) => (
                                            <div className="card-stat" key={idx}>
                                                <span>{s.label}</span>
                                                <span>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="card-open-btn">Ver detalles <i className="fas fa-arrow-right"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="cattle-divider" />

            {/* ── NEWS SECTION ── */}
            <section className="cattle-section cycle-section" id="noticiasGanado">
                <div className="container">
                    <span className="section-label">Actualidad</span>
                    <h2 className="section-heading">Mercados y <em>Noticias</em></h2>
                    <p className="section-sub">Precios, sanidad e innovación tecnológica para el sector pecuario.</p>

                    <div className="news-grid">
                        <div className="news-card-c">
                            <div className="news-card-img">
                                <img src="https://www.asoregan.co/wp-content/uploads/2024/09/Claves-para-la-Compra-Rentable-de-Ganado.jpg" alt="Precios" />
                            </div>
                            <div className="news-card-body">
                                <span className="news-badge badge-market">Mercado</span>
                                <h5>Tendencia de Precios en Subasta</h5>
                                <p>El ganado en pie mantiene estabilidad esta semana. Los machos de levante lideran la demanda entre cebadores.</p>
                            </div>
                        </div>

                        <div className="news-card-c">
                            <div className="news-card-img">
                                <img src="https://img.lalr.co/cms/2020/04/13165837/Eco_vacunacionAftosa_AGRO.jpg?r=4_3" alt="Sanidad" />
                            </div>
                            <div className="news-card-body">
                                <span className="news-badge badge-health">Sanidad</span>
                                <h5>Ciclo de Vacunación 2024</h5>
                                <p>Autoridades sanitarias anuncian fechas para el primer ciclo contra fiebre aftosa y brucelosis bovina.</p>
                            </div>
                        </div>

                        <div className="news-card-c">
                            <div className="news-card-img">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd4Ez5yfKD6A81dZd55Q1Cx2s1bi16_v30ug&s" alt="Tecnología" />
                            </div>
                            <div className="news-card-body">
                                <span className="news-badge badge-tech">Innovación</span>
                                <h5>Identificación RFID Ganadera</h5>
                                <p>Crotales con tecnología RFID permiten control preciso de ganancia diaria de peso e historial sanitario individual.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CATTLE MODAL ── */}
            {selectedTopic && (
                <div className="cattle-modal-overlay open" onClick={() => setSelectedTopic(null)}>
                    <div className="cattle-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedTopic(null)}><i className="fas fa-times"></i></button>
                        <img className="modal-hero-img" src={selectedTopic.image} alt={selectedTopic.title} />
                        <div className="modal-body-c">
                            <span className="modal-eyebrow">{selectedTopic.category}</span>
                            <h2 className="modal-title-c">{selectedTopic.title}</h2>
                            <p className="modal-desc-c">{selectedTopic.fullDesc}</p>
                            <div className="modal-stats-grid">
                                {selectedTopic.stats.map((s, i) => (
                                    <div className="modal-stat" key={i}>
                                        <span>{s.label}</span>
                                        <span>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <h4 className="modal-section-title-c">Etiquetas / Conceptos</h4>
                            <div className="modal-tags">
                                {selectedTopic.tags.map(tag => (
                                    <span className="modal-tag" key={tag}>{tag}</span>
                                ))}
                            </div>
                            <div className="modal-links" style={{ display: 'block' }}>
                                <h4>Recursos Técnicos</h4>
                                <ul>
                                    <li><a href="#"><i className="fas fa-file-pdf"></i> Guía Detallada</a></li>
                                    <li><a href="#"><i className="fas fa-external-link-alt"></i> Normativa ICA</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
