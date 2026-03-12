import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { recommendationsService } from '../services/recommendationsService'
import { timeAgoEs } from '@shared/utils/timeAgo'

export default function LikedRecommendations() {
    const [liked, setLiked]     = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        recommendationsService.getLikedRecommendations()
            .then(data => setLiked(data))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="ep-root">
            <div className="ep-bg">
                <div className="ep-bg__field"></div>
                <div className="ep-bg__overlay"></div>
                <div className="ep-bg__texture"></div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>

                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'transparent', border: '1px solid rgba(200,169,110,.2)',
                        borderRadius: 2, color: 'rgba(200,169,110,.5)',
                        padding: '7px 16px', cursor: 'pointer',
                        fontFamily: "'Source Sans 3', sans-serif",
                        fontSize: '.76rem', fontWeight: 600, marginBottom: 28,
                        transition: 'all .2s',
                    }}
                >
                    <i className="fas fa-arrow-left"></i> Volver al perfil
                </button>

                <div style={{ marginBottom: 32 }}>
                    <div style={{
                        fontSize: '.58rem', fontWeight: 700, letterSpacing: 4,
                        textTransform: 'uppercase', color: 'rgba(200,169,110,.5)',
                        marginBottom: 8,
                    }}>
                        AgroFinanzas · Mi Cuenta
                    </div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 900, color: '#F5EDD6',
                        letterSpacing: -2, lineHeight: .95,
                    }}>
                        Mis <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#C8A96E' }}>Likes</em>
                    </h1>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: 'rgba(200,169,110,.4)', padding: '60px 0' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                ) : liked.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        border: '1px dashed rgba(200,169,110,.15)', borderRadius: 4,
                        color: 'rgba(200,169,110,.4)',
                    }}>
                        <i className="fas fa-heart-crack" style={{ fontSize: '2rem', marginBottom: 16, display: 'block' }}></i>
                        Aún no has dado like a ninguna publicación.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {liked.map(rec => (
                            <div key={rec.id} style={{
                                background: 'rgba(245,237,214,.05)',
                                border: '1px solid rgba(200,169,110,.15)',
                                borderRadius: 3, padding: '18px 22px',
                                backdropFilter: 'blur(8px)',
                                transition: 'border-color .2s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{
                                        fontSize: '.6rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: 1.5,
                                        color: '#C8A96E', opacity: .6,
                                    }}>
                                        {rec.category}
                                    </span>
                                    <span style={{ fontSize: '.7rem', color: 'rgba(200,169,110,.3)' }}>
                                        {timeAgoEs(rec.created_at)}
                                    </span>
                                </div>
                                <p style={{
                                    fontSize: '.9rem', color: 'rgba(245,237,214,.7)',
                                    lineHeight: 1.7, marginBottom: 12,
                                }}>
                                    {rec.content}
                                </p>
                                {rec.media_url && (
                                    <img src={rec.media_url} alt="media"
                                        style={{
                                            width: '100%', maxHeight: 280,
                                            objectFit: 'cover', borderRadius: 3,
                                            marginBottom: 12,
                                            border: '1px solid rgba(200,169,110,.12)',
                                        }}
                                    />
                                )}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    fontSize: '.76rem', color: 'rgba(200,169,110,.4)',
                                }}>
                                    <i className="fas fa-user-circle"></i>
                                    {rec.user?.name || 'Anónimo'}
                                    <span style={{ opacity: .3 }}>·</span>
                                    <i className="fas fa-heart" style={{ color: '#c0392b' }}></i>
                                    {rec.likes_count || 0} likes
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
