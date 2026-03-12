import { axiosClient } from '@shared/services/api/axiosClient'

export interface CommentUser {
    id: number
    name: string
    profile_photo?: string
    avatar_url?: string
}

export interface Comment {
    id: number
    user?: CommentUser | null
    // ✅ El backend retorna "text", no "content"
    text: string
    content?: string          // alias por compatibilidad (ver getter abajo)
    category?: string
    media_url?: string | null
    media_type?: string | null
    replies?: Reply[]
    replies_count?: number
    liked_by_user?: boolean
    likes_count?: number
    created_at: string
}

export interface Reply {
    id: number
    user?: CommentUser | null
    // ✅ El backend retorna "text"
    text: string
    content?: string
    media_url?: string | null
    media_type?: string | null
    created_at: string
}

export interface CommentPayload {
    content: string
    category?: string
    mediaFile?: File | null
}

// ── Helper: normaliza un comentario del backend ──────────────
// El backend usa "text", el componente puede usar indistintamente
// comment.text o comment.content gracias a este mapper.
function normalizeComment(raw: any): Comment {
    return {
        ...raw,
        text:          raw.text ?? raw.content ?? '',
        content:       raw.text ?? raw.content ?? '',   // alias
        replies_count: raw.replies?.length ?? raw.replies_count ?? 0,
        likes_count:   raw.likes_count   ?? 0,
        liked_by_user: raw.liked_by_user ?? false,
        replies:       (raw.replies ?? []).map((r: any) => normalizeReply(r)),
    }
}

function normalizeReply(raw: any): Reply {
    return {
        ...raw,
        text:    raw.text ?? raw.content ?? '',
        content: raw.text ?? raw.content ?? '',
    }
}

export const recommendationsService = {

    // ── GET comments ────────────────────────────────────────
    async getComments(category?: string) {
        const params = category ? { category } : {}
        const { data } = await axiosClient.get<{ comments: any[] }>('/comments', { params })
        return {
            comments: (data.comments ?? []).map(normalizeComment),
        }
    },

    // ── POST comment ────────────────────────────────────────
    // ✅ El backend lee "text", no "content"
    async createComment(payload: CommentPayload) {
        if (payload.mediaFile) {
            const form = new FormData()
            form.append('text',       payload.content)        // ← "text" para el backend
            form.append('category',   payload.category ?? 'Recomendación')
            form.append('media_file', payload.mediaFile)

            const { data } = await axiosClient.post<{ comment: any }>('/comments', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return { comment: normalizeComment(data.comment) }
        }

        const { data } = await axiosClient.post<{ comment: any }>('/comments', {
            text:     payload.content,                        // ← "text" para el backend
            category: payload.category ?? 'Recomendación',
        })
        return { comment: normalizeComment(data.comment) }
    },

    // ── POST reply ──────────────────────────────────────────
    async replyToComment(commentId: number, content: string, mediaFile?: File | null) {
        if (mediaFile) {
            const form = new FormData()
            form.append('text',       content)                // ← "text" para el backend
            form.append('category',   'Opinión')
            form.append('media_file', mediaFile)

            const { data } = await axiosClient.post<{ comment: any }>(
                `/comments/${commentId}/reply`, form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return { comment: normalizeComment(data.comment) }
        }

        const { data } = await axiosClient.post<{ comment: any }>(
            `/comments/${commentId}/reply`,
            { text: content, category: 'Opinión' }            // ← "text"
        )
        return { comment: normalizeComment(data.comment) }
    },

    // ── POST like ───────────────────────────────────────────
    async likeComment(commentId: number) {
        const { data } = await axiosClient.post<{
            liked: boolean
            likes_count: number
        }>(`/comments/${commentId}/like`)
        return data
    },

    // ── DELETE comment ──────────────────────────────────────
    async deleteComment(commentId: number) {
        await axiosClient.delete(`/comments/${commentId}`)
    },

    // ── GET liked ───────────────────────────────────────────
    async getLikedRecommendations() {
        const { data } = await axiosClient.get<{ comments: any[] }>('/comments/liked')
        return (data.comments ?? []).map(normalizeComment)
    },
}