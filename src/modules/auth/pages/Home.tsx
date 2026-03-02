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

const teamMembers: DevMember[] = [
    { num: '01', photo: '/img/FOTODEDANIEL.jpeg', name: 'Daniel Esteban', badge: 'Frontend', role: 'Frontend Developer', age: '19 años', delay: 0 },
    { num: '02', photo: '/img/FOTODELUISSSJ4.jpeg', name: 'Luis Esteban', badge: 'Scrum', role: 'Scrum Master', age: '21 años', delay: 100 },
    { num: '03', photo: '/img/BLACK.jpeg', name: 'Julian David', badge: 'UI/UX', role: 'UI/UX Designer', age: '23 años', delay: 200 },
    { num: '04', photo: '/img/FOTODEMAICOL.jpeg', name: 'Maicol Antonio', badge: 'Mobile', role: 'Mobile Developer', age: '19 años', delay: 300 },
]

export default function Home() {
    const teamRef = useRef<HTMLDivElement>(null)

    // ── Intersection Observer for dev-card reveal ──
    useEffect(() => {
        const cards = teamRef.current?.querySelectorAll('.dev-card')
        if (!cards) return

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement
                    const delay = parseInt(el.dataset.delay ?? '0')
                    setTimeout(() => {
                        el.classList.add('revealed')
                    }, delay)
                    observer.unobserve(el)
                }
            })
        }, { threshold: 0.15 })

        cards.forEach(card => observer.observe(card))
        return () => observer.disconnect()
    }, [])

    // ── Smooth scroll for "Conocer más" ──
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
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <div className="hero-tag">
                        <i className="fas fa-leaf"></i>
                        Plataforma Agropecuaria Digital
                    </div>
                    <h1 className="hero-title">
                        El campo colombiano<br />merece tecnología <em>inteligente</em>
                    </h1>
                    <p className="hero-sub">
                        Gestiona tus finanzas, cultivos y producción animal desde un solo lugar.
                        Simple, poderoso, hecho para el agricultor moderno.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary-home">
                            <i className="fas fa-seedling"></i> Comenzar gratis
                        </Link>
                        <a href="#sobre-nosotros" className="btn-secondary-home" onClick={handleScrollToAbout}>
                            <i className="fas fa-play-circle"></i> Conocer más
                        </a>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-num">4+</div>
                            <div className="hero-stat-label">Módulos</div>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <div className="hero-stat-num">100%</div>
                            <div className="hero-stat-label">Gratuito</div>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <div className="hero-stat-num">Col</div>
                            <div className="hero-stat-label">Hecho en Colombia</div>
                        </div>
                    </div>
                </div>

                <div className="hero-scroll">
                    <div className="hero-scroll-line"></div>
                    <span>Scroll</span>
                </div>
            </section>

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
                            alt="Agricultura"
                            className="about-img-main"
                        />
                        <div className="about-img-card">
                            <div className="about-img-card-num">🌿</div>
                            <div className="about-img-card-text">Hecho para el agricultor colombiano</div>
                        </div>
                    </div>
                </div>

                <div className="about-right">
                    <p>
                        <strong>AgroFinanzas</strong> nació con una misión clara: llevar herramientas digitales de calidad
                        a quienes trabajan la tierra. Somos una plataforma comprometida con el fortalecimiento del sector
                        rural colombiano.
                    </p>
                    <p>
                        Creemos en el poder del conocimiento y la tecnología para transformar vidas. Por eso trabajamos
                        para que cada campesino tenga acceso a información clara, recomendaciones útiles y un entorno
                        digital amigable que le permita tomar mejores decisiones.
                    </p>
                    <p>
                        No somos solo una app. Somos un aliado del campo, una apuesta por la inclusión y un paso firme
                        hacia un desarrollo rural más justo, sostenible e inteligente.
                    </p>

                    <div className="about-features">
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-chart-line"></i></div>
                            <div className="about-feature-text">Gestión financiera completa</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-leaf"></i></div>
                            <div className="about-feature-text">Guías de cultivos y agronomía</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-egg"></i></div>
                            <div className="about-feature-text">Producción animal</div>
                        </div>
                        <div className="about-feature">
                            <div className="about-feature-icon"><i className="fas fa-users"></i></div>
                            <div className="about-feature-text">Comunidad de agricultores</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separador */}
            <div className="home-divider">
                <div className="home-divider-line"></div>
                <div className="home-divider-dot"></div>
                <div className="home-divider-line"></div>
            </div>

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
                            <div className="dev-card-line"></div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    )
}
