import { useState, useEffect } from 'react'
import './Coffe.css'

interface CoffeeDataItem {
    eyebrow: string
    title: string
    img: string
    desc: string
    stats: { label: string; value: string }[]
    tagsTitle: string
    tags: string[]
}

const coffeeData: Record<string, CoffeeDataItem> = {
    arabica: {
        eyebrow: 'Variedad Premium',
        title: 'Café Arábica',
        img: 'https://cafeyciencia.com/wp-content/uploads/2018/02/2018-02-01-4.png',
        desc: 'Coffea arabica es la especie de mayor valor comercial y la más consumida en el mundo. Originaria de las tierras altas de Etiopía, se cultiva principalmente entre 1.200 y 2.200 msnm. Su grano contiene menos cafeína que el Robusta, lo que contribuye a su sabor suave y dulce con notas de frutas, flores y chocolate.',
        stats: [
            { label: 'Cafeína', value: '~1.5%' },
            { label: 'Altitud', value: '1.200 – 2.200 m' },
            { label: 'Acidez', value: 'Alta a Media' },
        ],
        tagsTitle: 'Características del perfil',
        tags: ['Dulce', 'Aromático', 'Frutal', 'Floral', 'Suave', 'Complejo'],
    },
    robusta: {
        eyebrow: 'Alto Contenido de Cafeína',
        title: 'Café Robusta',
        img: 'https://perfectdailygrind.com/wp-content/uploads/2020/06/Fine-Robusta-Brazil-2.jpg',
        desc: 'Coffea canephora (Robusta) es más resistente a plagas y enfermedades que el Arábica, y produce mejor en altitudes bajas. Contiene casi el doble de cafeína, lo que le da mayor amargura y cuerpo. Es fundamental en mezclas de espresso y en la producción de café instantáneo por su crema densa.',
        stats: [
            { label: 'Cafeína', value: '2.5 – 4.5%' },
            { label: 'Altitud', value: '0 – 1.000 m' },
            { label: 'Cuerpo', value: 'Muy Alto' },
        ],
        tagsTitle: 'Características del perfil',
        tags: ['Fuerte', 'Amargo', 'Terroso', 'Mucho Cuerpo', 'Crema densa'],
    },
    liberica: {
        eyebrow: 'Variedad Exótica',
        title: 'Café Liberica',
        img: 'https://api.globy.com/public/market/66ba04c4104aa800965833bd/photos/66ba04c4104aa800965833c4/66ba04c4104aa800965833c4_lg.webp',
        desc: 'Coffea liberica es una especie poco comercial pero muy apreciada por los conocedores. Nativa de África Occidental, produce granos asimétricos más grandes que el Arábica. Su perfil de sabor es único: notas ahumadas, maderosas y afrutadas con una acidez media y un aroma muy distintivo.',
        stats: [
            { label: 'Cafeína', value: 'Media-Baja' },
            { label: 'Origen', value: 'África Occidental' },
            { label: 'Producción', value: 'Muy Limitada' },
        ],
        tagsTitle: 'Características del perfil',
        tags: ['Ahumado', 'Maderoso', 'Floral', 'Exótico', 'Afrutado'],
    },
    natural: {
        eyebrow: 'Proceso de Beneficio',
        title: 'Proceso Natural',
        img: 'https://ineffablecoffee.com/cdn/shop/articles/blog-ineffable-coffee-proceso-natural-featured_31acac96-c706-44cf-a0a5-6d4bd77e8826.jpg?v=1759146546&width=2048',
        desc: 'El proceso natural (o seco) es el más antiguo. El fruto entero con su cereza se seca directamente al sol por 3 a 6 semanas. El grano absorbe los azúcares y aromas de la pulpa durante el secado, generando un perfil de sabor intensamente frutal, dulce y con mucho cuerpo.',
        stats: [
            { label: 'Dulzor', value: 'Muy Alto' },
            { label: 'Cuerpo', value: 'Alto' },
            { label: 'Acidez', value: 'Baja' },
        ],
        tagsTitle: 'Notas de cata típicas',
        tags: ['Arándano', 'Mango', 'Vino', 'Miel', 'Chocolate negro'],
    },
    honey: {
        eyebrow: 'Proceso de Beneficio',
        title: 'Proceso Honey',
        img: 'https://www.cafebritt.com/cdn/shop/articles/blog-honey-processed-coffee_bd5d2a8a-c490-4e49-94a9-95cc3abe69a2.webp?v=1752698091',
        desc: 'En el proceso honey se retira la pulpa exterior pero se deja parte del mucílago (la capa pegajosa) en el grano durante el secado. Según la cantidad de mucílago que permanece, el proceso se clasifica en Yellow, Red o Black Honey. El resultado es un café con mayor dulzor que el lavado y más limpieza que el natural.',
        stats: [
            { label: 'Dulzor', value: 'Alto' },
            { label: 'Cuerpo', value: 'Medio-Alto' },
            { label: 'Acidez', value: 'Media' },
        ],
        tagsTitle: 'Notas de cata típicas',
        tags: ['Durazno', 'Caramelo', 'Miel', 'Albaricoque', 'Flores'],
    },
    lavado: {
        eyebrow: 'Proceso de Beneficio',
        title: 'Proceso Lavado',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6asjCz-Kgp-WeyY4Uif7RCWzsKGo_cgbSbA&s',
        desc: 'El proceso lavado o húmedo elimina completamente el mucílago antes del secado mediante fermentación y lavado con agua. Esto produce un café de taza limpia donde el perfil del grano y el terroir se expresan con mayor claridad. Es el método preferido para cafés de especialidad de alta acidez.',
        stats: [
            { label: 'Dulzor', value: 'Medio' },
            { label: 'Limpieza', value: 'Muy Alta' },
            { label: 'Acidez', value: 'Alta y Brillante' },
        ],
        tagsTitle: 'Notas de cata típicas',
        tags: ['Cítrico', 'Limón', 'Té negro', 'Floral', 'Limpio'],
    },
    selectiva: {
        eyebrow: 'Método Premium',
        title: 'Cosecha Selectiva',
        img: 'https://perfectdailygrind.com/es/wp-content/uploads/sites/2/2021/01/Recoleccion-Selectiva-1.jpg',
        desc: 'La cosecha selectiva (picking) es la técnica más costosa y laboriosa, pero produce el café de mayor calidad. Los recolectores recogen únicamente los frutos de color rojo perfectamente maduros, pasando varias veces por la misma planta para ir cosechando a medida que maduran.',
        stats: [
            { label: 'Calidad', value: 'Muy Alta' },
            { label: 'Uniformidad', value: 'Excelente' },
            { label: 'Costo', value: 'Alto' },
        ],
        tagsTitle: 'Ventajas clave',
        tags: ['Solo frutos maduros', 'Homogeneidad total', 'Mejor precio comercial', 'Menos defectos'],
    },
    barrido: {
        eyebrow: 'Método Rápido',
        title: 'Recolección por Barrido',
        img: 'https://www.eje21.com.co/site/wp-content/uploads/2020/07/recolector-de-cafe.-imagen-gobernacion-de-caldas..jpg',
        desc: 'La recolección por barrido (stripping) consiste en desgranar toda la rama de una sola pasada, recogiendo frutos en distintos estados de madurez. Es significativamente más rápido y económico que la cosecha selectiva.',
        stats: [
            { label: 'Velocidad', value: 'Alta' },
            { label: 'Uniformidad', value: 'Media' },
            { label: 'Costo', value: 'Bajo' },
        ],
        tagsTitle: 'Consideraciones',
        tags: ['Rápido', 'Económico', 'Mezcla de madurez', 'Requiere clasificación posterior'],
    },
    mecanica: {
        eyebrow: 'Método Industrial',
        title: 'Cosecha Mecánica',
        img: 'https://www.mundocafeto.com/wp-content/uploads/2018/06/1-Recolecci%C3%B3n-mec%C3%A1nica-de-caf%C3%A9-1.jpg',
        desc: 'La cosecha mecánica utiliza máquinas derribadoras o vibradoras que golpean el tronco o las ramas para desprender los frutos. Solo es viable en terrenos con pendiente baja (menor al 10%) y cultivos de alta densidad.',
        stats: [
            { label: 'Escala', value: 'Industrial' },
            { label: 'Eficiencia', value: 'Máxima' },
            { label: 'Terreno', value: 'Plano (< 10%)' },
        ],
        tagsTitle: 'Aplicación típica',
        tags: ['Brasil', 'Grandes fincas', 'Muy eficiente'],
    }
}

const carouselSlides = [
    {
        title: 'Tipos de Café',
        text: 'Arábica suave, Robusta intenso, Liberica exótico — cada variedad cuenta una historia de sabor única.',
        btnText: 'Ver variedades',
        link: '#tiposCafe',
        img: 'https://cafe1820.com/wp-content/uploads/2020/02/preview-lightbox-%C2%BFCu%C3%A1les-son-los-tipos-de-caf%C3%A9-m%C3%A1s-populares-en-el-mundo.jpg'
    },
    {
        title: 'El Viaje del Grano',
        text: 'Del cerezo al tostado final — cada etapa transforma el grano y define el carácter de tu taza.',
        btnText: 'Ver proceso',
        link: '#procesoCafe',
        img: 'https://perfectdailygrind.com/es/wp-content/uploads/sites/2/2022/03/image7-4.png'
    },
    {
        title: 'Técnicas de Cosecha',
        text: 'Selectiva, por barrido o mecánica — el método de recolección impacta directamente la calidad del grano.',
        btnText: 'Ver métodos',
        link: '#metodosCosecha',
        img: 'https://perfectdailygrind.com/es/wp-content/uploads/sites/2/2019/11/@fincaelreposo-3.jpg'
    },
    {
        title: 'Actualidad Cafetera',
        text: 'Mantente al día con noticias, precios y tendencias del mundo del café a nivel global.',
        btnText: 'Ir a noticias',
        link: '#noticiasCafe',
        img: 'https://png.pngtree.com/background/20250125/original/pngtree-cup-of-coffee-with-mist-laptop-coffee-leaf-at-breakfast-picture-image_15539570.jpg'
    }
]

export default function CoffeIndex() {
    const [activeSlide, setActiveSlide] = useState(0)
    const [selectedCoffee, setSelectedCoffee] = useState<CoffeeDataItem | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [noticias] = useState([
        {
            title: 'Precios del Café en Mercado de Nueva York',
            description: 'La cotización del grano sigue al alza tras preocupaciones climáticas en Brasil.',
            url: 'https://www.agronet.gov.co',
            urlToImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600'
        },
        {
            title: 'Avances en Caficultura Sostenible',
            description: 'Nuevas técnicas de fertilización orgánica reducen costos y mejoran la calidad de taza.',
            url: 'https://www.federaciondecafeteros.org',
            urlToImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'
        },
        {
            title: 'Tendencias: El auge de los Coffee Bars',
            description: 'El mercado asiático se convierte en el motor de crecimiento para el café de especialidad.',
            url: 'https://perfectdailygrind.com',
            urlToImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600'
        }
    ])

    const nextSlide = () => setActiveSlide((prev) => (prev + 1) % carouselSlides.length)
    const prevSlide = () => setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)

    const openModal = (key: string) => {
        const data = coffeeData[key]
        if (!data) return
        setSelectedCoffee(data)
        setModalOpen(true)
        document.body.style.overflow = 'hidden'
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedCoffee(null)
        document.body.style.overflow = ''
    }

    // Auto carousel
    useEffect(() => {
        const timer = setInterval(nextSlide, 7000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="coffee-page">
            {/* ── HERO ── */}
            <section className="coffee-hero">
                <div className="coffee-hero-bg">
                    <img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600" alt="Café" />
                </div>
                <div className="coffee-hero-content">
                    <span className="hero-eyebrow"><i className="fas fa-coffee"></i> &nbsp; AgroFinanzas</span>
                    <h1>Cuidado y Manejo<br />del <em>Café</em></h1>
                    <p>Desde el cultivo del cerezo hasta la taza perfecta — conoce las variedades, procesos y técnicas que definen el café de calidad.</p>
                    <div className="hero-scroll-indicator">
                        <span>Explorar</span>
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </div>
            </section>

            {/* ── CAROUSEL (REACT SLIDER) ── */}
            <section className="coffee-slider-section" id="slider">
                <div className="container">
                    <div className="cafe-carousel-wrap">
                        <div className="carousel-nav-arrow prev" onClick={prevSlide}><i className="fas fa-chevron-left"></i></div>
                        <div className="carousel-nav-arrow next" onClick={nextSlide}><i className="fas fa-chevron-right"></i></div>

                        <div className="carousel-inner">
                            <div className="carousel-item-inner">
                                <div className="carousel-item-img">
                                    <img src={carouselSlides[activeSlide].img} alt={carouselSlides[activeSlide].title} />
                                </div>
                                <div className="carousel-item-text">
                                    <h2>{carouselSlides[activeSlide].title}</h2>
                                    <p>{carouselSlides[activeSlide].text}</p>
                                    <a href={carouselSlides[activeSlide].link} className="cafe-btn">
                                        <i className="fas fa-arrow-down"></i> {carouselSlides[activeSlide].btnText}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="carousel-indicators-dots">
                            {carouselSlides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`carousel-indicator-dot ${i === activeSlide ? 'active' : ''}`}
                                    onClick={() => setActiveSlide(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="coffee-divider"></div>

            {/* ── VARIETIES ── */}
            <section className="varieties-section" id="tiposCafe">
                <div className="container">
                    <span className="section-label">Variedades</span>
                    <h2 className="section-heading">Principales <em>Especies</em></h2>
                    <p className="section-sub">Cada variedad tiene un perfil único de sabor, cafeína y adaptación climática.</p>

                    <div className="coffee-cards-grid">
                        {['arabica', 'robusta', 'liberica'].map((key) => {
                            const data = coffeeData[key]
                            return (
                                <div key={key} className="coffee-card-pro" onClick={() => openModal(key)}>
                                    <div className="card-img-wrap">
                                        <img src={data.img} alt={data.title} />
                                        <span className="card-badge">{key === 'arabica' ? 'Alta Calidad' : key === 'robusta' ? 'Alta Cafeína' : 'Exótico'}</span>
                                    </div>
                                    <div className="card-body-pro">
                                        <h5>{data.title}</h5>
                                        <p>{key === 'arabica' ? 'El café más apreciado a nivel mundial. Sabor suave, aromático y complejo.' :
                                            key === 'robusta' ? 'Cuerpo intenso, amargo y terroso. Ideal para espresso y café instantáneo.' :
                                                'Opción poco común, muy apreciada por su perfil ahumado y frutal único.'}</p>
                                        <div className="card-stats">
                                            <div className="card-stat"><span>Cafeína</span><span>{data.stats[0].value}</span></div>
                                            <div className="card-stat"><span>Perfil</span><span>{data.stats[2].value}</span></div>
                                        </div>
                                        <button className="card-open-btn">Ver detalles <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <div className="coffee-divider"></div>

            {/* ── PROCESS ── */}
            <section className="process-section" id="procesoCafe">
                <div className="container">
                    <span className="section-label">Proceso</span>
                    <h2 className="section-heading">Del Cerezo<br /><em>a la Taza</em></h2>
                    <p className="section-sub">Cada paso del procesado transforma el grano y construye el sabor final.</p>

                    <div className="process-layout">
                        <div className="process-side">
                            <ul className="timeline-pro">
                                <li>
                                    <div className="tl-dot"><i className="fas fa-seedling"></i></div>
                                    <div className="tl-body">
                                        <strong>Cultivo & Recolección</strong>
                                        <p>La cereza madura es cosechada manualmente o con maquinaria según el sistema productivo.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot"><i className="fas fa-cogs"></i></div>
                                    <div className="tl-body">
                                        <strong>Beneficio (Despulpado)</strong>
                                        <p>Se retira la pulpa exterior para exponer el grano y comenzar el desarrollo de aromas.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot"><i className="fas fa-water"></i></div>
                                    <div className="tl-body">
                                        <strong>Fermentación & Lavado</strong>
                                        <p>Proceso clave para desarrollar los precursores aromáticos y la acidez característica.</p>
                                    </div>
                                </li>
                                <li>
                                    <div className="tl-dot"><i className="fas fa-sun"></i></div>
                                    <div className="tl-body">
                                        <strong>Secado</strong>
                                        <p>Se reduce la humedad del grano al 10–12% para garantizar su conservación.</p>
                                    </div>
                                </li>
                            </ul>
                            <div className="process-img-wrap" style={{ marginTop: '20px' }}>
                                <iframe src="https://www.youtube.com/embed/aQtn0_QSzfI" title="Proceso del café" allowFullScreen></iframe>
                            </div>
                        </div>

                        <div className="process-side">
                            <div className="process-img-wrap">
                                <img src="https://cafearabo.com/wp-content/uploads/2021/04/blends-scaled.jpg" alt="Proceso café" />
                            </div>
                            <div className="benefit-cards-grid">
                                <div className="benefit-card" onClick={() => openModal('natural')}>
                                    <div className="benefit-card-icon"><i className="fas fa-leaf"></i></div>
                                    <h5>Natural</h5>
                                    <p>Perfil muy afrutado y dulce.</p>
                                </div>
                                <div className="benefit-card" onClick={() => openModal('honey')}>
                                    <div className="benefit-card-icon"><i className="fas fa-star"></i></div>
                                    <h5>Honey</h5>
                                    <p>Balance dulzor y limpieza.</p>
                                </div>
                                <div className="benefit-card" onClick={() => openModal('lavado')}>
                                    <div className="benefit-card-icon"><i className="fas fa-tint"></i></div>
                                    <h5>Lavado</h5>
                                    <p>Sabor limpio y ácido.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="coffee-divider"></div>

            {/* ── HARVEST ── */}
            <section className="harvest-section" id="metodosCosecha">
                <div className="container">
                    <span className="section-label">Cosecha</span>
                    <h2 className="section-heading">Métodos de <em>Recolección</em></h2>
                    <p className="section-sub">El método de cosecha determina la uniformidad y la calidad del lote final.</p>

                    <div className="coffee-cards-grid">
                        {['selectiva', 'barrido', 'mecanica'].map((key) => {
                            const data = coffeeData[key]
                            return (
                                <div key={key} className="coffee-card-pro" onClick={() => openModal(key)}>
                                    <div className="card-img-wrap">
                                        <img src={data.img} alt={data.title} />
                                        <span className="card-badge">{key === 'selectiva' ? 'Premium' : key === 'barrido' ? 'Rápido' : 'Industrial'}</span>
                                    </div>
                                    <div className="card-body-pro">
                                        <h5>{data.title}</h5>
                                        <p>{key === 'selectiva' ? 'Solo frutos maduros a mano. Máxima calidad y homogeneidad del lote.' :
                                            key === 'barrido' ? 'Todos los frutos de una vez. Más eficiente pero menos uniforme.' :
                                                'Máquinas vibradoras en terrenos planos. Alta eficiencia industrial.'}</p>
                                        <div className="card-stats">
                                            <div className="card-stat"><span>Tipo</span><span>{data.stats[0].value}</span></div>
                                            <div className="card-stat"><span>Calidad</span><span>{data.stats[1].value}</span></div>
                                        </div>
                                        <button className="card-open-btn">Ver detalles <i className="fas fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <div className="coffee-divider"></div>

            {/* ── NEWS ── */}
            <section className="news-section" id="noticiasCafe">
                <div className="container">
                    <span className="section-label">Actualidad</span>
                    <h2 className="section-heading">Noticias del<br /><em>Mundo Cafetero</em></h2>
                    <p className="section-sub">Últimas tendencias, precios y novedades del sector caficultor.</p>

                    <div className="news-cards-grid">
                        {noticias.map((noticia, i) => (
                            <div key={i} className="news-card-pro">
                                <div className="news-card-img">
                                    <img src={noticia.urlToImage} alt={noticia.title} />
                                </div>
                                <div className="news-card-body">
                                    <h5>{noticia.title}</h5>
                                    <p>{noticia.description}</p>
                                    <a href={noticia.url} target="_blank" rel="noreferrer" className="news-link">Leer artículo <i className="fas fa-external-link-alt"></i></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════
                 COFFEE MODAL
            ════════════════════════ */}
            <div className={`coffee-modal-overlay ${modalOpen ? 'open' : ''}`} onClick={closeModal}>
                {selectedCoffee && (
                    <div className="coffee-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
                        <img className="modal-hero-img" src={selectedCoffee.img} alt={selectedCoffee.title} />
                        <div className="modal-body-content">
                            <span className="modal-eyebrow">{selectedCoffee.eyebrow}</span>
                            <h2 className="modal-title">{selectedCoffee.title}</h2>
                            <p className="modal-desc">{selectedCoffee.desc}</p>
                            <div className="modal-stats-grid">
                                {selectedCoffee.stats.map((s, i) => (
                                    <div key={i} className="modal-stat">
                                        <span>{s.label}</span>
                                        <span>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                            <h4 className="modal-section-title">{selectedCoffee.tagsTitle}</h4>
                            <div className="modal-tags">
                                {selectedCoffee.tags.map((t, i) => (
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
