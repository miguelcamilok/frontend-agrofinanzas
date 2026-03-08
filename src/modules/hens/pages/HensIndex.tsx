import { useState, useEffect, useRef } from 'react'
import './HensIndex.css'

/* ══ TABS ══════════════════════════════════════════════════════ */
const TABS = [
    { key: 'general',       label: 'General',       icon: 'fa-feather-alt' },
    { key: 'razas',         label: 'Razas',         icon: 'fa-list-ul' },
    { key: 'alimentacion',  label: 'Alimentación',  icon: 'fa-wheat-awn' },
    { key: 'sanidad',       label: 'Sanidad',       icon: 'fa-syringe' },
    { key: 'instalaciones', label: 'Instalaciones', icon: 'fa-home' },
    { key: 'economia',      label: 'Economía',      icon: 'fa-coins' },
]

/* ══ COMPONENT ══════════════════════════════════════════════════ */
export default function HensIndex() {
    const [activeTab, setActiveTab] = useState('general')
    const [showScroll, setShowScroll] = useState(false)
    const [lightbox, setLightbox] = useState<string | null>(null)
    const heroBgRef = useRef<HTMLDivElement>(null)

    /* Parallax hero */
    useEffect(() => {
        const onScroll = () => {
            const el = heroBgRef.current
            if (el) {
                const s = window.scrollY
                el.style.opacity   = String(Math.max(0.12, 1 - s / 420))
                el.style.transform = `translateY(${s * 0.15}px)`
            }
            setShowScroll(window.scrollY > 320)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* Fade-up observer */
    useEffect(() => {
        const io = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
            { threshold: 0.08 }
        )
        document.querySelectorAll('.fade-up').forEach(el => io.observe(el))
        return () => io.disconnect()
    }, [activeTab])

    /* Lightbox escape */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    const SecLabel = ({ text }: { text: string }) => (
        <div className="sec-label">
            <span className="sec-label__text">{text}</span>
            <span className="sec-label__line" />
        </div>
    )

    return (
        <div className="hens-page">

            {/* ════ SCROLL TOP ════ */}
            {showScroll && (
                <button className="hen-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <i className="fas fa-arrow-up"></i>
                </button>
            )}

            {/* ════ LIGHTBOX ════ */}
            {lightbox && (
                <div className="hen-lightbox" onClick={() => setLightbox(null)}>
                    <button className="hen-lightbox__close" onClick={() => setLightbox(null)}>×</button>
                    <img src={lightbox} alt="Ampliada" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* ════ HERO ════ */}
            <div className="hen-hero">
                <div className="hen-hero__bg" ref={heroBgRef}></div>

                <div className="hen-hero__inner">
                    <div className="hen-hero__left">
                        <div className="hen-hero__eyebrow">
                            <i className="fas fa-egg"></i> Módulo de Avicultura
                        </div>
                        <h1 className="hen-hero__title">
                            Aves de<br /><em>Corral</em>
                        </h1>
                        <p className="hen-hero__sub">
                            Guía técnica completa para la producción avícola en pequeña y mediana escala en Colombia
                        </p>

                        <div className="hen-hero__stats">
                            <div className="hero-stat">
                                <span className="hero-stat__num">300</span>
                                <span className="hero-stat__lbl">Huevos / año</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat__num">18</span>
                                <span className="hero-stat__lbl">Sem. inicio puesta</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat__num">5m²</span>
                                <span className="hero-stat__lbl">Espacio pastoreo</span>
                            </div>
                        </div>
                    </div>

                    <div className="hen-hero__img-wrap">
                        <img
                            src="https://certifiedhumanelatino.org/wp-content/uploads/2021/11/Design-sem-nome-2.png"
                            alt="Gallinas"
                            className="hen-hero__img"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/220x220/1a1208/e8a520?text=🐔' }}
                        />
                    </div>
                </div>

                {/* Tab nav */}
                <nav className="hen-hero__nav">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            className={`hen-tab-btn ${activeTab === t.key ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            <i className={`fas ${t.icon}`}></i>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* ════ BODY GRID ════ */}
            <div className="hen-body">

                {/* ── MAIN ── */}
                <main>

                    {/* ══ GENERAL ══ */}
                    {activeTab === 'general' && (<>

                        <SecLabel text="Por qué criar gallinas" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <img
                                src="https://bogota.gov.co/sites/default/files/inline-images/gallinas-2_0.jpeg"
                                alt="Gallinas en campo"
                                className="hen-card__cover"
                                onClick={() => setLightbox("https://bogota.gov.co/sites/default/files/inline-images/gallinas-2_0.jpeg")}
                                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x280/261a0c/e8a520?text=Gallinas+en+campo' }}
                            />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title">
                                    <i className="fas fa-feather-alt"></i> Producción avícola en Colombia
                                </h2>
                                <div className="hen-card__title-line" />
                                <p>
                                    Las gallinas son una de las apuestas más rentables para el pequeño y mediano productor colombiano.
                                    Ofrecen un retorno constante en forma de huevos, carne y abono orgánico, con una inversión inicial
                                    moderada y un ciclo productivo rápido.
                                </p>
                                <p>
                                    En regiones como el Cauca, Nariño y Antioquia, miles de familias campesinas basan parte de su
                                    seguridad alimentaria en la producción avícola de traspatio, integrándola con cultivos y ganadería.
                                </p>

                                <div className="hen-info-grid">
                                    <div className="hen-info-box">
                                        <i className="fas fa-check-double hen-info-box__icon"></i>
                                        <strong>Ventajas</strong>
                                        <ul>
                                            <li>Ciclo productivo corto</li>
                                            <li>Alta demanda del mercado</li>
                                            <li>Abono de alta calidad</li>
                                            <li>Fácil integración con cultivos</li>
                                        </ul>
                                    </div>
                                    <div className="hen-info-box hen-info-box--warn">
                                        <i className="fas fa-exclamation-triangle hen-info-box__icon"></i>
                                        <strong>Retos</strong>
                                        <ul>
                                            <li>Control sanitario constante</li>
                                            <li>Costo de alimento balanceado</li>
                                            <li>Variación del precio del huevo</li>
                                            <li>Predadores en campo abierto</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Curiosidades" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-brain"></i> ¿Sabías que…?</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-curiosity-grid">
                                    {[
                                        { icon: 'fa-brain',           text: <>Reconocen hasta <strong>100 rostros</strong> distintos.</> },
                                        { icon: 'fa-microphone-alt',  text: <>Se comunican con más de <strong>30 vocalizaciones</strong>.</> },
                                        { icon: 'fa-bed',             text: <>Son capaces de <strong>soñar</strong> en sueño REM.</> },
                                        { icon: 'fa-crown',           text: <>Forman jerarquías: la <strong>"gallina alfa"</strong>.</> },
                                        { icon: 'fa-eye',             text: <>Visión tetracromática: ven lo que <strong>no percibimos</strong>.</> },
                                        { icon: 'fa-heart',           text: <>Las felices producen <strong>huevos más nutritivos</strong>.</> },
                                    ].map((c, i) => (
                                        <div key={i} className="hen-curio">
                                            <i className={`fas ${c.icon}`}></i>
                                            <p>{c.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Videos recomendados" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-play-circle"></i> Recursos audiovisuales</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-video-grid">
                                    <div className="hen-video">
                                        <p className="hen-video-label"><i className="fas fa-hammer"></i> Cómo construir un gallinero</p>
                                        <iframe title="Gallinero" src="https://www.youtube.com/embed/er1d3U2PGMo"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen loading="lazy" />
                                    </div>
                                    <div className="hen-video">
                                        <p className="hen-video-label"><i className="fas fa-egg"></i> Crianza de gallinas ponedoras</p>
                                        <iframe title="Ponedoras" src="https://www.youtube.com/embed/dzUGFP2upVA"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen loading="lazy" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>)}

                    {/* ══ RAZAS ══ */}
                    {activeTab === 'razas' && (<>
                        <SecLabel text="Selección de razas" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-list-alt"></i> Razas según tu objetivo</h2>
                                <div className="hen-card__title-line" />
                                <p>Elegir la raza correcta es el primer paso hacia una producción rentable. Las más utilizadas en Colombia:</p>

                                <div className="hen-table-wrap">
                                    <table className="hen-table">
                                        <thead>
                                            <tr>
                                                <th>Raza</th><th>Tipo</th><th>Huevos/año</th>
                                                <th>Peso adulto</th><th>Temperamento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                ['Isa Brown',       'Postura',         '300–320', '2.0 kg',           'Tranquila',  'green'],
                                                ['Lohmann Brown',   'Postura',         '290–310', '2.1 kg',           'Dócil',      'green'],
                                                ['Rhode Island Red','Doble propósito', '200–280', '3.5 kg',           'Activa',     'yellow'],
                                                ['Plymouth Rock',   'Doble propósito', '180–200', '3.8 kg',           'Calmada',    'yellow'],
                                                ['Ross 308',        'Carne (Broiler)', '—',       '2.5 kg (42 días)', 'Sedentaria', 'orange'],
                                                ['Cobb 500',        'Carne (Broiler)', '—',       '2.7 kg (42 días)', 'Sedentaria', 'orange'],
                                                ['Criollo / Patio', 'Traspatio',       '80–120',  '2.0–2.5 kg',       'Rústica',    'blue'],
                                            ].map(([name, type, eggs, weight, temp, cls]) => (
                                                <tr key={name as string}>
                                                    <td><strong style={{ color: 'var(--hen-amber)' }}>{name}</strong></td>
                                                    <td><span className={`hen-badge hen-badge--${cls}`}>{type}</span></td>
                                                    <td style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--hen-gold)' }}>{eggs}</td>
                                                    <td>{weight}</td>
                                                    <td style={{ color: 'var(--hen-feather)' }}>{temp}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="hen-tip">
                                    <i className="fas fa-lightbulb"></i>
                                    <div>
                                        <strong>Consejo:</strong> Para sistemas de traspatio o pastoreo semi-intensivo en clima cálido, las razas de doble propósito como la <strong>Rhode Island Red</strong> son más resistentes y versátiles que las líneas comerciales de postura.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Adaptación climática" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-thermometer-half"></i> Razas según el clima</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-climate-grid">
                                    {[
                                        { emoji: '🌡️', label: 'Clima cálido',   sub: '< 1.500 msnm',    razas: ['Rhode Island Red', 'Isa Brown', 'Criollo de patio'] },
                                        { emoji: '🌤️', label: 'Clima templado', sub: '1.500–2.200 msnm', razas: ['Lohmann Brown', 'Plymouth Rock', 'Rhode Island Red'] },
                                        { emoji: '❄️', label: 'Clima frío',     sub: '> 2.200 msnm',    razas: ['Plymouth Rock', 'Sussex', 'Wyandotte'] },
                                    ].map(c => (
                                        <div key={c.label} className="hen-climate-card">
                                            <span className="hen-climate-card__icon">{c.emoji}</span>
                                            <h4>{c.label}<br /><small style={{ fontFamily: 'var(--mono)', fontSize: '.68rem', color: 'var(--hen-rust)', fontWeight: 400 }}>{c.sub}</small></h4>
                                            <ul className="hen-list">
                                                {c.razas.map(r => (
                                                    <li key={r}><i className="fas fa-check-circle"></i>{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ══ ALIMENTACIÓN ══ */}
                    {activeTab === 'alimentacion' && (<>
                        <SecLabel text="Nutrición por etapa" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-wheat-awn"></i> Etapas de alimentación</h2>
                                <div className="hen-card__title-line" />
                                <p>La nutrición varía según la etapa productiva. Nunca mezclar alimentos de iniciación con los de puesta, ya que los niveles de calcio son muy diferentes.</p>

                                <div className="hen-timeline">
                                    {[
                                        { n: '01', h: 'Pollita · 0–8 semanas',      p: 'Iniciador con 20–22% proteína. Agua limpia a libre acceso. Temperatura del galpón: 32 °C semana 1, reducir 3 °C/semana.' },
                                        { n: '02', h: 'Levante · 8–18 semanas',     p: 'Crecimiento con 15–17% proteína. Controlar el peso semanal para llegar a la puesta con el peso ideal de raza.' },
                                        { n: '03', h: 'Prepostura · 18–20 semanas', p: 'Transición al alimento de postura. Aumentar calcio gradualmente para preparar el aparato reproductor.' },
                                        { n: '04', h: 'Postura · 20–72 semanas',    p: 'Postura con 16–18% proteína y 3.5–4% calcio. Consumo promedio: 110–120 g/ave/día. Maximizar producción de huevo.' },
                                    ].map(s => (
                                        <div key={s.n} className="hen-timeline-item">
                                            <div className="hen-timeline-dot">{s.n}</div>
                                            <div className="hen-timeline-body">
                                                <h4>{s.h}</h4>
                                                <p>{s.p}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Alternativas locales" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-leaf"></i> Materias primas regionales</h2>
                                <div className="hen-card__title-line" />
                                <p>En Colombia es posible sustituir hasta un <strong style={{ color: 'var(--hen-gold)' }}>30%</strong> del concentrado comercial con materias primas regionales:</p>
                                <div className="hen-info-grid">
                                    <div className="hen-info-box">
                                        <i className="fas fa-seedling hen-info-box__icon"></i>
                                        <strong>Fuentes energéticas</strong>
                                        <ul>
                                            <li>Maíz amarillo</li>
                                            <li>Yuca deshidratada</li>
                                            <li>Sorgo</li>
                                            <li>Plátano verde rallado</li>
                                        </ul>
                                    </div>
                                    <div className="hen-info-box">
                                        <i className="fas fa-dumbbell hen-info-box__icon"></i>
                                        <strong>Fuentes proteicas</strong>
                                        <ul>
                                            <li>Torta de soja</li>
                                            <li>Harina de pescado</li>
                                            <li>Lombriz californiana</li>
                                            <li>Larvas de mosca soldado</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="hen-tip hen-tip--warn">
                                    <i className="fas fa-ban"></i>
                                    <div>
                                        <strong>Alimentos prohibidos:</strong> Cebolla, ajo en exceso, aguacate, cáscaras de cítrico, alimentos con sal, restos de carne cruda, cualquier alimento mohoso.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ══ SANIDAD ══ */}
                    {activeTab === 'sanidad' && (<>
                        <SecLabel text="Enfermedades frecuentes" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-shield-virus"></i> Enfermedades comunes</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-disease-list">
                                    {[
                                        { name: 'Newcastle',            sev: 'Alto riesgo',     cls: 'high', sx: 'Descarga nasal, dificultad respiratoria, diarrea verde, torticolis.', prev: 'Vacunación a los 7, 21 y 60 días. Revacunar cada 3 meses.' },
                                        { name: 'Marek',                sev: 'Alto riesgo',     cls: 'high', sx: 'Parálisis de patas y alas, tumores en órganos internos.', prev: 'Vacunación al día 1. No tiene tratamiento.' },
                                        { name: 'Coccidiosis',          sev: 'Manejo regular',  cls: 'low',  sx: 'Diarrea con sangre, pérdida de peso, plumas erizadas.', prev: 'Cama seca, no hacinamiento, coccidiostatos preventivos.' },
                                        { name: 'Bronquitis infecciosa', sev: 'Moderado',       cls: 'med',  sx: 'Estornudos, jadeos, caída brusca en postura.', prev: 'Vacunación H120 y MA5. Bioseguridad estricta.' },
                                    ].map(d => (
                                        <div key={d.name} className="hen-disease">
                                            <div className="hen-disease__header">
                                                <span className="hen-disease__name">{d.name}</span>
                                                <span className={`hen-severity hen-severity--${d.cls}`}>{d.sev}</span>
                                            </div>
                                            <p><strong>Síntomas:</strong> {d.sx}</p>
                                            <p><strong>Prevención:</strong> {d.prev}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Calendario sanitario" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-calendar-check"></i> Plan de vacunación</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-vax">
                                    {[
                                        ['Día 1',      'Marek (en incubadora)'],
                                        ['Día 7',      'Newcastle B1 + Bronquitis H120'],
                                        ['Día 14',     'Gumboro cepa intermedia'],
                                        ['Día 21',     'Gumboro refuerzo + Newcastle La Sota'],
                                        ['Semana 8',   'Viruela aviar + Newcastle refuerzo'],
                                        ['Semana 16',  'Newcastle + Bronquitis pre-postura'],
                                    ].map(([day, vac]) => (
                                        <div key={day} className="hen-vax-row">
                                            <span className="hen-vax-day">{day}</span>
                                            <span className="hen-vax-name">{vac}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="hen-tip">
                                    <i className="fas fa-lightbulb"></i>
                                    <div>Consultar siempre con un médico veterinario. El calendario puede variar según la región y el historial sanitario del lote.</div>
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ══ INSTALACIONES ══ */}
                    {activeTab === 'instalaciones' && (<>
                        <SecLabel text="Diseño del gallinero" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <img
                                src="https://paduamateriales.com/wp-content/uploads/que-tamano-debe-tener-un-gallinero-para-100-gallinas-1.webp"
                                alt="Gallinero"
                                className="hen-card__cover"
                                onClick={() => setLightbox("https://paduamateriales.com/wp-content/uploads/que-tamano-debe-tener-un-gallinero-para-100-gallinas-1.webp")}
                                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x280/261a0c/e8a520?text=Gallinero' }}
                            />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-ruler-combined"></i> Dimensionamiento</h2>
                                <div className="hen-card__title-line" />

                                <div className="hen-measure-grid">
                                    {[
                                        ['1 m²',  'por gallina en interior'],
                                        ['5 m²',  'por gallina en pastoreo'],
                                        ['20 cm', 'de percha por ave'],
                                        ['1:5',   'nidal por cada 5 gallinas'],
                                    ].map(([val, lbl]) => (
                                        <div key={lbl as string} className="hen-measure">
                                            <span className="hen-measure__val">{val}</span>
                                            <span className="hen-measure__lbl">{lbl}</span>
                                        </div>
                                    ))}
                                </div>

                                <ul className="hen-list" style={{ marginTop: 22 }}>
                                    <li><i className="fas fa-wind"></i> Orientación este-oeste para ventilación cruzada natural.</li>
                                    <li><i className="fas fa-sun"></i> Techo con alero suficiente contra lluvia y sol extremo.</li>
                                    <li><i className="fas fa-layer-group"></i> Cama de 10–15 cm de viruta de madera o cascarilla de arroz.</li>
                                    <li><i className="fas fa-lock"></i> Cierre perimetral enterrado 30 cm contra roedores y predadores.</li>
                                </ul>
                            </div>
                        </div>

                        <SecLabel text="Beneficios ambientales" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-recycle"></i> Integración ecológica</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-eco-grid">
                                    {[
                                        { icon: 'fa-recycle',   text: 'Transforman residuos orgánicos en gallinaza de alta calidad.' },
                                        { icon: 'fa-bug',       text: 'Control natural de insectos y larvas en potreros y cultivos.' },
                                        { icon: 'fa-seedling',  text: 'Fertilizan el suelo directamente al pastar libremente.' },
                                        { icon: 'fa-sync-alt',  text: 'Ciclo cerrado: estiércol → compost → cultivo → alimento.' },
                                    ].map(e => (
                                        <div key={e.text} className="hen-eco-item">
                                            <i className={`fas ${e.icon}`}></i>
                                            <p>{e.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}

                    {/* ══ ECONOMÍA ══ */}
                    {activeTab === 'economia' && (<>
                        <SecLabel text="Análisis financiero" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__top-bar" />
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-calculator"></i> Estimación · 100 aves</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-table-wrap">
                                    <table className="hen-table">
                                        <thead>
                                            <tr><th>Concepto</th><th>Valor mensual</th></tr>
                                        </thead>
                                        <tbody>
                                            <tr className="row-section"><td colSpan={2}>Costos</td></tr>
                                            <tr>
                                                <td>Alimento de puesta</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: '#e8735a' }}>$480k – $600k</td>
                                            </tr>
                                            <tr>
                                                <td>Agua, luz, medicamentos</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: '#e8735a' }}>$80k – $130k</td>
                                            </tr>
                                            <tr>
                                                <td><strong style={{ color: 'var(--hen-feather)' }}>Total costos</strong></td>
                                                <td style={{ fontFamily: 'var(--mono)', color: 'var(--hen-feather)' }}><strong>$560k – $730k</strong></td>
                                            </tr>
                                            <tr className="row-section"><td colSpan={2}>Ingresos</td></tr>
                                            <tr>
                                                <td>Venta huevos (~2.500 u.)</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: '#7abf70' }}>$760k – $1.0M</td>
                                            </tr>
                                            <tr>
                                                <td>Gallinaza / aves de descarte</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: '#7abf70' }}>$120k – $200k</td>
                                            </tr>
                                            <tr>
                                                <td><strong style={{ color: 'var(--hen-feather)' }}>Margen neto estimado</strong></td>
                                                <td style={{ fontFamily: 'var(--mono)', color: 'var(--hen-gold)' }}><strong>$320k – $470k</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="hen-tip">
                                    <i className="fas fa-info-circle"></i>
                                    <div>Los valores son estimados para Colombia 2024. Varían según región, precio del concentrado y canal de comercialización.</div>
                                </div>
                            </div>
                        </div>

                        <SecLabel text="Comercialización" />

                        <div className="hen-card fade-up">
                            <div className="hen-card__body">
                                <h2 className="hen-card__title"><i className="fas fa-store"></i> Canales de venta</h2>
                                <div className="hen-card__title-line" />
                                <div className="hen-market-grid">
                                    {[
                                        { icon: 'fa-user',       h: 'Venta directa',    p: 'Vecinos, mercados campesinos, ferias locales.',  badge: 'Mayor margen', cls: 'green' },
                                        { icon: 'fa-store-alt',  h: 'Tiendas y plazas', p: 'Volumen constante, menor margen.',               badge: 'Margen medio', cls: 'yellow' },
                                        { icon: 'fa-truck',      h: 'Intermediarios',   p: 'Acceso a mercados grandes.',                      badge: 'Menor precio', cls: 'orange' },
                                        { icon: 'fa-mobile-alt', h: 'E-commerce local', p: 'WhatsApp Business, redes sociales.',              badge: 'Creciente',    cls: 'blue' },
                                    ].map(m => (
                                        <div key={m.h} className="hen-market-item">
                                            <i className={`fas ${m.icon}`}></i>
                                            <h4>{m.h}</h4>
                                            <p>{m.p}</p>
                                            <span className={`hen-badge hen-badge--${m.cls}`}>{m.badge}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}

                </main>

                {/* ── ASIDE ── */}
                <aside className="hen-aside">

                    <div className="hen-card fade-up">
                        <div className="hen-card__top-bar" />
                        <div className="hen-card__body hen-card__body--tight">
                            <h3 className="hen-card__title" style={{ fontSize: '.9rem' }}>
                                <i className="fas fa-images"></i> Galería
                            </h3>
                            <div className="hen-card__title-line" />
                            <div className="hen-gallery-grid">
                                {[
                                    ['https://ganadosycarnes.com/wp-content/uploads/2019/02/gallinas-felices.jpg', 'Gallinas'],
                                    ['https://ecohabitar.org/wp-content/uploads/2023/03/gallinero1-1.jpg', 'Gallinero'],
                                    ['https://d1lg8auwtggj9x.cloudfront.net/images/Chicken_feed.width-820.jpg', 'Alimento'],
                                ].map(([src, alt]) => (
                                    <img key={alt as string} src={src as string} alt={alt as string}
                                        className="hen-gallery-img"
                                        onClick={() => setLightbox(src as string)}
                                        onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/200x120/261a0c/e8a520?text=${alt}` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hen-card fade-up">
                        <div className="hen-card__body hen-card__body--tight">
                            <h3 className="hen-card__title" style={{ fontSize: '.9rem' }}>
                                <i className="fas fa-tachometer-alt"></i> Indicadores clave
                            </h3>
                            <div className="hen-card__title-line" />
                            <div className="hen-kpi-list">
                                {[
                                    { lbl: '% Postura ideal',        val: '90%',      w: '90%',  warn: false },
                                    { lbl: 'Conversión alimenticia', val: '2.2 kg/kg', w: '70%',  warn: false },
                                    { lbl: 'Mortalidad máx.',        val: '< 5%',     w: '5%',   warn: true  },
                                ].map(k => (
                                    <div key={k.lbl}>
                                        <span className="hen-kpi-label">{k.lbl}</span>
                                        <div className="hen-kpi-bar">
                                            <div className={`hen-kpi-fill ${k.warn ? 'hen-kpi-fill--warn' : ''}`} style={{ width: k.w }}>
                                                {k.val}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hen-card fade-up">
                        <div className="hen-card__body hen-card__body--tight">
                            <h3 className="hen-card__title" style={{ fontSize: '.9rem' }}>
                                <i className="fas fa-exclamation-triangle"></i> Señales de alerta
                            </h3>
                            <div className="hen-card__title-line" />
                            <div className="hen-alert-list">
                                {[
                                    ['fa-arrow-down', 'Caída de postura > 10%'],
                                    ['fa-lungs',      'Estornudos o jadeos frecuentes'],
                                    ['fa-poop',       'Diarrea anormal o con sangre'],
                                    ['fa-eye-slash',  'Ojos llorosos o hinchados'],
                                    ['fa-feather',    'Pérdida excesiva de plumas'],
                                ].map(([icon, msg]) => (
                                    <div key={msg as string} className="hen-alert-item">
                                        <i className={`fas ${icon}`}></i> {msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hen-card fade-up">
                        <div className="hen-card__body hen-card__body--tight">
                            <h3 className="hen-card__title" style={{ fontSize: '.9rem' }}>
                                <i className="fas fa-link"></i> Recursos oficiales
                            </h3>
                            <div className="hen-card__title-line" />
                            <div className="hen-resource-list">
                                {[
                                    ['https://www.ica.gov.co',      'ICA · Sanidad Colombia'],
                                    ['https://www.fenavi.org',      'FENAVI · Federación Avícola'],
                                    ['https://www.agronet.gov.co',  'Agronet · Precios'],
                                ].map(([url, label]) => (
                                    <a key={url as string} href={url as string} target="_blank" rel="noreferrer">
                                        <i className="fas fa-external-link-alt"></i> {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}