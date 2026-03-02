export interface ApiResponse<T> {
    data: T
    message?: string
    success?: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface ApiError {
    message: string
    errors?: Record<string, string[]>
}

export interface Notification {
    id: number
    message: string
    is_read: boolean
    created_at: string
    from_user?: {
        id: number
        name: string
        profile_photo: string | null
    }
}

export interface NotificationsResponse {
    notifications: Notification[]
    unread_count: number
}
