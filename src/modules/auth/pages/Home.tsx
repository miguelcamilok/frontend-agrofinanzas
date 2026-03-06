import { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

interface DevMember {
    num: string
    photo: string
    name: string
    badge: string
    role: string
    age: string
    delay: number
}

interface Module {
    num: string
    icon: string
    title: string
    desc: string
    to: string
}

const teamMembers: DevMember[] = [
    { num: '01', photo: '/img/FOTODEDANIEL.jpeg',    name: 'Daniel Esteban', badge: 'Frontend', role: 'Frontend Developer', age: '19 años', delay: 0   },
    { num: '02', photo: '/img/FOTODELUISSSJ4.jpeg',  name: 'Luis Esteban',   badge: 'Scrum',    role: 'Scrum Master',       age: '21 años', delay: 100 },
    { num: '03', photo: '/img/BLACK.jpeg',            name: 'Julian David',   badge: 'UI/UX',    role: 'UI/UX Designer',     age: '23 años', delay: 200 },
    { num: '04', photo: '/img/FOTODEMAICOL.jpeg',     name: 'Maicol Antonio', badge: 'Mobile',   role: 'Mobile Developer',   age: '19 años', delay: 300 },
]

const modules: Module[] = [
    {
        num: '01',
        icon: 'fas fa-chart-line',
        title: 'Finanzas del Campo',
        desc: 'Registra ingresos, gastos y genera reportes claros de tu finca en segundos.',
        to: '/finanzas',
    },
    {
        num: '02',
        icon: 'fas fa-seedling',
        title: 'Gestión de Cultivos',
        desc: 'Planifica siembras, lleva el seguimiento de tus lotes y consulta guías agronómicas.',
        to: '/cultivos',
    },
    {
        num: '03',
        icon: 'fas fa-horse',
        title: 'Producción Animal',
        desc: 'Controla tu hato ganadero, vacunaciones, pesajes y ciclos reproductivos.',
        to: '/ganaderia',
    },
    {
        num: '04',
        icon: 'fas fa-cloud-sun',
        title: 'Clima e Insumos',
        desc: 'Consulta el clima local y lleva el inventario de tus insumos agrícolas.',
        to: '/clima',
    },
]

export default function Home() {
    const teamRef = useRef<HTMLDivElement>(null)

    // Intersection Observer for dev-card reveal
    useEffect(() => {
        const cards = teamRef.current?.querySelectorAll('.dev-card')
        if (!cards) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement
                    const delay = parseInt(el.dataset.delay ?? '0')
                    setTimeout(() => el.classList.add('revealed'), delay)
                    observer.unobserve(el)
                }
            })
        }, { threshold: 0.15 })

        cards.forEach(card => observer.observe(card))
        return () => observer.disconnect()
    }, [])

    // Smooth scroll
    const handleScrollToAbout = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        document.getElementById('sobre-nosotros')?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    return (
        <div className="home-wrap">

            {/* ══ HERO ══ */}
            <section className="home-hero">
                <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop"
                    alt="Campo colombiano"
                    className="hero-img"
                />
                <div className="hero-overlay" />
                <div className="hero-diagonal" />

                <div className="hero-content">
                    <div className="hero-tag">
                        <i className="fas fa-leaf" />
                        Plataforma Agropecuaria Digital · Colombia
                    </div>

                    <h1 className="hero-title">
                        El campo colombiano<br />
                        merece tecnología <em>inteligente</em>
                    </h1>

                    <p className="hero-sub">
                        Gestiona tus finanzas, cultivos y producción animal desde un solo lugar.
                        Simple, poderoso y hecho para el agricultor colombiano.
                    </p>

                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary-home">
                            <i className="fas fa-seedling" /> Comenzar gratis
                        </Link>
                        <a href="#sobre-nosotros" className="btn-secondary-home" onClick={handleScrollToAbout}>
                            <i className="fas fa-play-circle" /> Conocer más
                        </a>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-num">4+</div>
                            <div className="hero-stat-label">Módulos</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-num">100%</div>
                            <div className="hero-stat-label">Gratuito</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-num">🇨🇴</div>
                            <div className="hero-stat-label">Hecho en Colombia</div>
                        </div>
                    </div>
                </div>

                {/* Decorative side dots */}
                <div className="hero-side-accent">
                    <span>AgroFinanzas</span>
                    <div className="hero-side-dot active" />
                    <div className="hero-side-dot" />
                    <div className="hero-side-dot" />
                </div>

                <div className="hero-scroll">
                    <div className="hero-scroll-line" />
                    <span>Scroll</span>
                </div>
            </section>

            {/* ══ FEATURE STRIP ══ */}
            <div className="home-features-strip">
                <div className="feature-strip-item">
                    <div className="fsi-icon"><i className="fas fa-mobile-alt" /></div>
                    <div className="fsi-text">
                        <strong>100% Mobile</strong>
                        <span>Funciona en tu celular sin internet</span>
                    </div>
                </div>
                <div className="feature-strip-item">
                    <div className="fsi-icon"><i className="fas fa-lock" /></div>
                    <div className="fsi-text">
                        <strong>Datos seguros</strong>
                        <span>Tu información siempre protegida</span>
                    </div>
                </div>
                <div className="feature-strip-item">
                    <div className="fsi-icon"><i className="fas fa-users" /></div>
                    <div className="fsi-text">
                        <strong>Para todos</strong>
                        <span>Sin conocimientos técnicos requeridos</span>
                    </div>
                </div>
                <div className="feature-strip-item">
                    <div className="fsi-icon"><i className="fas fa-headset" /></div>
                    <div className="fsi-text">
                        <strong>Soporte local</strong>
                        <span>Equipo colombiano siempre disponible</span>
                    </div>
                </div>
            </div>

            {/* ══ QUIÉNES SOMOS ══ */}
            <section className="home-about" id="sobre-nosotros">
                <div className="about-left">
                    <p className="about-label">Sobre nosotros</p>
                    <h2 className="about-title">
                        Tecnología que<br />entiende el <em>campo</em>
                    </h2>

                    <div className="about-img-wrap">
                        <img
                            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1170&auto=format&fit=crop"
                            alt="Agricultura colombiana"
                            className="about-img-main"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop"
                            alt="Cultivo"
                            className="about-img-secondary"
                        />
                        <div className="about-img-card">
                            <div className="about-img-card-num">🌿</div>
                            <div className="about-img-card-text">Hecho para el agricultor colombiano</div>
                        </div>
                    </div>
                </div>

                <div className="about-right">
                    <p>
                        <strong>AgroFinanzas</strong> nació con una misión clara: llevar herramientas digitales
                        de calidad a quienes trabajan la tierra. Somos una plataforma comprometida con el
                        fortalecimiento del sector rural colombiano.
                    </p>

                    <blockquote className="about-quote">
                        "No somos solo una app. Somos un aliado del campo, una apuesta por la inclusión y un
                        paso firme hacia un desarrollo rural más justo, sostenible e inteligente."
                    </blockquote>

                    <p>
                        Creemos en el poder del conocimiento y la tecnología para transformar vidas. Por eso
                        trabajamos para que cada campesino tenga acceso a información clara y un entorno
                        digital amigable que le permita tomar mejores decisiones.
                    </p>

                    <div className="about-features">
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-chart-line" /></div>
                            <div className="about-feature-text">Gestión financiera completa</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-leaf" /></div>
                            <div className="about-feature-text">Guías de cultivos y agronomía</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-egg" /></div>
                            <div className="about-feature-text">Producción animal</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-users" /></div>
                            <div className="about-feature-text">Comunidad de agricultores</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separador */}
            <div className="home-divider">
                <div className="home-divider-line" />
                <div className="home-divider-dot" />
                <div className="home-divider-line" />
            </div>

            {/* ══ MÓDULOS ══ */}
            <section className="home-modules">
                <div className="modules-header section-header">
                    <p className="section-eyebrow">Lo que encontrarás</p>
                    <h2 className="section-title" style={{ color: 'var(--crema)' }}>
                        Nuestros <em style={{ color: 'var(--paja)' }}>Módulos</em>
                    </h2>
                </div>

                <div className="modules-grid">
                    {modules.map(mod => (
                        <div className="module-card" key={mod.num}>
                            <div className="module-number">{mod.num}</div>
                            <div className="module-icon"><i className={mod.icon} /></div>
                            <h3 className="module-title">{mod.title}</h3>
                            <p className="module-desc">{mod.desc}</p>
                            <Link to={mod.to} className="module-link">
                                Explorar <i className="fas fa-arrow-right" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ EQUIPO ══ */}
            <section className="home-team">
                <div className="section-header">
                    <p className="section-eyebrow">El equipo detrás del proyecto</p>
                    <h2 className="section-title">Nuestros <em>Desarrolladores</em></h2>
                </div>

                <div className="team-grid" ref={teamRef}>
                    {teamMembers.map(member => (
                        <div className="dev-card" key={member.num} data-delay={member.delay}>
                            <div className="dev-card-num">{member.num}</div>
                            <div className="dev-photo-wrap">
                                <img src={member.photo} alt={member.name} className="dev-photo" />
                                <span className="dev-badge">{member.badge}</span>
                            </div>
                            <p className="dev-name">{member.name}</p>
                            <p className="dev-role">{member.role}</p>
                            <p className="dev-age">{member.age}</p>
                            <div className="dev-card-line" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ CTA FINAL ══ */}
            <section className="home-cta">
                <p className="cta-eyebrow">¿Listo para empezar?</p>
                <h2 className="cta-title">
                    Tu finca más <em>organizada</em><br />desde hoy
                </h2>
                <p className="cta-sub">
                    Únete gratis y descubre por qué cientos de agricultores colombianos
                    ya confían en AgroFinanzas.
                </p>
                <Link to="/register" className="cta-btn">
                    <i className="fas fa-seedling" /> Crear cuenta gratis
                </Link>
            </section>

        </div>
    )
}