import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">

                {/* ── COLUMNA BRAND + SOPORTE ── */}
                <div className="footer-section footer-brand-col">
                    <Link to="/" className="footer-brand-logo">
                        <img src="/img/nvlogo.png" alt="Logo AgroFinanzas" className="footer-brand-img" />
                        <span className="footer-brand-name">Agro<em>Finanzas</em></span>
                    </Link>

                    <p className="footer-brand-desc">
                        Plataforma digital para agricultores y ganaderos colombianos.
                        Gestiona tus finanzas, cultivos y producción animal desde un solo lugar.
                    </p>

                    {/* Correo de soporte */}
                    <div className="footer-support-row">
                        <div className="footer-support-icon">
                            <i className="fas fa-envelope" />
                        </div>
                        <div className="footer-support-info">
                            <strong>Soporte</strong>
                            <a href="mailto:agrofinanzas0@gmail.com">agrofinanzas0@gmail.com</a>
                        </div>
                    </div>

                    {/* Redes */}
                    <div className="social-icons">
                        <a href="#" className="social-link" title="Facebook" aria-label="Facebook">
                            <img src="https://www.freeiconspng.com/uploads/facebook-logo-3.png" alt="Facebook" />
                        </a>
                        <a href="#" className="social-link" title="Instagram" aria-label="Instagram">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg" alt="Instagram" />
                        </a>
                        <a href="#" className="social-link" title="X / Twitter" aria-label="Twitter">
                            <img src="https://img.freepik.com/vector-gratis/nuevo-diseno-icono-x-logotipo-twitter-2023_1017-45418.jpg?semt=ais_hybrid&w=740&q=80" alt="Twitter" />
                        </a>
                        <a href="#" className="social-link" title="YouTube" aria-label="YouTube">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS12cuQlU2h6d0V-rLkxpSJSdBJ89ZO4uGTPA&s" alt="YouTube" />
                        </a>
                    </div>

                    <p className="terminos">
                        <i className="fas fa-shield-halved" style={{ color: 'rgba(200,169,110,0.35)', fontSize: '.65rem' }} />
                        © {new Date().getFullYear()} AgroFinanzas &nbsp;|&nbsp;
                        <a href="/terminos-condiciones">Términos de uso</a>
                    </p>

                    {/* Acceso admin oculto */}
                    <Link
                        to="/admin/login"
                        style={{ opacity: 0.05, fontSize: '0.4rem', color: 'transparent', textDecoration: 'none', marginTop: '4px' }}
                    >·</Link>
                </div>

                {/* ── MÓDULOS ── */}
                <div className="footer-section">
                    <h3><i className="fas fa-th-large" /> Módulos</h3>
                    <ul className="footer-nav-list">
                        <li><a href="/client/finances"><i className="fas fa-chevron-right" /> Finanzas</a></li>
                        <li><a href="/hens"><i className="fas fa-chevron-right" /> Aves de Corral</a></li>
                        <li><a href="/cattles"><i className="fas fa-chevron-right" /> Ganado Vacuno</a></li>
                        <li><a href="/avocadocrops"><i className="fas fa-chevron-right" /> Cultivo de Aguacate</a></li>
                        <li><a href="/coffe_crops"><i className="fas fa-chevron-right" /> Cultivo de Café</a></li>
                        <li><a href="/recommendations"><i className="fas fa-chevron-right" /> Comunidad</a></li>
                    </ul>
                </div>

                {/* ── CUENTA ── */}
                <div className="footer-section">
                    <h3><i className="fas fa-user-circle" /> Mi Cuenta</h3>
                    <ul className="footer-nav-list">
                        <li><a href="/login"><i className="fas fa-chevron-right" /> Iniciar Sesión</a></li>
                        <li><a href="/register"><i className="fas fa-chevron-right" /> Registrarse</a></li>
                        <li><a href="/editar-perfil"><i className="fas fa-chevron-right" /> Editar Perfil</a></li>
                        <li><a href="/terminos-condiciones"><i className="fas fa-chevron-right" /> Términos y Condiciones</a></li>
                    </ul>
                </div>

            </div>

            {/* ── BARRA INFERIOR ── */}
            <div className="footer-bottom">
                <Link to="/" className="footer-bottom-brand">
                    <img src="/img/nvlogo.png" alt="Logo" />
                    <span>AgroFinanzas</span>
                </Link>
                <p className="footer-bottom-copy">
                    © {new Date().getFullYear()} AgroFinanzas · Hecho con 🌿 en Colombia
                    <a href="/terminos-condiciones">Política de privacidad</a>
                </p>
            </div>
        </footer>
    )
}