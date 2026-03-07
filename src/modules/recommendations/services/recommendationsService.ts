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
    content: string
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
    content: string
    media_url?: string | null
    media_type?: string | null
    created_at: string
}

export interface CommentPayload {
    content: string
    category?: string
    mediaFile?: File | null   // archivo local → se envía como multipart/form-data
}

export const recommendationsService = {
    async getComments(category?: string) {
        const params = category ? { category } : {}
        const { data } = await axiosClient.get<{ comments: Comment[] }>('/comments', { params })
        return data
    },

    /**
     * Crea un comentario.
     * - Con imagen  → FormData  (el backend lee `media_file`)
     * - Sin imagen  → JSON plano
     */
    async createComment(payload: CommentPayload) {
        if (payload.mediaFile) {
            const form = new FormData()
            form.append('content',    payload.content)
            form.append('category',   payload.category ?? 'Recomendación')
            form.append('media_file', payload.mediaFile)

            const { data } = await axiosClient.post<{ comment: Comment }>('/comments', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            return data
        }

        const { data } = await axiosClient.post<{ comment: Comment }>('/comments', {
            content:  payload.content,
            category: payload.category ?? 'Recomendación',
        })
        return data
    },

    /**
     * Responde a un comentario.
     * - Con imagen  → FormData  (el backend lee `media_file` en store())
     * - Sin imagen  → JSON plano
     */
    async replyToComment(commentId: number, content: string, mediaFile?: File | null) {
        if (mediaFile) {
            const form = new FormData()
            form.append('content',    content)
            form.append('category',   'Opinión')   // requerido por el backend
            form.append('media_file', mediaFile)

            const { data } = await axiosClient.post<{ comment: Comment }>(
                `/comments/${commentId}/reply`, form,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return data
        }

        const { data } = await axiosClient.post<{ comment: Comment }>(
            `/comments/${commentId}/reply`,
            { content, category: 'Opinión' }
        )
        return data
    },

    async likeComment(commentId: number) {
        const { data } = await axiosClient.post<{ liked: boolean }>(`/comments/${commentId}/like`)
        return data
    },

    async deleteComment(commentId: number) {
        await axiosClient.delete(`/comments/${commentId}`)
    },
    async getLikedRecommendations() {
    const { data } = await axiosClient.get<{
        liked_recommendations: Comment[]
    }>('/recommendations/liked')
    return data.liked_recommendations ?? []
},
}