import { axiosClient } from '@shared/services/api/axiosClient'

// El backend (AuthController) guarda y devuelve la foto como `profile_photo`.
// Mantenemos avatar_url como alias por compatibilidad.
export interface CommentUser {
    id: number
    name: string
    profile_photo?: string    // ← campo real del backend (AuthController / User model)
    avatar_url?: string       // alias por si algún endpoint lo serializa distinto
}

export interface Comment {
    id: number
    user?: CommentUser | null
    content: string
    category?: string
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
    created_at: string
}

export interface CommentPayload {
    content: string
    category?: string
}

export const recommendationsService = {
    async getComments(category?: string) {
        const params = category ? { category } : {}
        const { data } = await axiosClient.get<{ comments: Comment[] }>('/comments', { params })
        return data
    },
    async createComment(payload: CommentPayload) {
        const { data } = await axiosClient.post<{ comment: Comment }>('/comments', payload)
        return data
    },
    async replyToComment(commentId: number, content: string) {
        const { data } = await axiosClient.post<{ reply: Reply }>(`/comments/${commentId}/reply`, { content })
        return data
    },
    async likeComment(commentId: number) {
        const { data } = await axiosClient.post<{ liked: boolean }>(`/comments/${commentId}/like`)
        return data
    },
    async deleteComment(commentId: number) {
        await axiosClient.delete(`/comments/${commentId}`)
    },
}