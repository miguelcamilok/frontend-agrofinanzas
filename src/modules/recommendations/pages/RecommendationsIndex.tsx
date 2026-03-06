import { useState, useEffect, useCallback, useRef } from 'react'
import { recommendationsService } from '../services/recommendationsService'
import type { Comment } from '../services/recommendationsService'
import { timeAgoEs as formatDistanceToNow } from '@shared/utils/timeAgo'
import { useAuth } from '@shared/context/AuthContext'
import './RecommendationsIndex.css'

const CATEGORIES = ['Todos', 'Recomendación', 'Opinión', 'Duda', 'Problema']

/* ── Extrae URL de foto ──────────────────────────────────── */
function getUserPhoto(user?: { profile_photo?: string; avatar_url?: string } | null): string | null {
    if (!user) return null
    return user.profile_photo || user.avatar_url || null
}

/* ── Avatar ──────────────────────────────────────────────── */
function UserAvatar({
    user, size = 'md', fallbackSrc,
}: {
    user?: { name?: string; profile_photo?: string; avatar_url?: string } | null
    size?: 'sm' | 'md'
    fallbackSrc?: string
}) {
    const [imgError, setImgError] = useState(false)
    const photo  = getUserPhoto(user)
    const name   = user?.name || 'A'
    const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    const cls    = `comm-avatar${size === 'sm' ? ' comm-avatar--sm' : ''}`

    useEffect(() => { setImgError(false) }, [photo, fallbackSrc])

    const src = photo || fallbackSrc || null
    if (src && !imgError)
        return <img src={src} className={cls} alt={name} onError={() => setImgError(true)} />

    const palette = ['#6B3D14', '#A0522D', '#4A7C3F', '#5B8DB8', '#D4841A']
    return (
        <div className={cls} style={{
            background: palette[name.charCodeAt(0) % palette.length],
            color: '#F5EDD6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: size === 'sm' ? '.65rem' : '.82rem',
        }}>
            {initials}
        </div>
    )
}

/* ════════════════════════════════════════════════════════════
   Hook: selección local de imagen (SIN subida anticipada).
   El archivo se guarda en estado y se envía junto al post.
════════════════════════════════════════════════════════════ */
function useMediaPicker() {
    const [file, setFile]       = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError]     = useState<string | null>(null)
    const ref = useRef<HTMLInputElement>(null)

    const open = () => ref.current?.click()

    const pick = (f: File) => {
        if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
            setError('Solo se permiten imágenes o videos.'); return
        }
        if (f.size > 10 * 1024 * 1024) {
            setError('El archivo no puede superar los 10 MB.'); return
        }
        setError(null)
        setFile(f)
        const reader = new FileReader()
        reader.onload = e => setPreview(e.target?.result as string)
        reader.readAsDataURL(f)
    }

    const clear = () => {
        setFile(null); setPreview(null); setError(null)
        if (ref.current) ref.current.value = ''
    }

    const input = (
        <input
            ref={ref} type="file" accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) pick(f) }}
        />
    )

    return { file, preview, error, open, clear, input }
}

/* ── Helpers ─────────────────────────────────────────────── */
function tagClass(cat: string) {
    const c = cat.toLowerCase()
    if (c.includes('reco')) return 'comm-tag--recomendacion'
    if (c.includes('opin')) return 'comm-tag--opinion'
    if (c.includes('duda')) return 'comm-tag--duda'
    if (c.includes('prob')) return 'comm-tag--problema'
    return 'comm-tag--opinion'
}
function dotClass(cat: string) {
    const c = cat.toLowerCase()
    if (c.includes('reco')) return 'cat-dot--recomendacion'
    if (c.includes('opin')) return 'cat-dot--opinion'
    if (c.includes('duda')) return 'cat-dot--duda'
    if (c.includes('prob')) return 'cat-dot--problema'
    return 'cat-dot--opinion'
}

const PULSO = [
    { label: 'Fumigación maíz',   posts: 47, pct: 92 },
    { label: 'Vacunación aftosa', posts: 38, pct: 75 },
    { label: 'Precio del café',   posts: 31, pct: 61 },
    { label: 'Subsidios FINAGRO', posts: 24, pct: 47 },
]

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function RecommendationsIndex() {
    const { user } = useAuth()
    const [comments, setComments]             = useState<Comment[]>([])
    const [loading, setLoading]               = useState(true)
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [newContent, setNewContent]         = useState('')
    const [newCategory, setNewCategory]       = useState('Recomendación')
    const [submitting, setSubmitting]         = useState(false)
    const [replyingTo, setReplyingTo]         = useState<number | null>(null)
    const [replyContent, setReplyContent]     = useState('')

    // Pickers de imagen (uno para post, uno para respuesta)
    const mainPicker  = useMediaPicker()
    const replyPicker = useMediaPicker()

    /* ── Carga comentarios ── */
    const loadComments = useCallback(async () => {
        try {
            const cat = activeCategory === 'Todos' ? undefined : activeCategory
            const data = await recommendationsService.getComments(cat)
            setComments(data.comments || [])
        } catch { /* */ }
        finally { setLoading(false) }
    }, [activeCategory])

    useEffect(() => { loadComments() }, [loadComments])

    /* ── Publicar post ── */
    const handlePost = async () => {
        if (!newContent.trim() && !mainPicker.file) return
        setSubmitting(true)
        try {
            await recommendationsService.createComment({
                content:   newContent,
                category:  newCategory,
                mediaFile: mainPicker.file,
            })
            setNewContent(''); mainPicker.clear()
            await loadComments()
        } catch { /* */ }
        finally { setSubmitting(false) }
    }

    /* ── Responder ── */
    const handleReply = async (commentId: number) => {
        if (!replyContent.trim() && !replyPicker.file) return
        try {
            await recommendationsService.replyToComment(commentId, replyContent, replyPicker.file)
            setReplyContent(''); setReplyingTo(null); replyPicker.clear()
            await loadComments()
        } catch { /* */ }
    }

    const handleLike = async (id: number) => {
        try { await recommendationsService.likeComment(id); await loadComments() }
        catch { /* */ }
    }

    const cancelReply = () => { setReplyingTo(null); setReplyContent(''); replyPicker.clear() }

    /* ════ RENDER ════ */
    return (
        <div className="reco-container">
            <div className="comm-bg">

                {/* ══ HERO ══ */}
                <header className="comm-hero">
                    <div className="comm-hero__inner">
                        <div className="comm-hero__left">
                            <div className="comm-hero__eyebrow">AgroFinanzas · Comunidad</div>
                            <h1 className="comm-hero__title">El Campo<br /><em>Conversa</em></h1>
                            <p className="comm-hero__sub">
                                Espacio abierto para ganaderos, cultivadores y productores
                                rurales que comparten conocimiento del campo colombiano.
                            </p>
                        </div>
                        <div className="comm-hero__stats">
                            <div className="comm-stat">
                                <i className="fas fa-comment-dots"></i>
                                <span>{comments.length}</span>
                                <small>Posts</small>
                            </div>
                            <div className="comm-stat">
                                <i className="fas fa-users"></i>
                                <span>—</span>
                                <small>Miembros</small>
                            </div>
                            <div className="comm-stat">
                                <i className="fas fa-seedling"></i>
                                <span>4</span>
                                <small>Temas</small>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="comm-layout">
                    <main className="comm-main">

                        {/* ── COMPOSE ── */}
                        <div className="comm-compose">
                            {mainPicker.input}
                            <div className="comm-compose__header">
                                <UserAvatar user={user as any} size="md" fallbackSrc="/img/foto_perfil.jpg" />
                                <span className="comm-compose__prompt">
                                    ¿Qué tienes para compartir, {user?.name?.split(' ')[0] || 'amigo'}?
                                </span>
                            </div>
                            <div className="comm-compose__form">
                                <textarea
                                    className="comm-textarea"
                                    placeholder="Comparte una recomendación, duda o comentario con otros productores..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                />

                                {/* Preview imagen */}
                                {(mainPicker.preview || mainPicker.error) && (
                                    <div className="comm-media-preview">
                                        {mainPicker.preview && (
                                            <div className="comm-media-preview__img-wrap">
                                                <img src={mainPicker.preview} alt="Preview" />
                                                {submitting && (
                                                    <div className="comm-media-preview__overlay">
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                        <span>Subiendo...</span>
                                                    </div>
                                                )}
                                                <button className="comm-media-preview__remove" onClick={mainPicker.clear}>
                                                    <i className="fas fa-xmark"></i>
                                                </button>
                                            </div>
                                        )}
                                        {mainPicker.error && (
                                            <p className="comm-upload-error">
                                                <i className="fas fa-triangle-exclamation"></i> {mainPicker.error}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="comm-compose__footer">
                                    <div className="cat-selector">
                                        {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                                            <button
                                                key={c}
                                                className={`cat-btn ${newCategory === c ? 'active' : ''}`}
                                                onClick={() => setNewCategory(c)}
                                            >
                                                <span className={`cat-dot ${dotClass(c)}`}></span>{c}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="comm-compose__actions">
                                        <button
                                            className={`comm-media-btn ${mainPicker.file ? 'has-file' : ''}`}
                                            onClick={mainPicker.open}
                                            disabled={submitting}
                                        >
                                            <i className="fas fa-image"></i>
                                            {mainPicker.file ? mainPicker.file.name.slice(0, 18) + '…' : 'Adjuntar imagen'}
                                        </button>
                                        <button
                                            className="comm-submit-btn"
                                            onClick={handlePost}
                                            disabled={submitting || (!newContent.trim() && !mainPicker.file)}
                                        >
                                            {submitting
                                                ? <><i className="fas fa-spinner fa-spin"></i> Publicando...</>
                                                : <><i className="fas fa-paper-plane"></i> Publicar</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── FILTROS ── */}
                        <div className="comm-filters">
                            <span className="comm-filters__label"><i className="fas fa-filter"></i> Filtrar:</span>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >{cat}</button>
                            ))}
                        </div>

                        {/* ── FEED ── */}
                        <div className="comm-feed">
                            {loading ? (
                                <div className="comm-empty">
                                    <div className="comm-empty__icon"><i className="fas fa-spinner fa-spin"></i></div>
                                    <h3>Cargando la comunidad...</h3>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="comm-empty">
                                    <div className="comm-empty__icon"><i className="fas fa-feather"></i></div>
                                    <h3>Aún no hay publicaciones</h3>
                                    <p>¡Sé el primero en compartir algo con la comunidad del campo!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <article className="comm-post" key={comment.id} data-cat={comment.category || ''}>

                                        {/* Cabecera */}
                                        <div className="comm-post__head">
                                            <div className="comm-post__author">
                                                <UserAvatar user={comment.user} size="md" />
                                                <div className="comm-post__author-info">
                                                    <span className="comm-post__author-name">
                                                        {comment.user?.name || 'Productor Anónimo'}
                                                    </span>
                                                    <span className="comm-post__date">
                                                        {formatDistanceToNow(comment.created_at)}
                                                        <span className="comm-post__date-sep">·</span>
                                                        <span className="comm-post__date-pub">Público</span>
                                                    </span>
                                                </div>
                                            </div>
                                            {comment.category && (
                                                <span className={`comm-tag ${tagClass(comment.category)}`}>
                                                    {comment.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Texto */}
                                        <div className="comm-post__text">{comment.content}</div>

                                        {/* Imagen adjunta */}
                                        {comment.media_url && comment.media_type?.startsWith('image') && (
                                            <div className="comm-post__media">
                                                <img
                                                    src={comment.media_url}
                                                    alt="Imagen adjunta"
                                                    className="comm-media-img"
                                                    onClick={() => window.open(comment.media_url!, '_blank')}
                                                />
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="comm-post__foot">
                                            <div className="comm-reply-count">
                                                <button
                                                    className={`comm-like-btn ${comment.liked_by_user ? 'liked' : ''}`}
                                                    onClick={() => handleLike(comment.id)}
                                                >
                                                    <i className={`${comment.liked_by_user ? 'fas' : 'far'} fa-heart`}></i>
                                                    {comment.likes_count || 0}
                                                </button>
                                                <span className="comm-reply-count__sep">·</span>
                                                <span className="comm-reply-count__item">
                                                    <i className="fas fa-comment"></i>
                                                    {comment.replies_count || 0} Respuestas
                                                </span>
                                            </div>
                                            <button
                                                className={`comm-reply-btn ${replyingTo === comment.id ? 'active' : ''}`}
                                                onClick={() => replyingTo === comment.id ? cancelReply() : setReplyingTo(comment.id)}
                                            >
                                                <i className="fas fa-reply"></i> Responder
                                            </button>
                                        </div>

                                        {/* Reply box */}
                                        {replyingTo === comment.id && (
                                            <div className="comm-reply-box">
                                                {replyPicker.input}
                                                <div className="comm-reply-box__inner">
                                                    <div className="comm-reply-box__thread"></div>
                                                    <UserAvatar user={user as any} size="sm" fallbackSrc="/img/foto_perfil.jpg" />
                                                    <div className="comm-reply-box__fields">
                                                        <textarea
                                                            className="comm-textarea comm-textarea--sm"
                                                            placeholder="Escribe tu respuesta..."
                                                            value={replyContent}
                                                            onChange={e => setReplyContent(e.target.value)}
                                                            autoFocus
                                                        />

                                                        {(replyPicker.preview || replyPicker.error) && (
                                                            <div className="comm-media-preview comm-media-preview--sm">
                                                                {replyPicker.preview && (
                                                                    <div className="comm-media-preview__img-wrap">
                                                                        <img src={replyPicker.preview} alt="Preview" />
                                                                        <button className="comm-media-preview__remove" onClick={replyPicker.clear}>
                                                                            <i className="fas fa-xmark"></i>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {replyPicker.error && (
                                                                    <p className="comm-upload-error">
                                                                        <i className="fas fa-triangle-exclamation"></i> {replyPicker.error}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="comm-reply-box__actions">
                                                            <button
                                                                className={`comm-media-btn comm-media-btn--sm ${replyPicker.file ? 'has-file' : ''}`}
                                                                onClick={replyPicker.open}
                                                                title="Adjuntar imagen"
                                                            >
                                                                <i className="fas fa-image"></i>
                                                            </button>
                                                            <button className="comm-cancel-btn" onClick={cancelReply}>
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                className="comm-submit-btn comm-submit-btn--sm"
                                                                onClick={() => handleReply(comment.id)}
                                                                disabled={!replyContent.trim() && !replyPicker.file}
                                                            >
                                                                <i className="fas fa-paper-plane"></i> Responder
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Respuestas anidadas */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="comm-replies">
                                                {comment.replies.map((reply, idx) => (
                                                    <div className="comm-reply" key={reply.id}>
                                                        <div className={`comm-reply__connector ${idx === comment.replies!.length - 1 ? 'last' : ''}`}>
                                                            <div className="comm-reply__connector-line"></div>
                                                            <div className="comm-reply__connector-dot"></div>
                                                        </div>
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
                                                            {reply.media_url && reply.media_type?.startsWith('image') && (
                                                                <img
                                                                    src={reply.media_url}
                                                                    alt="Imagen adjunta"
                                                                    className="comm-reply__img"
                                                                    onClick={() => window.open(reply.media_url!, '_blank')}
                                                                />
                                                            )}
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

                    {/* ── SIDEBAR ── */}
                    <aside className="comm-sidebar">
                        <div className="comm-widget">
                            <h3 className="comm-widget__title"><i className="fas fa-list-ul"></i> Categorías</h3>
                            <ul className="comm-cat-guide">
                                <li><span className="cat-dot cat-dot--recomendacion"></span><div><strong>Recomendación</strong><small>Consejos técnicos y tips prácticos.</small></div></li>
                                <li><span className="cat-dot cat-dot--opinion"></span><div><strong>Opinión</strong><small>Debates y puntos de vista del sector.</small></div></li>
                                <li><span className="cat-dot cat-dot--duda"></span><div><strong>Duda</strong><small>Preguntas abiertas a la comunidad.</small></div></li>
                                <li><span className="cat-dot cat-dot--problema"></span><div><strong>Problema</strong><small>Alertas o dificultades del campo.</small></div></li>
                            </ul>
                        </div>
                        <div className="comm-widget">
                            <h3 className="comm-widget__title"><i className="fas fa-chart-line"></i> Pulso del Campo</h3>
                            <div className="comm-widget-pulso">
                                {PULSO.map((item, i) => (
                                    <div className="pulso-item" key={i}>
                                        <span className="pulso-rank">0{i + 1}</span>
                                        <div className="pulso-info">
                                            <strong>{item.label}</strong>
                                            <span>{item.posts} publicaciones</span>
                                        </div>
                                        <div className="pulso-bar">
                                            <div className="pulso-bar-fill" style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="comm-widget">
                            <h3 className="comm-widget__title"><i className="fas fa-shield-halved"></i> Normas</h3>
                            <ul className="comm-tips">
                                <li><i className="fas fa-check"></i> Trata a todos con respeto.</li>
                                <li><i className="fas fa-check"></i> Comparte información verídica.</li>
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