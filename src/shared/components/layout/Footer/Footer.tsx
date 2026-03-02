import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">

                {/* ── CONTACTO ── */}
                <div className="footer-section">
                    <h3><i className="fas fa-phone-alt"></i> Contacto</h3>
                    <ul>
                        <li><i className="fas fa-chevron-right footer-list-ico"></i> +57 312 775 9123</li>
                        <li><i className="fas fa-chevron-right footer-list-ico"></i> +57 314 271 6135</li>
                        <li><i className="fas fa-chevron-right footer-list-ico"></i> +57 316 099 3123</li>
                        <li><i className="fas fa-chevron-right footer-list-ico"></i> +57 314 646 1709</li>
                    </ul>
                </div>

                {/* ── REDES + TÉRMINOS ── */}
                <div className="footer-section">
                    <h3><i className="fas fa-share-alt"></i> Redes Sociales</h3>

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
                        <i className="fas fa-shield-halved" style={{ color: 'rgba(138,201,38,0.4)', fontSize: '0.65rem' }}></i>
                        © {new Date().getFullYear()} &nbsp;|&nbsp; <a href="/terminos-condiciones">Términos de uso</a>
                    </p>

                    {/* Acceso admin oculto */}
                    <Link
                        to="/admin/login"
                        style={{ opacity: 0.06, fontSize: '0.4rem', color: '#333', textDecoration: 'none', marginTop: '4px' }}
                    >
                        ·
                    </Link>
                </div>

                {/* ── CORREOS ── */}
                <div className="footer-section">
                    <h3><i className="fas fa-envelope"></i> Correos</h3>
                    <ul>
                        <li><i className="fas fa-at footer-list-ico"></i> forcemenrtartu@gmail.com</li>
                        <li><i className="fas fa-at footer-list-ico"></i> luisestebannarvaez82@gmail.com</li>
                        <li><i className="fas fa-at footer-list-ico"></i> chicanganad9@gmail.com</li>
                        <li><i className="fas fa-at footer-list-ico"></i> elviracastrojuliandavid@gmail.com</li>
                    </ul>
                </div>

            </div>
        </footer>
    )
}
