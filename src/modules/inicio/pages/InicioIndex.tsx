import { useState, useEffect, useRef, useCallback } from 'react'
import { inicioService } from '../services/inicioService'
import './InicioIndex.css'

/* ═══ CATEGORIES DATA ═══ */
const CATS = [
    { key: 'prices', title: 'Elasticidad del precio', icon: 'fa-tag', group: 'Economía' },
    { key: 'costs', title: 'Costos de producción', icon: 'fa-coins', group: 'Economía' },
    { key: 'investment', title: 'Inversión agrícola por país', icon: 'fa-chart-line', group: 'Economía' },
    { key: 'subsidies', title: 'Subsidios agrícolas', icon: 'fa-hand-holding-dollar', group: 'Economía' },
    { key: 'agricultural_gdp', title: 'PIB agrícola por país', icon: 'fa-building-columns', group: 'Economía' },
    { key: 'exports', title: 'Exportaciones por valor ($)', icon: 'fa-ship', group: 'Comercio' },
    { key: 'imports', title: 'Importaciones por valor ($)', icon: 'fa-plane-arrival', group: 'Comercio' },
    { key: 'trade_balance', title: 'Balanza comercial agrícola', icon: 'fa-scale-balanced', group: 'Comercio' },
    { key: 'competitiveness', title: 'Índice de competitividad', icon: 'fa-trophy', group: 'Comercio' },
    { key: 'market_access', title: 'Mercados emergentes', icon: 'fa-globe', group: 'Comercio' },
    { key: 'logistics', title: 'Rutas comerciales', icon: 'fa-route', group: 'Comercio' },
    { key: 'tariffs', title: 'Aranceles internacionales', icon: 'fa-file-invoice-dollar', group: 'Comercio' },
    { key: 'treaties', title: 'Tratados de libre comercio', icon: 'fa-handshake', group: 'Comercio' },
    { key: 'harvest_area', title: 'Área cosechada', icon: 'fa-tractor', group: 'Producción' },
    { key: 'planted_area', title: 'Área sembrada', icon: 'fa-seedling', group: 'Producción' },
    { key: 'yield_forecast', title: 'Rendimiento proyectado', icon: 'fa-chart-bar', group: 'Producción' },
    { key: 'future_estimates', title: 'Estimaciones futuras', icon: 'fa-calendar-days', group: 'Producción' },
    { key: 'postharvest_losses', title: 'Pérdidas postcosecha', icon: 'fa-triangle-exclamation', group: 'Producción' },
    { key: 'stock', title: 'Stock / inventarios', icon: 'fa-boxes-stacked', group: 'Producción' },
    { key: 'farmers_count', title: 'Agricultores dedicados', icon: 'fa-users', group: 'Producción' },
    { key: 'pests_risk', title: 'Riesgo de plagas por región', icon: 'fa-bug', group: 'Sanidad' },
    { key: 'diseases', title: 'Enfermedades reportadas', icon: 'fa-virus', group: 'Sanidad' },
    { key: 'pest_impact', title: 'Impacto estimado en producción', icon: 'fa-chart-pie', group: 'Sanidad' },
]

const GM: Record<string, { color: string; bg: string; border: string }> = {
    'Economía': { color: '#f4c430', bg: 'rgba(244,196,48,.08)', border: 'rgba(244,196,48,.25)' },
    'Comercio': { color: '#60a5fa', bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.25)' },
    'Producción': { color: '#8ac926', bg: 'rgba(138,201,38,.08)', border: 'rgba(138,201,38,.25)' },
    'Sanidad': { color: '#fb7185', bg: 'rgba(251,113,133,.08)', border: 'rgba(251,113,133,.25)' },
}

const slides = [
    { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1600', tag: 'Tecnología', caption: 'Drones e IA: Revolucionando la eficiencia del riego en el campo.' },
    { img: 'https://images.unsplash.com/photo-1580570598977-4b2412d01bbc?auto=format&fit=crop&q=80&w=1600', tag: 'Mercados', caption: 'El impacto de las tasas de interés en los precios de exportación agrícola.' },
    { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600', tag: 'Producción', caption: 'Cosecha Récord en Granos: ¿Qué significa para el mercado colombiano?' },
    { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1600', tag: 'Exportaciones', caption: 'Colombia refuerza su posición en el mercado mundial del café especial.' },
]

const newsCards = [
    { img: 'https://images.unsplash.com/photo-1593023333594-487b2f7dd415?auto=format&fit=crop&q=80&w=600', tag: 'Ganadería', title: 'Cuidado de tus vacas', desc: 'Aprende cómo garantizar la salud y productividad de tu ganado con consejos prácticos y fáciles de aplicar en el día a día.' },
    { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600', tag: 'Cultivos', title: 'Cómo cuidar tus cultivos', desc: 'Técnicas modernas y ecológicas para mantener tus cultivos sanos, productivos y resistentes a plagas.' },
    { img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=600', tag: 'Finanzas', title: 'Mejor manejo de tus finanzas', desc: 'Organiza tus ingresos, controla gastos y toma decisiones financieras inteligentes para tu emprendimiento rural.' },
    { img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=600', tag: 'Tecnología', title: 'Sistemas de Riego Inteligente', desc: 'Optimiza el consumo de agua y mejora la producción con tecnologías de riego controladas por sensores de humedad.' },
    { img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=600', tag: 'Política', title: 'Guía de Subsidios 2025', desc: 'Conoce los nuevos programas de apoyo gubernamental para pequeños y medianos productores del sector agrícola.' },
    { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600', tag: 'Sanidad', title: 'Prevención y Control de Plagas', desc: 'Identifica y combate las plagas más comunes antes de que afecten gravemente tu producción y cosecha.' },
    { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600', tag: 'Mercado', title: 'Análisis de Precios de Semillas', desc: 'Revisa la última fluctuación en los precios de semillas clave para una siembra rentable esta temporada.' },
    { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600', tag: 'Maquinaria', title: 'Mantenimiento de Maquinaria', desc: 'Consejos esenciales para el mantenimiento preventivo de tractores y equipos agrícolas.' },
]

export default function InicioIndex() {
    const [curSlide, setCurSlide] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [revealed, setRevealed] = useState<Set<number>>(new Set())

    /* Modal */
    const [modal, setModal] = useState<{ title: string; desc: string; img: string; tag: string } | null>(null)

    /* Weather */
    const [weatherOpen, setWeatherOpen] = useState(false)
    const [weather, setWeather] = useState<{ temp: string; humidity: string; wind: string; desc: string }>({ temp: '--', humidity: '--', wind: '--', desc: '--' })
    const [weatherIcon, setWeatherIcon] = useState('fa-cloud-sun')

    /* Search */
    const [searchQuery, setSearchQuery] = useState('')
    const [showGrid, setShowGrid] = useState(false)
    const [activeChip, setActiveChip] = useState('')

    /* Carousel */
    const resetTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => setCurSlide(p => (p + 1) % slides.length), 5500)
    }, [])

    useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

    const goSlide = (n: number) => { setCurSlide((n + slides.length) % slides.length); resetTimer() }

    /* Scroll reveal */
    useEffect(() => {
        const els = document.querySelectorAll('.reveal')
        if (!('IntersectionObserver' in window)) { els.forEach((_, i) => setRevealed(p => new Set(p).add(i))); return }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const idx = Array.from(els).indexOf(e.target)
                    setRevealed(p => new Set(p).add(idx))
                    obs.unobserve(e.target)
                }
            })
        }, { threshold: 0.08 })
        els.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    /* Weather */
    const fetchWeather = () => {
        setWeatherOpen(p => !p)
        inicioService.getClima().then(d => {
            setWeather({
                temp: `${d.main.temp} °C`,
                humidity: `${d.main.humidity}%`,
                wind: `${d.wind.speed} m/s`,
                desc: d.weather[0].description,
            })
            const desc = (d.weather[0].description || '').toLowerCase()
            if (desc.includes('clear') || desc.includes('sun')) setWeatherIcon('fa-sun')
            else if (desc.includes('rain') || desc.includes('drizzle')) setWeatherIcon('fa-cloud-showers-heavy')
            else if (desc.includes('cloud')) setWeatherIcon('fa-cloud')
            else setWeatherIcon('fa-cloud-sun')
        }).catch(() => setWeather({ temp: 'Error', humidity: '--', wind: '--', desc: 'Error al obtener clima' }))
    }

    /* Search filter */
    const filteredCats = searchQuery.trim()
        ? CATS.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.group.toLowerCase().includes(searchQuery.toLowerCase()))
        : CATS

    const groupedCats = CATS.reduce<Record<string, typeof CATS>>((acc, c) => {
        if (!acc[c.group]) acc[c.group] = []
        acc[c.group].push(c)
        return acc
    }, {})

    return (
        <div className="inicio-page">
            {/* ══ HERO + CAROUSEL ══ */}
            <div className="hero-principal">
                <div className="carrusel-track">
                    {slides.map((s, i) => (
                        <div className={`carrusel-slide ${i === curSlide ? 'active' : ''}`} key={i}>
                            <img src={s.img} alt={s.tag} />
                            <div className="carrusel-caption">
                                <span className="caption-tag">{s.tag}</span>
                                <h3>{s.caption}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="hero-brand">
                    <div className="hero-leaf"></div>
                    <h1>AgroFinanzas</h1>
                    <p>Decisiones inteligentes para el campo</p>
                </div>
                <button className="carrusel-btn prev" onClick={() => goSlide(curSlide - 1)} aria-label="Anterior">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button className="carrusel-btn next" onClick={() => goSlide(curSlide + 1)} aria-label="Siguiente">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
                <div className="carrusel-dots">
                    {slides.map((_, i) => (
                        <button key={i} className={`carrusel-dot ${i === curSlide ? 'active' : ''}`} onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`}></button>
                    ))}
                </div>
            </div>

            {/* BANNER TICKER */}
            <div className={`noticias-banner reveal ${revealed.has(0) ? 'revealed' : ''}`}>
                <div className="banner-inner">
                    <div className="banner-badge"><i className="fa-solid fa-circle" style={{ fontSize: '.42rem', color: 'var(--green)' }}></i> En vivo</div>
                    <div className="ticker-wrap">
                        <div className="ticker">
                            <span>Café: +3.2% &nbsp;·&nbsp; Maíz: -1.4% &nbsp;·&nbsp; Leche: sin variación &nbsp;·&nbsp; Pollo: +0.8% &nbsp;·&nbsp; Nuevos subsidios FINAGRO &nbsp;·&nbsp; Alerta seca: Boyacá y Cundinamarca &nbsp;·&nbsp; Café: +3.2% &nbsp;·&nbsp; Maíz: -1.4% &nbsp;·&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NOTICIAS */}
            <section className="noticias-section">
                <div className={`section-header reveal ${revealed.has(1) ? 'revealed' : ''}`}>
                    <span className="section-tag">Artículos</span>
                    <h2 className="section-title">Noticias del <em>Campo</em></h2>
                </div>
                <div className="noticias-grid">
                    {newsCards.map((card, i) => (
                        <article className={`noticia-card reveal ${revealed.has(i + 2) ? 'revealed' : ''}`} key={i} onClick={() => setModal(card)}>
                            <div className="noticia-img">
                                <img src={card.img} alt={card.title} />
                                <span className="noticia-tag">{card.tag}</span>
                            </div>
                            <div className="noticia-body">
                                <h3>{card.title}</h3>
                                <p>{card.desc}</p>
                                <span className="noticia-link">Leer más <i className="fa-solid fa-arrow-right"></i></span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* AMIGO GANADERO */}
            <section className="ganadero-section" id="amigo-ganadero">
                <div className="ganadero-layout">
                    <div className="ganadero-intro">
                        <span className="section-tag">Base de Conocimiento</span>
                        <h2 className="section-title">Amigo <em>Ganadero</em></h2>
                        <p className="section-sub">Busca cualquier tema del sector agropecuario y accede a datos actualizados: precios, mercados, subsidios, plagas y más.</p>
                        <div className="gstats">
                            <div className="gstat"><span className="gstat-n">23</span><span className="gstat-l">Categorías</span></div>
                            <div className="gstat"><span className="gstat-n">4</span><span className="gstat-l">Grupos</span></div>
                            <div className="gstat"><span className="gstat-n">API</span><span className="gstat-l">Datos en vivo</span></div>
                        </div>
                    </div>
                    <div className="gsearch-box">
                        <div className="gsearch-row">
                            <i className="fa-solid fa-magnifying-glass gsearch-ico"></i>
                            <input
                                type="text"
                                className="gsearch-input"
                                placeholder="Ej: subsidios, exportaciones, plagas..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setShowGrid(false) }}
                                autoComplete="off"
                            />
                            {searchQuery && (
                                <button className="gsearch-clear" onClick={() => { setSearchQuery(''); setShowGrid(false) }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>
                        <div className="gchips-row">
                            <span className="gchip-label">Búsquedas rápidas:</span>
                            {[
                                { label: 'Ver todas', q: '' },
                                { label: 'Precios', q: 'precio' },
                                { label: 'Exportaciones', q: 'exporta' },
                                { label: 'Subsidios', q: 'subsidio' },
                                { label: 'Plagas', q: 'plaga' },
                                { label: 'Cosecha', q: 'cosecha' },
                                { label: 'Mercados', q: 'mercado' },
                            ].map(chip => (
                                <button
                                    key={chip.label}
                                    className={`gchip ${activeChip === chip.label ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveChip(chip.label)
                                        if (chip.q === '') { setSearchQuery(''); setShowGrid(true) }
                                        else { setSearchQuery(chip.q); setShowGrid(false) }
                                    }}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid or search results */}
                {showGrid && !searchQuery && (
                    <div className="ganadero-grid" style={{ display: 'grid' }}>
                        {Object.entries(groupedCats).map(([group, cats]) => {
                            const m = GM[group] || GM['Producción']
                            return (
                                <div className="ggroup" key={group}>
                                    <h3 className="ggroup-title" style={{ color: m.color }}>
                                        <span className="ggroup-dot" style={{ background: m.color }}></span>{group}
                                    </h3>
                                    <div className="gcards">
                                        {cats.map(cat => {
                                            const gm = GM[cat.group] || GM['Producción']
                                            return (
                                                <div className="gcat" key={cat.key} style={{ '--gc': gm.color, '--gb': gm.bg, '--gbr': gm.border } as React.CSSProperties}>
                                                    <span className="gcat-icon"><i className={`fa-solid ${cat.icon}`}></i></span>
                                                    <span className="gcat-title">{cat.title}</span>
                                                    <i className="fa-solid fa-chevron-right gcat-arrow"></i>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {searchQuery && (
                    <div className="gsearch-results" style={{ display: 'block', marginTop: 16 }}>
                        <div className="gsearch-status">
                            {filteredCats.length > 0 ? (
                                <><i className="fa-solid fa-check-circle" style={{ color: '#8ac926' }}></i> <strong>{filteredCats.length}</strong> resultado{filteredCats.length !== 1 ? 's' : ''} para &quot;<strong>{searchQuery}</strong>&quot;</>
                            ) : (
                                <><i className="fa-solid fa-circle-info"></i> Sin resultados para &quot;<strong>{searchQuery}</strong>&quot;</>
                            )}
                        </div>
                        {filteredCats.map(cat => {
                            const m = GM[cat.group] || GM['Producción']
                            return (
                                <div className="gresult" key={cat.key}>
                                    <div className="gresult-hd">
                                        <span className="gresult-ico" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
                                            <i className={`fa-solid ${cat.icon}`}></i>
                                        </span>
                                        <div className="gresult-info">
                                            <span className="gresult-ttl">{cat.title}</span>
                                            <span className="gresult-grp" style={{ color: m.color }}>{cat.group}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {!showGrid && !searchQuery && (
                    <div className="gsearch-hint">
                        <i className="fa-solid fa-seedling"></i>
                        <p>Escribe en el buscador o selecciona una búsqueda rápida para explorar las <strong>23 categorías</strong> del sector agropecuario colombiano.</p>
                    </div>
                )}
            </section>

            {/* MODAL */}
            {modal && (
                <div className="modal-overlay visible" onClick={() => setModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setModal(null)}><i className="fa-solid fa-xmark"></i></button>
                        <img className="modal-img" src={modal.img} alt={modal.title} />
                        <div className="modal-body">
                            <span className="modal-cat">{modal.tag}</span>
                            <h2>{modal.title}</h2>
                            <p className="modal-resumen">{modal.desc}</p>
                            <div className="modal-contenido">
                                <p>{modal.desc} En los últimos meses el sector agropecuario colombiano ha evidenciado cambios significativos que impactan directamente la rentabilidad de los productores. Los expertos del DANE y del Ministerio de Agricultura destacan la importancia de modernizar las prácticas tradicionales.</p>
                                <p>Se recomienda mantenerse informado sobre las fluctuaciones del mercado y aprovechar los programas disponibles a través de FINAGRO y el Banco Agrario de Colombia.</p>
                                <p className="modal-fecha"><i className="fa-regular fa-calendar"></i> Publicado el 17 de Febrero, 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WEATHER WIDGET */}
            <div className={`weather-widget ${weatherOpen ? 'show' : ''}`} onClick={fetchWeather}>
                <div className="weather-icon-wrap"><i className={`fa-solid ${weatherIcon}`} style={{ color: '#f4c430' }}></i></div>
                <div className="weather-tooltip">
                    <h4>Clima Actual</h4>
                    <hr />
                    <p><i className="fa-solid fa-location-dot"></i> Bogotá, Colombia</p>
                    <p><i className="fa-solid fa-temperature-half"></i> Temperatura: {weather.temp}</p>
                    <p><i className="fa-solid fa-droplet"></i> Humedad: {weather.humidity}</p>
                    <p><i className="fa-solid fa-wind"></i> Viento: {weather.wind}</p>
                    <p><i className="fa-solid fa-magnifying-glass"></i> {weather.desc}</p>
                </div>
            </div>
        </div>
    )
}
