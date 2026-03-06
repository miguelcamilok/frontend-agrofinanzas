import { useState, useEffect, useRef, useCallback } from 'react'
import { inicioService, type PrecioItem, type PreciosResponse } from '../services/inicioService'
import './InicioIndex.css'

/* ═══ DATOS ═══ */
const CATS = [
  { key: 'prices',          title: 'Elasticidad del precio',        icon: 'fa-tag',                    group: 'Economía'   },
  { key: 'costs',           title: 'Costos de producción',          icon: 'fa-coins',                  group: 'Economía'   },
  { key: 'investment',      title: 'Inversión agrícola por país',   icon: 'fa-chart-line',             group: 'Economía'   },
  { key: 'subsidies',       title: 'Subsidios agrícolas',           icon: 'fa-hand-holding-dollar',    group: 'Economía'   },
  { key: 'agricultural_gdp',title: 'PIB agrícola por país',         icon: 'fa-building-columns',       group: 'Economía'   },
  { key: 'exports',         title: 'Exportaciones por valor ($)',   icon: 'fa-ship',                   group: 'Comercio'   },
  { key: 'imports',         title: 'Importaciones por valor ($)',   icon: 'fa-plane-arrival',          group: 'Comercio'   },
  { key: 'trade_balance',   title: 'Balanza comercial agrícola',    icon: 'fa-scale-balanced',         group: 'Comercio'   },
  { key: 'competitiveness', title: 'Índice de competitividad',      icon: 'fa-trophy',                 group: 'Comercio'   },
  { key: 'market_access',   title: 'Mercados emergentes',           icon: 'fa-globe',                  group: 'Comercio'   },
  { key: 'logistics',       title: 'Rutas comerciales',             icon: 'fa-route',                  group: 'Comercio'   },
  { key: 'tariffs',         title: 'Aranceles internacionales',     icon: 'fa-file-invoice-dollar',    group: 'Comercio'   },
  { key: 'treaties',        title: 'Tratados de libre comercio',    icon: 'fa-handshake',              group: 'Comercio'   },
  { key: 'harvest_area',    title: 'Área cosechada',                icon: 'fa-tractor',                group: 'Producción' },
  { key: 'planted_area',    title: 'Área sembrada',                 icon: 'fa-seedling',               group: 'Producción' },
  { key: 'yield_forecast',  title: 'Rendimiento proyectado',        icon: 'fa-chart-bar',              group: 'Producción' },
  { key: 'future_estimates',title: 'Estimaciones futuras',          icon: 'fa-calendar-days',          group: 'Producción' },
  { key: 'postharvest_losses',title:'Pérdidas postcosecha',         icon: 'fa-triangle-exclamation',   group: 'Producción' },
  { key: 'stock',           title: 'Stock / inventarios',           icon: 'fa-boxes-stacked',          group: 'Producción' },
  { key: 'farmers_count',   title: 'Agricultores dedicados',        icon: 'fa-users',                  group: 'Producción' },
  { key: 'pests_risk',      title: 'Riesgo de plagas por región',   icon: 'fa-bug',                    group: 'Sanidad'    },
  { key: 'diseases',        title: 'Enfermedades reportadas',       icon: 'fa-virus',                  group: 'Sanidad'    },
  { key: 'pest_impact',     title: 'Impacto estimado en producción',icon: 'fa-chart-pie',              group: 'Sanidad'    },
]

const GM: Record<string, { color: string; bg: string; border: string }> = {
  'Economía':   { color: '#D4841A', bg: 'rgba(212,132,26,.09)',   border: 'rgba(212,132,26,.22)'  },
  'Comercio':   { color: '#5B8DB8', bg: 'rgba(91,141,184,.09)',   border: 'rgba(91,141,184,.22)'  },
  'Producción': { color: '#4A7C3F', bg: 'rgba(74,124,63,.09)',    border: 'rgba(74,124,63,.22)'   },
  'Sanidad':    { color: '#A0522D', bg: 'rgba(160,82,45,.09)',    border: 'rgba(160,82,45,.22)'   },
}

const PRECIO_META: Record<string, {
  icon: string; bandColor: string; iconBg: string; iconColor: string
}> = {
  cafe: {
    icon: 'fa-mug-hot',
    bandColor: 'linear-gradient(90deg, #6f3d1e, #c8813a)',
    iconBg:    'linear-gradient(135deg, #7c4a22, #b56b2c)',
    iconColor: '#fde4b8',
  },
  maiz: {
    icon: 'fa-seedling',
    bandColor: 'linear-gradient(90deg, #c8a400, #f0d060)',
    iconBg:    'linear-gradient(135deg, #b89200, #d4aa20)',
    iconColor: '#fffbe0',
  },
  leche: {
    icon: 'fa-droplet',
    bandColor: 'linear-gradient(90deg, #4a7cb8, #8ab5d8)',
    iconBg:    'linear-gradient(135deg, #3a6aaa, #5a90c8)',
    iconColor: '#e0f0ff',
  },
  pollo: {
    icon: 'fa-drumstick-bite',
    bandColor: 'linear-gradient(90deg, #b04010, #e07040)',
    iconBg:    'linear-gradient(135deg, #a03800, #d06030)',
    iconColor: '#ffe8d8',
  },
  papa: {
    icon: 'fa-circle',
    bandColor: 'linear-gradient(90deg, #6b4010, #a87840)',
    iconBg:    'linear-gradient(135deg, #5a3408, #906428)',
    iconColor: '#faecd0',
  },
  carne: {
    icon: 'fa-cow',
    bandColor: 'linear-gradient(90deg, #8c1818, #d05050)',
    iconBg:    'linear-gradient(135deg, #7a1414, #c03838)',
    iconColor: '#ffe0e0',
  },
}

const slides = [
  { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=1600', tag: 'Tecnología',  caption: 'Drones e inteligencia artificial: la nueva frontera del campo colombiano.' },
  { img: 'https://images.unsplash.com/photo-1580570598977-4b2412d01bbc?auto=format&fit=crop&q=80&w=1600', tag: 'Mercados',   caption: 'Tasas de interés y su impacto en los precios de exportación agrícola.' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1600', tag: 'Producción', caption: 'Cosecha Récord en Granos: ¿Qué significa para el mercado colombiano?' },
  { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1600', tag: 'Exportaciones', caption: 'Colombia consolida su posición en el mercado mundial del café especial.' },
]

const newsCards = [
  { img: 'https://images.unsplash.com/photo-1593023333594-487b2f7dd415?auto=format&fit=crop&q=80&w=600',  tag: 'Ganadería',  title: 'Cuidado integral de tu ganado',         desc: 'Cómo garantizar la salud y productividad de tus reses con protocolos veterinarios y manejo de potreros.' },
  { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600',   tag: 'Cultivos',   title: 'Cultivos sanos y productivos',          desc: 'Técnicas modernas y ecológicas para mantener tus siembras resistentes, sin depender de agroquímicos caros.' },
  { img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=600', tag: 'Finanzas',   title: 'Finanzas rurales que sí funcionan',      desc: 'Organiza ingresos, controla gastos y toma decisiones inteligentes para tu emprendimiento del campo.' },
  { img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=600', tag: 'Tecnología', title: 'Riego inteligente para tu finca',        desc: 'Optimiza el agua y mejora la cosecha con sensores de humedad y sistemas de riego automatizado.' },
  { img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=600',   tag: 'Política',   title: 'Guía de Subsidios Agrarios 2025',       desc: 'Todos los programas de apoyo del Gobierno para pequeños y medianos productores del sector rural.' },
  { img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600', tag: 'Sanidad',    title: 'Prevención y control de plagas',        desc: 'Identifica y combate las plagas más comunes antes de que dañen tu producción y cosecha.' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600', tag: 'Mercado',    title: 'Análisis de precios de semillas',       desc: 'Fluctuación en los precios de semillas clave para una siembra rentable esta temporada.' },
  { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600', tag: 'Maquinaria', title: 'Mantenimiento de maquinaria agrícola', desc: 'Consejos esenciales para el cuidado preventivo de tractores y equipos de campo.' },
]

/* ── Helpers ── */
function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n)
}

function VariacionBadge({ v }: { v: number | null }) {
  if (v === null || v === undefined)
    return <span className="precio-var neutral">Sin datos</span>
  const up = v > 0; const eq = v === 0
  return (
    <span className={`precio-var ${eq ? 'neutral' : up ? 'up' : 'down'}`}>
      {!eq && <i className={`fa-solid fa-arrow-trend-${up ? 'up' : 'down'}`}></i>}
      {eq ? 'Sin variación' : `${up ? '+' : ''}${v.toFixed(1)}%`}
    </span>
  )
}

/* ══ PRECIO CARD ══ */
function PrecioCard({ id, item }: { id: string; item: PrecioItem }) {
  const meta = PRECIO_META[id] ?? PRECIO_META['maiz']
  const isCafe = id === 'cafe'
  return (
    <div className="precio-card">
      <div className="precio-card-band" style={{ background: meta.bandColor }} />
      <div className="precio-card-body">
        <div className="precio-card-header">
          <div className="precio-icon-wrap" style={{ background: meta.iconBg }}>
            <i className={`fa-solid ${meta.icon}`} style={{ color: meta.iconColor }}></i>
          </div>
          <div className="precio-title-group">
            <h3 className="precio-nombre">{item.nombre}</h3>
            <span className="precio-unidad">{item.unidad}</span>
          </div>
          {item.en_vivo && (
            <span className="precio-live-badge">
              <span className="live-dot"></span> En vivo
            </span>
          )}
        </div>

        <div className="precio-main-value">
          <span className="precio-amount">{formatCOP(item.precio)}</span>
          <VariacionBadge v={item.variacion} />
        </div>

        {isCafe && item.precio_carga && (
          <div className="precio-extra-row">
            <div className="precio-extra-item">
              <span className="precio-extra-label">Carga 125 kg</span>
              <span className="precio-extra-val">{formatCOP(item.precio_carga)}</span>
            </div>
            {item.bolsa_ny != null && (
              <div className="precio-extra-item">
                <span className="precio-extra-label">Bolsa NY</span>
                <span className="precio-extra-val">{item.bolsa_ny} ¢/lb</span>
              </div>
            )}
            {item.tasa_cambio != null && (
              <div className="precio-extra-item">
                <span className="precio-extra-label">TRM</span>
                <span className="precio-extra-val">{formatCOP(item.tasa_cambio)}</span>
              </div>
            )}
          </div>
        )}

        <div className="precio-footer">
          <i className="fa-solid fa-circle-info"></i>
          <span>{item.fuente}</span>
          {item.fuente_url && (
            <a href={`https://${item.fuente_url}`} target="_blank" rel="noopener noreferrer"
               className="precio-fuente-link" onClick={e => e.stopPropagation()}>
              <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver fuente
            </a>
          )}
        </div>
        <div className="precio-fecha">
          <i className="fa-regular fa-calendar"></i> {item.fecha}
        </div>
      </div>
    </div>
  )
}

/* ══ PRECIOS SECTION ══ */
function PreciosSection() {
  const [precios, setPrecios] = useState<PreciosResponse | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchPrecios = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await inicioService.getPrecios()
      setPrecios(data); setLastUpdated(data.actualizado)
    } catch {
      setError('No se pudieron cargar los precios. Verifica tu conexión e intenta de nuevo.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPrecios() }, [fetchPrecios])

  const precioEntries = precios
    ? (Object.entries(precios.precios) as [string, PrecioItem][])
    : []

  const skeletonBands = [
    'linear-gradient(90deg,#6f3d1e,#c8813a)',
    'linear-gradient(90deg,#c8a400,#f0d060)',
    'linear-gradient(90deg,#4a7cb8,#8ab5d8)',
    'linear-gradient(90deg,#b04010,#e07040)',
    'linear-gradient(90deg,#6b4010,#a87840)',
    'linear-gradient(90deg,#8c1818,#d05050)',
  ]

  return (
    <section className="precios-section">
      <div className="precios-inner">
        {/* Header */}
        <div className="precios-header">
          <div className="precios-title-group">
            <div className="precios-supertag">Mercado Agropecuario Colombiano</div>
            <h2>Precios de <em>Referencia</em></h2>
            <p className="precios-subtitle">
              Precios actualizados del sector. El café proviene en tiempo real de la
              Federación Nacional de Cafeteros; los demás de SIPSA‑DANE, MADR y gremios sectoriales.
            </p>
          </div>
          <div className="precios-controls">
            {lastUpdated && (
              <span className="precios-updated">
                <i className="fa-regular fa-clock"></i>
                Actualizado: {lastUpdated}
              </span>
            )}
            <button className="precios-refresh-btn" onClick={fetchPrecios}
                    disabled={loading} title="Actualizar precios">
              <i className={`fa-solid fa-rotate${loading ? ' fa-spin' : ''}`}></i>
              {loading ? 'Cargando...' : 'Actualizar precios'}
            </button>
          </div>
        </div>

        {error && (
          <div className="precios-error">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{error}</span>
            <button onClick={fetchPrecios}>Reintentar</button>
          </div>
        )}

        {loading && !precios && (
          <div className="precios-skeleton-grid">
            {skeletonBands.map((band, i) => (
              <div className="precio-skeleton" key={i}>
                <div className="skel-band" style={{ background: band }} />
                <div className="skel-body">
                  <div className="skel skel-header"></div>
                  <div className="skel skel-value"></div>
                  <div className="skel skel-footer"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {precios && (
          <div className="precios-grid">
            {precioEntries.map(([id, item]) => (
              <PrecioCard key={id} id={id} item={item} />
            ))}
          </div>
        )}

        <div className="precios-disclaimer">
          <i className="fa-solid fa-shield-halved"></i>
          Precios de referencia informativa. Para operaciones comerciales consulte
          directamente con gremios y fuentes oficiales. Caché renovada cada 6 horas.
        </div>
      </div>
    </section>
  )
}

/* ══ MAIN COMPONENT ══ */
export default function InicioIndex() {
  const [curSlide, setCurSlide] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [modal, setModal] = useState<{ title: string; desc: string; img: string; tag: string } | null>(null)
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [weather, setWeather] = useState<{ temp: string; humidity: string; wind: string; desc: string }>(
    { temp: '--', humidity: '--', wind: '--', desc: '--' }
  )
  const [weatherIcon, setWeatherIcon] = useState('fa-cloud-sun')
  const [searchQuery, setSearchQuery] = useState('')
  const [showGrid, setShowGrid] = useState(false)
  const [activeChip, setActiveChip] = useState('')

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurSlide(p => (p + 1) % slides.length), 5500)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  const goSlide = (n: number) => { setCurSlide((n + slides.length) % slides.length); resetTimer() }

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((_, i) => setRevealed(p => new Set(p).add(i))); return
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Array.from(els).indexOf(e.target)
          setRevealed(p => new Set(p).add(idx)); obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

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

  const filteredCats = searchQuery.trim()
    ? CATS.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.group.toLowerCase().includes(searchQuery.toLowerCase()))
    : CATS

  const groupedCats = CATS.reduce<Record<string, typeof CATS>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c); return acc
  }, {})

  return (
    <div className="inicio-page">

      {/* ══ HERO ══ */}
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
          <div className="hero-emblem">
            <div className="hero-emblem-line"></div>
            <div className="hero-emblem-dot"></div>
            <div className="hero-emblem-line"></div>
          </div>
          <h1>Agro<em>Finanzas</em></h1>
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
            <button key={i} className={`carrusel-dot ${i === curSlide ? 'active' : ''}`}
                    onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`}></button>
          ))}
        </div>
      </div>

      {/* ══ TICKER ══ */}
      <div className={`noticias-banner reveal ${revealed.has(0) ? 'revealed' : ''}`}>
        <div className="banner-inner">
          <div className="banner-badge">
            <i className="fa-solid fa-circle" style={{ fontSize: '.4rem' }}></i> En vivo
          </div>
          <div className="ticker-wrap">
            <div className="ticker">
              <span>
                Café: +3.2% &nbsp;·&nbsp; Maíz: −1.4% &nbsp;·&nbsp; Leche: sin variación &nbsp;·&nbsp;
                Pollo: +0.8% &nbsp;·&nbsp; Nuevos subsidios FINAGRO &nbsp;·&nbsp;
                Alerta sequía: Boyacá y Cundinamarca &nbsp;·&nbsp;
                Café: +3.2% &nbsp;·&nbsp; Maíz: −1.4% &nbsp;·&nbsp;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PRECIOS ══ */}
      <PreciosSection />

      {/* ══ NOTICIAS ══ */}
      <section className="noticias-section">
        <div className={`section-header reveal ${revealed.has(1) ? 'revealed' : ''}`}>
          <div className="section-eyebrow">Artículos &amp; Guías</div>
          <h2 className="section-titulo">Noticias del <em>Campo</em></h2>
        </div>
        <div className="noticias-grid">
          {newsCards.map((card, i) => (
            <article
              className={`noticia-card reveal ${revealed.has(i + 2) ? 'revealed' : ''}`}
              key={i}
              onClick={() => setModal(card)}
            >
              <div className="noticia-img">
                <img src={card.img} alt={card.title} />
                <span className="noticia-tag">{card.tag}</span>
              </div>
              <div className="noticia-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <span className="noticia-link">
                  Leer más <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══ AMIGO GANADERO ══ */}
      <section className="ganadero-section" id="amigo-ganadero">
        <div className="ganadero-inner">
          <div className="ganadero-layout">
            {/* Intro */}
            <div className="ganadero-intro">
              <div className="section-eyebrow">Base de Conocimiento</div>
              <h2 className="section-titulo">Amigo <em>Ganadero</em></h2>
              <p className="section-sub">
                Busca cualquier tema del sector agropecuario y accede a datos
                actualizados: precios, mercados, subsidios, plagas y mucho más.
              </p>
              <div className="gstats">
                <div className="gstat">
                  <span className="gstat-n">23</span>
                  <span className="gstat-l">Categorías</span>
                </div>
                <div className="gstat">
                  <span className="gstat-n">4</span>
                  <span className="gstat-l">Grupos</span>
                </div>
                <div className="gstat">
                  <span className="gstat-n">API</span>
                  <span className="gstat-l">Datos en vivo</span>
                </div>
              </div>
            </div>

            {/* Buscador */}
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
                  <button className="gsearch-clear"
                          onClick={() => { setSearchQuery(''); setShowGrid(false) }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
              <div className="gchips-row">
                <span className="gchip-label">Búsquedas rápidas:</span>
                {[
                  { label: 'Ver todas',    q: ''         },
                  { label: 'Precios',      q: 'precio'   },
                  { label: 'Exportaciones',q: 'exporta'  },
                  { label: 'Subsidios',    q: 'subsidio' },
                  { label: 'Plagas',       q: 'plaga'    },
                  { label: 'Cosecha',      q: 'cosecha'  },
                  { label: 'Mercados',     q: 'mercado'  },
                ].map(chip => (
                  <button
                    key={chip.label}
                    className={`gchip ${activeChip === chip.label ? 'active' : ''}`}
                    onClick={() => {
                      setActiveChip(chip.label)
                      if (chip.q === '') { setSearchQuery(''); setShowGrid(true) }
                      else { setSearchQuery(chip.q); setShowGrid(false) }
                    }}
                  >{chip.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid todas las categorías */}
          {showGrid && !searchQuery && (
            <div className="ganadero-grid" style={{ display: 'grid' }}>
              {Object.entries(groupedCats).map(([group, cats]) => {
                const m = GM[group] || GM['Producción']
                return (
                  <div className="ggroup" key={group}>
                    <h3 className="ggroup-title" style={{ color: m.color }}>
                      <span className="ggroup-dot" style={{ background: m.color }}></span>
                      {group}
                    </h3>
                    <div className="gcards">
                      {cats.map(cat => {
                        const gm = GM[cat.group] || GM['Producción']
                        return (
                          <div
                            className="gcat" key={cat.key}
                            style={{ '--gc': gm.color, '--gb': gm.bg, '--gbr': gm.border } as React.CSSProperties}
                          >
                            <span className="gcat-icon">
                              <i className={`fa-solid ${cat.icon}`}></i>
                            </span>
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

          {/* Resultados búsqueda */}
          {searchQuery && (
            <div className="gsearch-results" style={{ display: 'block', marginTop: 16 }}>
              <div className="gsearch-status">
                {filteredCats.length > 0 ? (
                  <><i className="fa-solid fa-check-circle" style={{ color: '#4A7C3F' }}></i>
                    {' '}<strong>{filteredCats.length}</strong> resultado{filteredCats.length !== 1 ? 's' : ''} para
                    {' '}&ldquo;<strong>{searchQuery}</strong>&rdquo;</>
                ) : (
                  <><i className="fa-solid fa-circle-info"></i>
                    {' '}Sin resultados para &ldquo;<strong>{searchQuery}</strong>&rdquo;</>
                )}
              </div>
              {filteredCats.map(cat => {
                const m = GM[cat.group] || GM['Producción']
                return (
                  <div className="gresult" key={cat.key}>
                    <div className="gresult-hd">
                      <span className="gresult-ico"
                            style={{ color: m.color, background: m.bg, borderColor: m.border }}>
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

          {/* Hint */}
          {!showGrid && !searchQuery && (
            <div className="gsearch-hint">
              <i className="fa-solid fa-seedling"></i>
              <p>Escribe en el buscador o selecciona una búsqueda rápida para explorar las{' '}
                <strong>23 categorías</strong> del sector agropecuario colombiano.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══ MODAL ══ */}
      {modal && (
        <div className="modal-overlay visible" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img className="modal-img" src={modal.img} alt={modal.title} />
            <div className="modal-body">
              <span className="modal-cat">{modal.tag}</span>
              <h2>{modal.title}</h2>
              <p className="modal-resumen">{modal.desc}</p>
              <div className="modal-contenido">
                <p>{modal.desc} En los últimos meses el sector agropecuario colombiano ha
                  evidenciado cambios significativos que impactan la rentabilidad de los productores.
                  Expertos del DANE y del Ministerio de Agricultura destacan la importancia de
                  modernizar las prácticas tradicionales.</p>
                <p>Se recomienda mantenerse informado sobre las fluctuaciones del mercado y
                  aprovechar los programas disponibles a través de FINAGRO y el Banco Agrario de Colombia.</p>
                <p className="modal-fecha">
                  <i className="fa-regular fa-calendar"></i> Publicado el 17 de Febrero, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ WEATHER ══ */}
      <div className={`weather-widget ${weatherOpen ? 'show' : ''}`} onClick={fetchWeather}>
        <div className="weather-icon-wrap">
          <i className={`fa-solid ${weatherIcon}`} style={{ color: '#D4841A' }}></i>
        </div>
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