import { useState, useEffect, useCallback } from 'react'
import { recommendationsService } from '../services/recommendationsService'
import type { Comment } from '../services/recommendationsService'
import { timeAgoEs as formatDistanceToNow } from '@shared/utils/timeAgo'
import { useAuth } from '@shared/context/AuthContext'
import './RecommendationsIndex.css'

const CATEGORIES = ['Todos', 'Recomendación', 'Opinión', 'Duda', 'Problema']

// Extrae la URL de foto revisando `profile_photo` primero (campo real del backend Laravel),
// luego `avatar_url` como fallback por compatibilidad.
function getUserPhoto(user?: { profile_photo?: string; avatar_url?: string } | null): string | null {
    if (!user) return null
    return user.profile_photo || user.avatar_url || null
}

// ── Componente de avatar reutilizable ──────────────────────
function UserAvatar({
    user,
    size = 'md',
    fallbackSrc,
}: {
    user?: { name?: string; profile_photo?: string; avatar_url?: string } | null
    size?: 'sm' | 'md'
    fallbackSrc?: string
}) {
    const [imgError, setImgError] = useState(false)
    const photo = getUserPhoto(user)
    const name = user?.name || 'A'
    const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    const className = `comm-avatar${size === 'sm' ? ' comm-avatar--sm' : ''}`

    // Resetea el error cuando cambia la URL (p.ej. el usuario actualiza su foto)
    useEffect(() => { setImgError(false) }, [photo, fallbackSrc])

    const src = photo || fallbackSrc || null

    if (src && !imgError) {
        return (
            <img
                src={src}
                className={className}
                alt={name}
                onError={() => setImgError(true)}
            />
        )
    }

    // Fallback: círculo con iniciales
    return (
        <div
            className={className}
            style={{
                background: 'var(--accent)',
                color: '#0d0f0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: size === 'sm' ? '0.65rem' : '0.82rem',
            }}
        >
            {initials}
        </div>
    )
}

// ══════════════════════════════════════════════════════════
export default function RecommendationsIndex() {
    const { user } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [newContent, setNewContent] = useState('')
    const [newCategory, setNewCategory] = useState('Recomendación')
    const [submitting, setSubmitting] = useState(false)
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const loadComments = useCallback(async () => {
        try {
            const cat = activeCategory === 'Todos' ? undefined : activeCategory
            const data = await recommendationsService.getComments(cat)
            setComments(data.comments || [])
        } catch {
            /* silently fail */
        } finally {
            setLoading(false)
        }
    }, [activeCategory])

    useEffect(() => { loadComments() }, [loadComments])

    const handlePost = async () => {
        if (!newContent.trim()) return
        setSubmitting(true)
        try {
            await recommendationsService.createComment({ content: newContent, category: newCategory })
            setNewContent('')
            await loadComments()
        } catch { /* */ }
        setSubmitting(false)
    }

    const handleReply = async (commentId: number) => {
        if (!replyContent.trim()) return
        try {
            await recommendationsService.replyToComment(commentId, replyContent)
            setReplyContent('')
            setReplyingTo(null)
            await loadComments()
        } catch { /* */ }
    }

    const handleLike = async (commentId: number) => {
        try {
            await recommendationsService.likeComment(commentId)
            await loadComments()
        } catch { /* */ }
    }

    const getTagClass = (cat: string) => {
        const c = cat.toLowerCase()
        if (c.includes('reco')) return 'comm-tag--recomendacion'
        if (c.includes('opin')) return 'comm-tag--opinion'
        if (c.includes('duda')) return 'comm-tag--duda'
        if (c.includes('prob')) return 'comm-tag--problema'
        return 'comm-tag--opinion'
    }

    const getDotClass = (cat: string) => {
        const c = cat.toLowerCase()
        if (c.includes('reco')) return 'cat-dot--recomendacion'
        if (c.includes('opin')) return 'cat-dot--opinion'
        if (c.includes('duda')) return 'cat-dot--duda'
        if (c.includes('prob')) return 'cat-dot--problema'
        return 'cat-dot--opinion'
    }

    return (
        <div className="reco-container">
            <div className="comm-bg">

                {/* HERO */}
                <header className="comm-hero">
                    <div className="comm-hero__inner">
                        <div className="comm-hero__icon">
                            <i className="fas fa-users-viewfinder"></i>
                        </div>
                        <div>
                            <h1 className="comm-hero__title">Comunidad</h1>
                            <p className="comm-hero__sub">Espacio para compartir conocimiento agrícola</p>
                        </div>
                    </div>
                    <div className="comm-hero__stats">
                        <div className="comm-stat">
                            <i className="fas fa-comment"></i>
                            <span>{comments.length}</span>
                            <small>Posts</small>
                        </div>
                        <div className="comm-stat">
                            <i className="fas fa-user-friends"></i>
                            <span>...</span>
                            <small>Miembros</small>
                        </div>
                    </div>
                </header>

                <div className="comm-layout">
                    <main className="comm-main">

                        {/* COMPOSE */}
                        <div className="comm-compose">
                            <div className="comm-compose__header">
                                {/* Avatar del usuario autenticado — usa profile_photo del AuthContext */}
                                <UserAvatar
                                    user={user as any}
                                    size="md"
                                    fallbackSrc="/img/foto_perfil.jpg"
                                />
                                <span className="comm-compose__prompt">
                                    ¿Qué hay de nuevo, {user?.name?.split(' ')[0]}?
                                </span>
                            </div>
                            <div className="comm-compose__form">
                                <textarea
                                    className="comm-textarea"
                                    placeholder="Comparte una recomendación, duda o comentario con otros agricultores..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                />
                                <div className="comm-compose__footer">
                                    <div className="cat-selector">
                                        {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                                            <button
                                                key={c}
                                                className={`cat-btn ${newCategory === c ? 'active' : ''}`}
                                                onClick={() => setNewCategory(c)}
                                            >
                                                <span className={`cat-dot ${getDotClass(c)}`}></span>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="comm-compose__actions">
                                        <button className="comm-media-btn">
                                            <i className="fas fa-image"></i> Adjuntar imagen
                                        </button>
                                        <button
                                            className="comm-submit-btn"
                                            onClick={handlePost}
                                            disabled={submitting || !newContent.trim()}
                                        >
                                            {submitting
                                                ? <i className="fas fa-spinner fa-spin"></i>
                                                : <i className="fas fa-paper-plane"></i>
                                            }
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FILTERS */}
                        <div className="comm-filters">
                            <span className="comm-filters__label">
                                <i className="fas fa-filter"></i> Filtrar por:
                            </span>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* FEED */}
                        <div className="comm-feed">
                            {loading ? (
                                <div className="comm-empty">
                                    <div className="comm-empty__icon">
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </div>
                                    <h3>Cargando comunidad...</h3>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="comm-empty">
                                    <div className="comm-empty__icon">
                                        <i className="fas fa-comment-slash"></i>
                                    </div>
                                    <h3>No hay publicaciones aún</h3>
                                    <p>¡Sé el primero en compartir algo con la comunidad!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <article className="comm-post" key={comment.id}>
                                        <div className="comm-post__head">
                                            <div className="comm-post__author">
                                                {/* Avatar del autor — `profile_photo` viene del backend Laravel */}
                                                <UserAvatar user={comment.user} size="md" />
                                                <div className="comm-post__author-info">
                                                    <span className="comm-post__author-name">
                                                        {comment.user?.name || 'Usuario Anónimo'}
                                                    </span>
                                                    <span className="comm-post__date">
                                                        {formatDistanceToNow(comment.created_at)}
                                                        <span className="comm-post__date-full"> · Público</span>
                                                    </span>
                                                </div>
                                            </div>
                                            {comment.category && (
                                                <span className={`comm-tag ${getTagClass(comment.category)}`}>
                                                    {comment.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="comm-post__text">
                                            {comment.content}
                                        </div>

                                        <div className="comm-post__foot">
                                            <div className="comm-reply-count">
                                                <i
                                                    className="fas fa-heart"
                                                    style={{
                                                        color: comment.liked_by_user ? '#ef4444' : 'inherit',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => handleLike(comment.id)}
                                                ></i>
                                                {comment.likes_count || 0} Likes
                                                <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                                                <i className="fas fa-comment"></i>
                                                {comment.replies_count || 0} Respuestas
                                            </div>
                                            <button
                                                className={`comm-reply-btn ${replyingTo === comment.id ? 'active' : ''}`}
                                                onClick={() => setReplyingTo(
                                                    replyingTo === comment.id ? null : comment.id
                                                )}
                                            >
                                                <i className="fas fa-reply"></i>
                                                Responder
                                            </button>
                                        </div>

                                        {/* REPLY BOX */}
                                        {replyingTo === comment.id && (
                                            <div className="comm-reply-box">
                                                <div className="comm-reply-box__inner">
                                                    {/* Avatar del usuario que responde */}
                                                    <UserAvatar
                                                        user={user as any}
                                                        size="sm"
                                                        fallbackSrc="/img/foto_perfil.jpg"
                                                    />
                                                    <div className="comm-reply-box__fields">
                                                        <textarea
                                                            className="comm-textarea comm-textarea--sm"
                                                            placeholder="Escribe tu respuesta..."
                                                            value={replyContent}
                                                            onChange={e => setReplyContent(e.target.value)}
                                                        />
                                                        <div className="comm-reply-box__actions">
                                                            <button
                                                                className="comm-submit-btn comm-submit-btn--sm"
                                                                onClick={() => handleReply(comment.id)}
                                                                disabled={!replyContent.trim()}
                                                            >
                                                                Responder
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* NESTED REPLIES */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="comm-replies">
                                                {comment.replies.map(reply => (
                                                    <div className="comm-reply" key={reply.id}>
                                                        {/* Avatar del autor de la respuesta */}
                                                        <UserAvatar user={reply.user} size="sm" />
                                                        <div className="comm-reply__bubble">
                                                            <div className="comm-reply__meta">
                                                                <span className="comm-reply__name">
                                                                    {reply.user?.name || 'Anónimo'}
                                                                </span>
                                                                <span className="comm-reply__time">
                                                                    {formatDistanceToNow(reply.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className="comm-reply__text">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))
                            )}
                        </div>
                    </main>

                    {/* SIDEBAR */}
                    <aside className="comm-sidebar">
                        <div className="comm-widget">
                            <h3 className="comm-widget__title">
                                <i className="fas fa-list-ul"></i> Categorías
                            </h3>
                            <ul className="comm-cat-guide">
                                <li>
                                    <span className="cat-dot cat-dot--recomendacion"></span>
                                    <div>
                                        <strong>Recomendación</strong>
                                        <small>Consejos técnicos y tips.</small>
                                    </div>
                                </li>
                                <li>
                                    <span className="cat-dot cat-dot--opinion"></span>
                                    <div>
                                        <strong>Opinión</strong>
                                        <small>Debates y puntos de vista.</small>
                                    </div>
                                </li>
                                <li>
                                    <span className="cat-dot cat-dot--duda"></span>
                                    <div>
                                        <strong>Duda</strong>
                                        <small>Preguntas a la comunidad.</small>
                                    </div>
                                </li>
                                <li>
                                    <span className="cat-dot cat-dot--problema"></span>
                                    <div>
                                        <strong>Problema</strong>
                                        <small>Alertas o dificultades.</small>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="comm-widget">
                            <h3 className="comm-widget__title">
                                <i className="fas fa-shield-halved"></i> Normas
                            </h3>
                            <ul className="comm-tips">
                                <li><i className="fas fa-check"></i> Sé respetuoso con todos.</li>
                                <li><i className="fas fa-check"></i> Comparte info verídica.</li>
                                <li><i className="fas fa-check"></i> Ayuda si conoces la respuesta.</li>
                                <li><i className="fas fa-check"></i> Evita el spam comercial.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}