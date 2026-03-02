import { axiosClient } from '@shared/services/api/axiosClient'

export interface Comment {
    id: number
    user?: { id: number; name: string; avatar_url?: string } | null
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
    user?: { id: number; name: string; avatar_url?: string } | null
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
