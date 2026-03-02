import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar/Navbar'
import { Footer } from './Footer/Footer'
import { useAuth } from '@shared/context/AuthContext'
import { setupInterceptors } from '@shared/services/api/interceptors'
import { useNavigate } from 'react-router-dom'

export function MainLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [scrollVisible, setScrollVisible] = useState(false)

    // ── Setup interceptors once ──
    useEffect(() => {
        setupInterceptors(() => {
            logout()
            navigate('/login')
        })
    }, [logout, navigate])

    // ── Scroll-to-top button ──
    useEffect(() => {
        const handler = () => {
            setScrollVisible(window.scrollY > 300)
        }
        window.addEventListener('scroll', handler, { passive: true })
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    // ── Botpress chatbot ──
    useEffect(() => {
        const script1 = document.createElement('script')
        script1.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
        script1.async = true

        script1.onload = () => {
            const script2 = document.createElement('script')
            script2.src = 'https://files.bpcontent.cloud/2026/02/20/02/20260220025835-TCFBNR78.js'
            script2.defer = true
            document.body.appendChild(script2)
        }

        document.body.appendChild(script1)

        return () => {
            document.body.removeChild(script1)
            const script2 = document.querySelector(`script[src="https://files.bpcontent.cloud/2026/02/20/02/20260220025835-TCFBNR78.js"]`)
            if (script2) document.body.removeChild(script2)
        }
    }, [])

    return (
        <>
            <Navbar />
            <main className="flex-grow-1" style={{ paddingTop: '74px' }}>
                <Outlet />
            </main>
            <Footer />

            {/* Scroll-to-top button */}
            <button
                className={`scroll-top-btn ${scrollVisible ? 'visible' : ''}`}
                aria-label="Volver arriba"
                onClick={scrollToTop}
            >
                <i className="fas fa-chevron-up"></i>
            </button>
        </>
    )
}
