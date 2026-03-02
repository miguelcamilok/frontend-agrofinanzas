import { useState, useRef, useEffect } from 'react'
import './Avocado.css'

interface AvoDataItem {
    eyebrow: string
    title: string
    images: string[]
    desc: string
    stats: { label: string; value: string }[]
    tagsTitle: string
    tags: string[]
}

const avoData: Record<string, AvoDataItem> = {
    hass: {
        eyebrow: 'Variedad N°1 Mundial',
        title: 'Aguacate Hass',
        images: [
            'https://www.reyesgutierrez.com/wp-content/uploads/2021/04/aguacate-hass.jpg',
            'https://images.unsplash.com/photo-1560155016-bd4879ae26ba?w=600',
        ],
        desc: 'El Hass es la variedad de aguacate más comercializada del mundo, representando más del 80% de la producción global. Desarrollada en California por Rudolph Hass en los años 1930, su piel rugosa que cambia de verde a morado-negro al madurar la hace inconfundible. Su alto contenido de aceite le da una textura cremosa y sabor intenso, ideal para guacamole, tostadas y cualquier preparación gourmet.',
        stats: [
            { label: 'Contenido aceite', value: '18 – 25%' },
            { label: 'Peso fruto', value: '150 – 300 g' },
            { label: 'Floración', value: 'Tipo A' },
        ],
        tagsTitle: 'Características clave',
        tags: ['Alta demanda global', 'Piel rugosa', 'Madura en árbol', 'Larga vida poscosecha', 'Alta grasa saludable'],
    },
    fuerte: {
        eyebrow: 'Híbrido Clásico',
        title: 'Aguacate Fuerte',
        images: [
            'https://fertilizantesecoforce.es/wp-content/uploads/2022/06/Comprar-arbol-aguacate-fuerte.jpeg',
        ],
        desc: 'El Fuerte es un cruce natural entre la raza guatemalteca y mexicana. Fue la variedad dominante de exportación antes de la masificación del Hass. Su piel verde lisa y brillante no cambia de color al madurar, lo que dificulta determinar su punto de cosecha solo por aspecto. Sabor suave y suave, muy apreciado en el mercado europeo.',
        stats: [
            { label: 'Contenido aceite', value: '14 – 18%' },
            { label: 'Peso fruto', value: '200 – 450 g' },
            { label: 'Floración', value: 'Tipo B' },
        ],
        tagsTitle: 'Características clave',
        tags: ['Sabor suave', 'Piel verde lisa', 'Mercado europeo', 'Raza guatemalteca-mexicana'],
    },
    gwen: {
        eyebrow: 'Variedad Premium',
        title: 'Aguacate Gwen',
        images: [
            'https://i.etsystatic.com/32029892/r/il/1db8dd/4476791049/il_1080xN.4476791049_7t7k.jpg',
        ],
        desc: 'El Gwen es una mejora del Hass desarrollada por la Universidad de California. Su fruto es más grande (250–450 g), con una piel ligeramente más suave y un sabor igualmente cremoso y rico. Es menos conocida comercialmente pero muy apreciada por sus características organolépticas superiores.',
        stats: [
            { label: 'Contenido aceite', value: '16 – 22%' },
            { label: 'Peso fruto', value: '250 – 450 g' },
            { label: 'Floración', value: 'Tipo A' },
        ],
        tagsTitle: 'Características clave',
        tags: ['Fruto grande', 'Derivada del Hass', 'Alta cremosidad', 'UC California'],
    },
    bacon: {
        eyebrow: 'Variedad Complementaria',
        title: 'Aguacate Bacon',
        images: [
            'https://cdn.shopify.com/s/files/1/0611/0252/2576/files/2_1_0bdb538a-f436-4495-8653-1166025065a7.png?v=1729876018',
            'https://cdn.shopify.com/s/files/1/0611/0252/2576/files/1_1.png?v=1729875883',
        ],
        desc: 'El Bacon es una variedad de raza mexicana conocida por su resistencia a bajas temperaturas (tolera hasta -4°C sin daño severo). De floración tipo B, es usado frecuentemente como polinizador en huertos de Hass. Su fruto es de tamaño mediano, piel verde lisa y sabor más suave con menor contenido de aceite que el Hass.',
        stats: [
            { label: 'Resistencia frío', value: 'Hasta -4°C' },
            { label: 'Floración', value: 'Tipo B' },
            { label: 'Aceite', value: '~8%' },
        ],
        tagsTitle: 'Usos principales',
        tags: ['Resistente al frío', 'Polinizador', 'Raza mexicana', 'Piel verde lisa'],
    },
    zutano: {
        eyebrow: 'Polinizador Premium',
        title: 'Aguacate Zutano',
        images: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0cOTcbGdhpAEe3o3GaXidm0rSfx0OTe-wEA&s',
        ],
        desc: 'El Zutano es otra variedad de raza mexicana altamente valorada como polinizador en huertos de Hass y otras variedades tipo A. Su vigorous crecimiento y floración tipo B lo hacen ideal para asegurar una polinización cruzada efectiva. La fruta tiene sabor leve y piel verde clara brillante.',
        stats: [
            { label: 'Floración', value: 'Tipo B' },
            { label: 'Crecimiento', value: 'Vigoroso' },
            { label: 'Clima', value: 'Templado-frío' },
        ],
        tagsTitle: 'Función en el huerto',
        tags: ['Polinizador clave', 'Alta rusticidad', 'Crecimiento vigoroso', 'Raza mexicana'],
    },
    reed: {
        eyebrow: 'Consumo Fresco',
        title: 'Aguacate Reed',
        images: [
            'https://stcroperproduction.blob.core.windows.net/uploads-public/images/9x-45dqi-ts6iteki-hnh/lg.webp',
        ],
        desc: 'El Reed es una variedad de fruto grande y redondo, muy apreciada para el consumo en fresco por su sabor rico y suave. Es cosechado en verano y principios de otoño. Aunque menos conocido que el Hass, su pulpa cremosa de alta calidad lo hace competitivo en mercados especializados y ferias de agricultores.',
        stats: [
            { label: 'Peso fruto', value: '400 – 700 g' },
            { label: 'Floración', value: 'Tipo A' },
            { label: 'Cosecha', value: 'Verano-otoño' },
        ],
        tagsTitle: 'Características',
        tags: ['Fruto grande', 'Forma redonda', 'Pulpa cremosa', 'Mercado fresco'],
    },
    pinkerton: {
        eyebrow: 'Alto Rendimiento',
        title: 'Aguacate Pinkerton',
        images: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFlTO7iI6C48XZHtSMdoh8wxbebN_UlRR6gQ&s',
        ],
        desc: 'El Pinkerton es una variedad de alto rendimiento y excelente relación carne-semilla. Su forma alargada y piel gruesa lo hacen muy resistente a daños durante el transporte, siendo muy valorado para exportación. Alto contenido de aceite y sabor rico. Produce en otoño e invierno.',
        stats: [
            { label: 'Aceite', value: 'Alto (>18%)' },
            { label: 'Semilla', value: 'Pequeña' },
            { label: 'Piel', value: 'Gruesa' },
        ],
        tagsTitle: 'Ventajas comerciales',
        tags: ['Alta relación carne/semilla', 'Resistente al transporte', 'Apto exportación', 'Alto aceite'],
    },
    russell: {
        eyebrow: 'Variedad Exótica',
        title: 'Aguacate Russell',
        images: [
            'https://veliyathgarden.com/cdn/shop/files/virallongneckavocadomiamifruit_1138x-eb87f5abdf3042a38ab3c31d600dcaca_1946x.jpg?v=1747213969',
        ],
        desc: 'El Russell es famoso por su forma extremadamente alargada, llegando a medir hasta 50 cm. Es más una rareza botánica que una variedad comercial, aunque tiene un sabor suave y agradable. Se cultiva principalmente en Florida y Hawaii, y es muy atractiva como elemento diferenciador en mercados de nicho y agroturismo.',
        stats: [
            { label: 'Longitud', value: 'Hasta 50 cm' },
            { label: 'Mercado', value: 'Nicho / Local' },
            { label: 'Origen', value: 'Florida, USA' },
        ],
        tagsTitle: 'Características únicas',
        tags: ['Forma alargada extrema', 'Rareza botánica', 'Mercado de nicho', 'Agroturismo'],
    },
    riego: {
        eyebrow: 'Manejo del Agua',
        title: 'Riego en Aguacate',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
        desc: 'El aguacate es altamente sensible al estrés hídrico, tanto por exceso como por déficit. El encharcamiento favorece la Phytophthora cinnamomi, la enfermedad más destructiva del cultivo. Se recomienda riego por goteo con sensores de humedad para mantener el suelo en campo entre 50-75% de la capacidad de campo. Un árbol adulto puede requerir entre 60-80 litros por día en verano.',
        stats: [
            { label: 'Método', value: 'Goteo' },
            { label: 'Frecuencia', value: 'Diaria en verano' },
            { label: 'Vol. adulto', value: '60 – 80 L/día' },
        ],
        tagsTitle: 'Recomendaciones',
        tags: ['Riego por goteo', 'Sensor de humedad', 'Sin encharcamiento', 'Drenaje esencial'],
    },
    fertilizacion: {
        eyebrow: 'Nutrición Vegetal',
        title: 'Fertilización del Aguacate',
        images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
        desc: 'El aguacate es un cultivo exigente en nutrición, especialmente en Nitrógeno, Potasio y Zinc. Se recomienda un análisis foliar anual para ajustar el programa de fertilización. El exceso de Nitrógeno puede favorecer el crecimiento vegetativo en detrimento de la producción. Los micronutrientes como Boro y Zinc son críticos para la cuaja del fruto.',
        stats: [
            { label: 'N clave', value: 'N, K, Zn' },
            { label: 'pH óptimo', value: '5.5 – 6.5' },
            { label: 'Análisis', value: 'Anual' },
        ],
        tagsTitle: 'Nutrientes prioritarios',
        tags: ['Nitrógeno', 'Potasio', 'Zinc', 'Boro', 'Materia orgánica'],
    },
}

export default function AvocadoIndex() {
    const [selectedAvo, setSelectedAvo] = useState<AvoDataItem | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMainImg, setModalMainImg] = useState('')
    const [carouselIndex, setCarouselIndex] = useState(0)
    const trackRef = useRef<HTMLDivElement>(null)

    const openAvoModal = (key: string) => {
        const data = avoData[key]
        if (!data) return
        setSelectedAvo(data)
        setModalMainImg(data.images[0])
        setModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeAvoModal = () => {
        setModalOpen(false)
        setSelectedAvo(null)
        document.body.style.overflow = ''
    }

    const moveCarousel = (dir: number) => {
        const totalItems = 5 // Bacon, Zutano, Reed, Pinkerton, Russell
        let visibleItems = 3
        if (window.innerWidth <= 600) visibleItems = 1
        else if (window.innerWidth <= 900) visibleItems = 2

        const maxIndex = Math.max(0, totalItems - visibleItems)
        setCarouselIndex((prev) => Math.min(Math.max(prev + dir, 0), maxIndex))
    }

    useEffect(() => {
        if (trackRef.current) {
            const card = trackRef.current.querySelector('.avo-carousel-card') as HTMLElement
            if (card) {
                const gap = 20
                const width = card.offsetWidth + gap
                trackRef.current.style.transform = `translateX(-${carouselIndex * width}px)`
            }
        }
    }, [carouselIndex])

    return (
        <div className="avocado-page">
            {/* ── HERO ── */}
            <section className="avo-hero">
                <div className="avo-hero-bg">
                    <img src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=1600" alt="Aguacate" />
                </div>
                <div className="avo-hero-content">
                    <span className="hero-pill"><i className="fas fa-leaf"></i> Guía Técnica</span>
                    <h1>El Arte del<br /><em>Aguacate</em></h1>
                    <p>Variedades, manejo agronómico y recomendaciones clave para una producción eficiente, sostenible y rentable.</p>
                    <div className="hero-ctas">
                        <a href="#variedades" className="btn-avo btn-avo-primary"><i className="fas fa-seedling"></i> Ver Variedades</a>
                        <a href="#cuidados" className="btn-avo btn-avo-outline"><i className="fas fa-chart-bar"></i> Parámetros Técnicos</a>
                    </div>
                </div>
            </section>

            <div className="avo-divider"></div>

            {/* ── MAIN VARIETIES ── */}
            <section className="avo-section" id="variedades">
                <div className="container">
                    <span className="section-label">Variedades Principales</span>
                    <h2 className="section-heading">Aguacates <em>Comerciales</em></h2>
                    <p className="section-sub">Las variedades con mayor impacto en calidad, exportación y producción a escala.</p>

                    <div className="avo-cards-grid">
                        {['hass', 'fuerte', 'gwen'].map((key) => {
                            const data = avoData[key]
                            return (
                                <div key={key} className="avo-card-pro" onClick={() => openAvoModal(key)}>
                                    <div className="avo-card-img">
                                        <img src={data.images[0]} alt={data.title} />
                                        <span className="card-badge">{key === 'hass' ? 'Exportación' : key === 'fuerte' ? 'Híbrido' : 'Premium'}</span>
                                    </div>
                                    <div className="avo-card-body">
                                        <h5>{data.title}</h5>
                                        <p>{key === 'hass' ? 'La variedad más exportada del mundo. Piel rugosa que cambia a morado al madurar.' :
                                            key === 'fuerte' ? 'Híbrido natural entre guatemalteco y mexicano. Producción estable y sabor suave.' :
                                                'Derivada del Hass, fruto más grande y cremoso. Excelente para consumo fresco.'}</p>
                                        <div className="card-meta">
                                            <div className="card-meta-item"><span>Aceite</span><span>{data.stats[0].value}</span></div>
                                            <div className="card-meta-item"><span>Tipo</span><span>{data.stats[2].value}</span></div>
                                        </div>
                                        <button className="card-cta">Explorar variedad <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <div className="avo-divider"></div>

            {/* ── INFO BLOCKS ── */}
            <section className="avo-section avo-info-section">
                <div className="container">
                    <span className="section-label">Contexto Productivo</span>
                    <h2 className="section-heading">Diversidad e <em>Importancia</em></h2>

                    <div className="avo-info-grid">
                        <div className="info-block">
                            <h3>Otras variedades de aguacate</h3>
                            <p>Más allá de las variedades comerciales, existe un amplio espectro de tipos que se adaptan a condiciones específicas de suelo, clima y manejo. Muchas son usadas como portainjertos para mejorar el rendimiento de variedades comerciales, o como polinizadores para optimizar el cuajado del fruto en los huertos mixtos.</p>
                        </div>
                        <div className="info-block">
                            <h3>Importancia en la diversificación</h3>
                            <p>La selección estratégica de variedades complementarias reduce el riesgo productivo ante cambios climáticos, estabiliza la oferta comercial a lo largo del año y mejora la resiliencia del sistema agrícola. La combinación adecuada puede aumentar el rendimiento total del huerto hasta en un 30%.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="avo-divider"></div>

            {/* ── COMPLEMENTARY CAROUSEL ── */}
            <section className="avo-section carousel-section">
                <div className="container">
                    <span className="section-label">Variedades Complementarias</span>
                    <h2 className="section-heading">Más <em>Variedades</em></h2>
                    <p className="section-sub">Empleadas para polinización, portainjertos y diversificación productiva.</p>

                    <div className="avo-track-wrapper" style={{ marginTop: '36px' }}>
                        <div className="avo-track" ref={trackRef}>
                            {['bacon', 'zutano', 'reed', 'pinkerton', 'russell'].map((key) => {
                                const data = avoData[key]
                                return (
                                    <div key={key} className="avo-carousel-card" onClick={() => openAvoModal(key)}>
                                        <div className="avo-carousel-card-img">
                                            <img src={data.images[0]} alt={data.title} />
                                        </div>
                                        <div className="avo-carousel-card-body">
                                            <h4>{data.title}</h4>
                                            <p>{key === 'bacon' ? 'Clima frío · Buena resistencia' :
                                                key === 'zutano' ? 'Polinizador · Alta rusticidad' :
                                                    key === 'reed' ? 'Fruto grande · Consumo fresco' :
                                                        key === 'pinkerton' ? 'Alto rendimiento · Exportación' :
                                                            'Fruto alargado · Mercado local'}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="carousel-nav">
                        <button className="carousel-nav-btn" onClick={() => moveCarousel(-1)}>‹</button>
                        <button className="carousel-nav-btn" onClick={() => moveCarousel(1)}>›</button>
                    </div>
                </div>
            </section>

            <div className="avo-divider"></div>

            {/* ── CARE ── */}
            <section className="avo-section care-section" id="cuidados">
                <div className="container">
                    <span className="section-label">Manejo Agronómico</span>
                    <h2 className="section-heading">Recomendaciones <em>Clave</em></h2>
                    <p className="section-sub">Lineamientos técnicos para una producción eficiente, responsable y sostenible.</p>

                    <div className="care-grid">
                        <div className="care-text">
                            <ul>
                                <li>Manejo responsable del riego: el aguacate es muy sensible al exceso de agua. Mantener el suelo húmedo pero con buen drenaje para evitar Phytophthora.</li>
                                <li>Fertilización balanceada según etapa vegetativa y análisis foliar periódico para ajustar la nutrición.</li>
                                <li>Monitoreo constante de plagas como el barrenador del tronco (<em>Copturus aguacatae</em>) y la mosca del fruto.</li>
                                <li>Poda técnica anual para mejorar la entrada de luz, la aireación del follaje y reducir la carga alternante de producción.</li>
                                <li>Control preventivo de enfermedades fúngicas como la antracnosis, especialmente en épocas lluviosas.</li>
                            </ul>
                        </div>
                        <div>
                            <div className="care-video-wrap" style={{ marginBottom: '20px' }}>
                                <iframe src="https://www.youtube.com/embed/SzhGv-9iK8I" title="Cuidado del Aguacate" allowFullScreen></iframe>
                            </div>
                            <div className="avo-cards-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 0 }}>
                                <div className="info-block" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => openAvoModal('riego')}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Riego</h3>
                                    <p style={{ fontSize: '0.77rem' }}>Técnicas y frecuencias óptimas.</p>
                                </div>
                                <div className="info-block" style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => openAvoModal('fertilizacion')}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Fertilización</h3>
                                    <p style={{ fontSize: '0.77rem' }}>Nutrientes clave por etapa.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="avo-divider"></div>

            {/* ── METRICS ── */}
            <section className="avo-section metrics-section">
                <div className="container">
                    <span className="section-label">Parámetros Técnicos</span>
                    <h2 className="section-heading">Indicadores del <em>Cultivo</em></h2>
                    <p className="section-sub">Rangos agronómicos esenciales para el desarrollo óptimo del aguacate.</p>

                    <div className="metrics-grid">
                        <div className="metric-card">
                            <span className="metric-label">Temperatura</span>
                            <h3>15° – 30°C</h3>
                            <p>Rango térmico ideal para crecimiento vegetativo estable y formación del fruto.</p>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Riego</span>
                            <h3>Controlado</h3>
                            <p>Suelo húmedo con buen drenaje. Evitar encharcamiento y estrés radicular.</p>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Tipo de Suelo</span>
                            <h3>Franco–Arenoso</h3>
                            <p>Bien aireado, buen drenaje y pH ligeramente ácido entre 5.5 y 6.5.</p>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Altitud</span>
                            <h3>1.200 – 2.500 m</h3>
                            <p>Zonas de media y alta montaña que favorecen floración y calidad del fruto.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════
                 AVO MODAL
            ════════════════════ */}
            <div className={`avo-modal-overlay ${modalOpen ? 'open' : ''}`} onClick={closeAvoModal}>
                {selectedAvo && (
                    <div className="avo-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeAvoModal}><i className="fas fa-times"></i></button>

                        <div className="avoModalGallery">
                            {selectedAvo.images.length === 1 ? (
                                <div className="modal-gallery-single">
                                    <img src={selectedAvo.images[0]} alt={selectedAvo.title} />
                                </div>
                            ) : (
                                <div className="modal-gallery">
                                    <div className="modal-gallery-main">
                                        <img src={modalMainImg} alt={selectedAvo.title} />
                                    </div>
                                    {selectedAvo.images.slice(1).map((img, i) => (
                                        <div key={i} className="modal-gallery-thumb" onClick={() => setModalMainImg(img)}>
                                            <img src={img} alt="" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-body-a">
                            <span className="modal-eyebrow">{selectedAvo.eyebrow}</span>
                            <h2 className="modal-title-a">{selectedAvo.title}</h2>
                            <p className="modal-desc-a">{selectedAvo.desc}</p>
                            <div className="modal-stats-grid">
                                {selectedAvo.stats.map((s, i) => (
                                    <div key={i} className="modal-stat">
                                        <span>{s.label}</span>
                                        <span>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="modal-tags-title">{selectedAvo.tagsTitle}</p>
                            <div className="modal-tags">
                                {selectedAvo.tags.map((t, i) => (
                                    <span key={i} className="modal-tag">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
