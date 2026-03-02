import { useState, useEffect, useRef } from 'react'
import './HensIndex.css'

export default function HensIndex() {
    const [activeTab, setActiveTab] = useState('general')
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const [selectedImg, setSelectedImg] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Scroll top logic
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollBtn(window.scrollY > 300)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fade-in animation with IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible')
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [activeTab]); // Re-run when tab changes to observe new elements

    const openModal = (src: string) => setSelectedImg(src)
    const closeModal = () => setSelectedImg(null)

    return (
        <div className="hens-container" ref={containerRef}>
            {/* Scroll Top Button */}
            <button
                className="scroll-top-btn"
                style={{ display: showScrollBtn ? 'block' : 'none' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Volver arriba"
            >
                <i className="fas fa-arrow-up"></i>
            </button>

            <div className="main-content-container">
                {/* ── HERO SECTION ── */}
                <div className="hero-section fade-in">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <i className="fas fa-egg"></i> Avicultura
                        </div>
                        <h1>Aves de Corral</h1>
                        <p className="hero-subtitle">Guía completa para pequeños y medianos productores</p>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="stat-num">300</span>
                                <span className="stat-label">Huevos/año</span>
                            </div>
                            <div className="hero-stat">
                                <span className="stat-num">18</span>
                                <span className="stat-label">Semanas inicio puesta</span>
                            </div>
                            <div className="hero-stat">
                                <span className="stat-num">5m²</span>
                                <span className="stat-label">Espacio pastoreo</span>
                            </div>
                        </div>
                    </div>
                    <img
                        src="https://certifiedhumanelatino.org/wp-content/uploads/2021/11/Design-sem-nome-2.png"
                        alt="Gallinas"
                        className="hero-img"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/220x220/1b1b1b/8ac926?text=🐔'; }}
                    />
                </div>

                {/* ── TABS DE NAVEGACIÓN ── */}
                <div className="tabs-nav fade-in">
                    <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}><i className="fas fa-info-circle"></i> General</button>
                    <button className={`tab-btn ${activeTab === 'razas' ? 'active' : ''}`} onClick={() => setActiveTab('razas')}><i className="fas fa-list"></i> Razas</button>
                    <button className={`tab-btn ${activeTab === 'alimentacion' ? 'active' : ''}`} onClick={() => setActiveTab('alimentacion')}><i className="fas fa-wheat-awn"></i> Alimentación</button>
                    <button className={`tab-btn ${activeTab === 'sanidad' ? 'active' : ''}`} onClick={() => setActiveTab('sanidad')}><i className="fas fa-syringe"></i> Sanidad</button>
                    <button className={`tab-btn ${activeTab === 'instalaciones' ? 'active' : ''}`} onClick={() => setActiveTab('instalaciones')}><i className="fas fa-home"></i> Instalaciones</button>
                    <button className={`tab-btn ${activeTab === 'economia' ? 'active' : ''}`} onClick={() => setActiveTab('economia')}><i className="fas fa-coins"></i> Economía</button>
                </div>

                <div className="content-grid">
                    <div className="main-column">

                        {/* ══ TAB: GENERAL ══ */}
                        {activeTab === 'general' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <img
                                        src="https://bogota.gov.co/sites/default/files/inline-images/gallinas-2_0.jpeg"
                                        alt="Gallinas en campo"
                                        className="card-img"
                                        onClick={() => openModal("https://bogota.gov.co/sites/default/files/inline-images/gallinas-2_0.jpeg")}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/700x300/1b1b1b/8ac926?text=Gallinas+en+campo'; }}
                                    />
                                    <h3><i className="fas fa-feather-alt"></i> ¿Por qué criar gallinas?</h3>
                                    <p>Las gallinas son una de las apuestas más rentables para el pequeño y mediano productor colombiano. Ofrecen un retorno constante en forma de huevos, carne y abono orgánico, con una inversión inicial moderada y un ciclo productivo rápido.</p>
                                    <p>En regiones como el Cauca, Nariño y Antioquia, miles de familias campesinas basan parte de su seguridad alimentaria en la producción avícola de traspatio, integrándola con cultivos y ganadería.</p>

                                    <div className="info-grid">
                                        <div className="info-box">
                                            <i className="fas fa-check-double"></i>
                                            <strong>Ventajas</strong>
                                            <ul>
                                                <li>Ciclo productivo corto</li>
                                                <li>Alta demanda del mercado</li>
                                                <li>Abono de alta calidad</li>
                                                <li>Fácil integración con cultivos</li>
                                            </ul>
                                        </div>
                                        <div className="info-box info-box--warn">
                                            <i className="fas fa-exclamation-triangle"></i>
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

                                <div className="card fade-in">
                                    <h3><i className="fas fa-brain"></i> Curiosidades</h3>
                                    <div className="curiosity-grid">
                                        <div className="curiosity-item">
                                            <i className="fas fa-brain"></i>
                                            <p>Reconocen hasta <strong>100 rostros</strong> distintos.</p>
                                        </div>
                                        <div className="curiosity-item">
                                            <i className="fas fa-microphone-alt"></i>
                                            <p>Se comunican con más de <strong>30 vocalizaciones</strong>.</p>
                                        </div>
                                        <div className="curiosity-item">
                                            <i className="fas fa-bed"></i>
                                            <p>Son capaces de <strong>soñar</strong> durante el sueño REM.</p>
                                        </div>
                                        <div className="curiosity-item">
                                            <i className="fas fa-crown"></i>
                                            <p>Forman jerarquías sociales: la <strong>"gallina alfa"</strong>.</p>
                                        </div>
                                        <div className="curiosity-item">
                                            <i className="fas fa-eye"></i>
                                            <p>Visión tetracromática: ven colores que <strong>no percibimos</strong>.</p>
                                        </div>
                                        <div className="curiosity-item">
                                            <i className="fas fa-heart"></i>
                                            <p>Las ponedoras felices producen <strong>huevos más nutritivos</strong>.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-play-circle"></i> Videos recomendados</h3>
                                    <div className="video-grid">
                                        <div className="video-item">
                                            <p className="video-title"><i className="fas fa-hammer"></i> Cómo construir un gallinero</p>
                                            <iframe
                                                title="Como construir un gallinero"
                                                src="https://www.youtube.com/embed/er1d3U2PGMo"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen loading="lazy">
                                            </iframe>
                                        </div>
                                        <div className="video-item">
                                            <p className="video-title"><i className="fas fa-egg"></i> Crianza de gallinas ponedoras</p>
                                            <iframe
                                                title="Crianza de gallinas ponedoras"
                                                src="https://www.youtube.com/embed/dzUGFP2upVA"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen loading="lazy">
                                            </iframe>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: RAZAS ══ */}
                        {activeTab === 'razas' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <h3><i className="fas fa-list-alt"></i> Razas según tu objetivo</h3>
                                    <p>Elegir la raza correcta es el primer paso hacia una producción rentable. Aquí las más utilizadas en Colombia:</p>

                                    <div className="breed-table-wrapper">
                                        <table className="breed-table">
                                            <thead>
                                                <tr>
                                                    <th>Raza</th>
                                                    <th>Tipo</th>
                                                    <th>Huevos/año</th>
                                                    <th>Peso adulto</th>
                                                    <th>Temperamento</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td><strong>Isa Brown</strong></td>
                                                    <td><span className="badge badge--green">Postura</span></td>
                                                    <td>300–320</td>
                                                    <td>2.0 kg</td>
                                                    <td>Tranquila</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Lohmann Brown</strong></td>
                                                    <td><span className="badge badge--green">Postura</span></td>
                                                    <td>290–310</td>
                                                    <td>2.1 kg</td>
                                                    <td>Dócil</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Rhode Island Red</strong></td>
                                                    <td><span className="badge badge--yellow">Doble propósito</span></td>
                                                    <td>200–280</td>
                                                    <td>3.5 kg</td>
                                                    <td>Activa</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Plymouth Rock</strong></td>
                                                    <td><span className="badge badge--yellow">Doble propósito</span></td>
                                                    <td>180–200</td>
                                                    <td>3.8 kg</td>
                                                    <td>Calmada</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Ross 308</strong></td>
                                                    <td><span className="badge badge--orange">Carne (Broiler)</span></td>
                                                    <td>—</td>
                                                    <td>2.5 kg (42 días)</td>
                                                    <td>Sedentaria</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Cobb 500</strong></td>
                                                    <td><span className="badge badge--orange">Carne (Broiler)</span></td>
                                                    <td>—</td>
                                                    <td>2.7 kg (42 días)</td>
                                                    <td>Sedentaria</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Criollo / Patio</strong></td>
                                                    <td><span className="badge badge--blue">Traspatio</span></td>
                                                    <td>80–120</td>
                                                    <td>2.0–2.5 kg</td>
                                                    <td>Rústica</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="tip-box">
                                        <i className="fas fa-lightbulb"></i>
                                        <div>
                                            <strong>Consejo:</strong> Para sistemas de traspatio o pastoreo semi-intensivo en clima cálido, las razas de doble propósito como la Rhode Island Red son más resistentes y versátiles que las líneas comerciales de postura.
                                        </div>
                                    </div>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-thermometer-half"></i> Razas según el clima</h3>
                                    <div className="climate-grid">
                                        <div className="climate-card">
                                            <div className="climate-icon">🌡️</div>
                                            <h4>Clima cálido (&lt;1.500 msnm)</h4>
                                            <ul className="styled-list">
                                                <li><i className="fas fa-check-circle text-accent"></i> Rhode Island Red</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Isa Brown</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Criollo de patio</li>
                                            </ul>
                                        </div>
                                        <div className="climate-card">
                                            <div className="climate-icon">🌤️</div>
                                            <h4>Clima templado (1.500–2.200 msnm)</h4>
                                            <ul className="styled-list">
                                                <li><i className="fas fa-check-circle text-accent"></i> Lohmann Brown</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Plymouth Rock</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Rhode Island Red</li>
                                            </ul>
                                        </div>
                                        <div className="climate-card">
                                            <div className="climate-icon">❄️</div>
                                            <h4>Clima frío (&gt;2.200 msnm)</h4>
                                            <ul className="styled-list">
                                                <li><i className="fas fa-check-circle text-accent"></i> Plymouth Rock</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Sussex</li>
                                                <li><i className="fas fa-check-circle text-accent"></i> Wyandotte</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: ALIMENTACIÓN ══ */}
                        {activeTab === 'alimentacion' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <h3><i className="fas fa-wheat-awn"></i> Etapas de alimentación</h3>
                                    <p>La nutrición varía según la etapa productiva. Nunca mezclar alimentos de iniciación con los de puesta, ya que los niveles de calcio son muy diferentes.</p>

                                    <div className="stage-timeline">
                                        <div className="stage-item">
                                            <div className="stage-dot">1</div>
                                            <div className="stage-body">
                                                <h4>Pollita (0–8 semanas)</h4>
                                                <p>Iniciador con 20–22% proteína. Agua limpia a libre acceso. Temperatura del galpón: 32°C semana 1, reducir 3°C/semana.</p>
                                            </div>
                                        </div>
                                        <div className="stage-item">
                                            <div className="stage-dot">2</div>
                                            <div className="stage-body">
                                                <h4>Levante (8–18 semanas)</h4>
                                                <p>Crecimiento con 15–17% proteína. Controlar el peso semanal para llegar a la puesta con el peso ideal de raza.</p>
                                            </div>
                                        </div>
                                        <div className="stage-item">
                                            <div className="stage-dot">3</div>
                                            <div className="stage-body">
                                                <h4>Prepostura (18–20 semanas)</h4>
                                                <p>Transición al alimento de postura. Aumentar calcio gradualmente para preparar el aparato reproductor.</p>
                                            </div>
                                        </div>
                                        <div className="stage-item">
                                            <div className="stage-dot">4</div>
                                            <div className="stage-body">
                                                <h4>Postura (20–72 semanas)</h4>
                                                <p>Postura con 16–18% proteína y 3.5–4% calcio. Consumo promedio: 110–120 g/ave/día. Maximizar producción de huevo.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-leaf"></i> Alternativas locales</h3>
                                    <p>En Colombia es posible sustituir hasta un 30% del concentrado comercial con materias primas regionales:</p>
                                    <div className="info-grid">
                                        <div className="info-box">
                                            <i className="fas fa-seedling"></i>
                                            <strong>Fuentes energéticas</strong>
                                            <ul>
                                                <li>Maíz amarillo (energía principal)</li>
                                                <li>Yuca deshidratada</li>
                                                <li>Sorgo</li>
                                                <li>Plátano verde rallado</li>
                                            </ul>
                                        </div>
                                        <div className="info-box">
                                            <i className="fas fa-dumbbell"></i>
                                            <strong>Fuentes proteicas</strong>
                                            <ul>
                                                <li>Torta de soja</li>
                                                <li>Harina de pescado</li>
                                                <li>Lombriz californiana</li>
                                                <li>Larvas de mosca soldado</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="tip-box tip-box--warn">
                                        <i className="fas fa-ban"></i>
                                        <div>
                                            <strong>Alimentos prohibidos:</strong> Cebolla, ajo en exceso, aguacate, cáscaras de cítrico, alimentos con sal, restos de carne cruda, cualquier alimento mohoso.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: SANIDAD ══ */}
                        {activeTab === 'sanidad' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <h3><i className="fas fa-shield-virus"></i> Enfermedades Comunes</h3>
                                    <div className="disease-list">
                                        <div className="disease-item">
                                            <div className="disease-header">
                                                <span className="disease-name">Newcastle</span>
                                                <span className="severity severity--high">Alto riesgo</span>
                                            </div>
                                            <p><strong>Síntomas:</strong> Descarga nasal, dificultad respiratoria, diarrea verde, torticolis.</p>
                                            <p><strong>Prevención:</strong> Vacunación a los 7, 21 y 60 días. Revacunar cada 3 meses.</p>
                                        </div>
                                        <div className="disease-item">
                                            <div className="disease-header">
                                                <span className="disease-name">Marek</span>
                                                <span className="severity severity--high">Alto riesgo</span>
                                            </div>
                                            <p><strong>Síntomas:</strong> Parálisis de patas y alas, tumores en órganos internos.</p>
                                            <p><strong>Prevención:</strong> Vacunación al día 1. No tiene tratamiento.</p>
                                        </div>
                                        <div className="disease-item">
                                            <div className="disease-header">
                                                <span className="disease-name">Coccidiosis</span>
                                                <span className="severity severity--low">Manejo regular</span>
                                            </div>
                                            <p><strong>Síntomas:</strong> Diarrea con sangre, pérdida de peso, plumas erizadas.</p>
                                            <p><strong>Prevención:</strong> Cama seca, no hacinamiento.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-calendar-check"></i> Calendario Sanitario</h3>
                                    <div className="vaccine-timeline">
                                        <div className="vac-row"><span className="vac-day">Día 1</span><span className="vac-name">Marek (en incubadora)</span></div>
                                        <div className="vac-row"><span className="vac-day">Día 7</span><span className="vac-name">Newcastle B1 + Bronquitis H120</span></div>
                                        <div className="vac-row"><span className="vac-day">Día 14</span><span className="vac-name">Gumboro cepa intermedia</span></div>
                                        <div className="vac-row"><span className="vac-day">Día 21</span><span className="vac-name">Gumboro refuerzo + Newcastle La Sota</span></div>
                                        <div className="vac-row"><span className="vac-day">Semana 8</span><span className="vac-name">Viruela aviar + Newcastle refuerzo</span></div>
                                        <div className="vac-row"><span className="vac-day">Semana 16</span><span className="vac-name">Newcastle + Bronquitis pre-postura</span></div>
                                    </div>
                                    <div className="tip-box">
                                        <i className="fas fa-lightbulb"></i>
                                        <div>Consultar siempre con un médico veterinario. El calendario puede variar según la región.</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: INSTALACIONES ══ */}
                        {activeTab === 'instalaciones' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <h3><i className="fas fa-ruler-combined"></i> Dimensionamiento del gallinero</h3>
                                    <img
                                        src="https://paduamateriales.com/wp-content/uploads/que-tamano-debe-tener-un-gallinero-para-100-gallinas-1.webp"
                                        className="card-img"
                                        alt="Gallinero"
                                        onClick={() => openModal("https://paduamateriales.com/wp-content/uploads/que-tamano-debe-tener-un-gallinero-para-100-gallinas-1.webp")}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/700x300/1b1b1b/8ac926?text=Gallinero'; }}
                                    />

                                    <div className="measure-grid">
                                        <div className="measure-item">
                                            <span className="measure-val">1 m²</span>
                                            <span className="measure-desc">por gallina en interior</span>
                                        </div>
                                        <div className="measure-item">
                                            <span className="measure-val">5 m²</span>
                                            <span className="measure-desc">por gallina en pastoreo</span>
                                        </div>
                                        <div className="measure-item">
                                            <span className="measure-val">20 cm</span>
                                            <span className="measure-desc">de percha por ave</span>
                                        </div>
                                        <div className="measure-item">
                                            <span className="measure-val">1:5</span>
                                            <span className="measure-desc">nidal por cada 5 gallinas</span>
                                        </div>
                                    </div>

                                    <ul className="styled-list">
                                        <li><i className="fas fa-wind text-accent"></i> Orientación este-oeste para ventilación cruzada.</li>
                                        <li><i className="fas fa-sun text-accent"></i> Techo con alero suficiente contra lluvia y sol extremo.</li>
                                        <li><i className="fas fa-layer-group text-accent"></i> Cama de 10–15 cm de viruta de madera o cascarilla.</li>
                                        <li><i className="fas fa-lock text-accent"></i> Cierre perimetral enterrado 30 cm contra roedores.</li>
                                    </ul>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-recycle"></i> Beneficios ecológicos</h3>
                                    <div className="eco-grid">
                                        <div className="eco-item">
                                            <i className="fas fa-recycle"></i>
                                            <p>Transforman residuos orgánicos en abono (gallinaza)</p>
                                        </div>
                                        <div className="eco-item">
                                            <i className="fas fa-bug"></i>
                                            <p>Control natural de insectos y larvas en potreros</p>
                                        </div>
                                        <div className="eco-item">
                                            <i className="fas fa-seedling"></i>
                                            <p>Fertilizan el suelo directamente al pastar</p>
                                        </div>
                                        <div className="eco-item">
                                            <i className="fas fa-sync-alt"></i>
                                            <p>Ciclo cerrado: estiércol → compost → cultivo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: ECONOMÍA ══ */}
                        {activeTab === 'economia' && (
                            <div className="tab-content active">
                                <div className="card fade-in">
                                    <h3><i className="fas fa-calculator"></i> Estimación (100 aves)</h3>
                                    <div className="breed-table-wrapper">
                                        <table className="breed-table">
                                            <thead>
                                                <tr><th>Concepto</th><th>Costo/Ingreso</th></tr>
                                            </thead>
                                            <tbody>
                                                <tr><td colSpan={2} className="table-section-header">COSTOS MENSUALES</td></tr>
                                                <tr><td>Alimento Puesta</td><td style={{ color: 'var(--danger)' }}>$480k - $600k</td></tr>
                                                <tr><td>Agua, Luz, Medicamentos</td><td style={{ color: 'var(--danger)' }}>$80k - $130k</td></tr>
                                                <tr><td><strong>Total Gastos</strong></td><td><strong>$560k - $730k</strong></td></tr>
                                                <tr><td colSpan={2} className="table-section-header">INGRESOS</td></tr>
                                                <tr><td>Venta Huevos (~2500u)</td><td style={{ color: 'var(--accent)' }}>$760k - $1.0M</td></tr>
                                                <tr><td>Venta Gallinaza / Aves</td><td style={{ color: 'var(--accent)' }}>$120k - $200k</td></tr>
                                                <tr><td><strong>Margen Neto</strong></td><td><strong>$320k - $470k</strong></td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card fade-in">
                                    <h3><i className="fas fa-store"></i> Comercialización</h3>
                                    <div className="market-grid">
                                        <div className="market-item">
                                            <i className="fas fa-user"></i>
                                            <h4>Venta directa</h4>
                                            <p>Vecinos, mercados campesinos.</p>
                                            <span className="badge badge--green">Mayor margen</span>
                                        </div>
                                        <div className="market-item">
                                            <i className="fas fa-store-alt"></i>
                                            <h4>Tiendas</h4>
                                            <p>Volumen constante.</p>
                                            <span className="badge badge--yellow">Margen medio</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ══════════════════════════════════════
                         ASIDE / COLUMNA LATERAL
                    ══════════════════════════════════════ */}
                    <div className="aside-column">
                        <div className="card fade-in">
                            <h3><i className="fas fa-images"></i> Galería</h3>
                            <div className="gallery-grid">
                                <img
                                    src="https://ganadosycarnes.com/wp-content/uploads/2019/02/gallinas-felices.jpg"
                                    className="aside-img gallery-img"
                                    onClick={() => openModal("https://ganadosycarnes.com/wp-content/uploads/2019/02/gallinas-felices.jpg")}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/1b1b1b/8ac926?text=Galería+1'; }}
                                    alt="Galería 1"
                                />
                                <img
                                    src="https://ecohabitar.org/wp-content/uploads/2023/03/gallinero1-1.jpg"
                                    className="aside-img gallery-img"
                                    onClick={() => openModal("https://ecohabitar.org/wp-content/uploads/2023/03/gallinero1-1.jpg")}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/1b1b1b/8ac926?text=Galería+2'; }}
                                    alt="Galería 2"
                                />
                                <img
                                    src="https://d1lg8auwtggj9x.cloudfront.net/images/Chicken_feed.width-820.jpg"
                                    className="aside-img gallery-img"
                                    onClick={() => openModal("https://d1lg8auwtggj9x.cloudfront.net/images/Chicken_feed.width-820.jpg")}
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/1b1b1b/8ac926?text=Galería+3'; }}
                                    alt="Galería 3"
                                />
                            </div>
                        </div>

                        <div className="card fade-in">
                            <h3><i className="fas fa-tachometer-alt"></i> Indicadores</h3>
                            <div className="kpi-list">
                                <div className="kpi-item">
                                    <span className="kpi-label">% Postura ideal</span>
                                    <div className="kpi-bar"><div className="kpi-fill" style={{ width: '90%' }}>90%</div></div>
                                </div>
                                <div className="kpi-item">
                                    <span className="kpi-label">Conversión</span>
                                    <div className="kpi-bar"><div className="kpi-fill" style={{ width: '70%' }}>2.2 kg/kg</div></div>
                                </div>
                                <div className="kpi-item">
                                    <span className="kpi-label">Mortalidad</span>
                                    <div className="kpi-bar kpi-bar--warn"><div className="kpi-fill kpi-fill--warn" style={{ width: '5%' }}>&lt;5%</div></div>
                                </div>
                            </div>
                        </div>

                        <div className="card fade-in">
                            <h3><i className="fas fa-exclamation-circle"></i> Alertas</h3>
                            <ul className="alert-list">
                                <li><i className="fas fa-arrow-down"></i> Caída de postura &gt;10%</li>
                                <li><i className="fas fa-lungs"></i> Estornudos o jadeos</li>
                                <li><i className="fas fa-poop"></i> Diarrea anormal</li>
                                <li><i className="fas fa-eye-slash"></i> Ojos llorosos</li>
                            </ul>
                        </div>

                        <div className="card fade-in">
                            <h3><i className="fas fa-link"></i> Recursos</h3>
                            <ul className="resource-list">
                                <li><a href="https://www.ica.gov.co" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt"></i> ICA Sanidad Colombia</a></li>
                                <li><a href="https://www.fenavi.org" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt"></i> FENAVI Federación</a></li>
                                <li><a href="https://www.agronet.gov.co" target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt"></i> Agronet Precios</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para imágenes */}
            {selectedImg && (
                <div className="modal" style={{ display: 'block' }} onClick={closeModal}>
                    <span className="close-modal-btn" onClick={closeModal}>&times;</span>
                    <img className="modal-content" src={selectedImg} alt="Imagen ampliada" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    )
}
