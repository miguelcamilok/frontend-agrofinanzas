export interface User {
    id: number
    name: string
    email: string
    role: string
    profile_photo: string | null
    profile_photo_url?: string | null
    birth_date?: string
    gender?: 'male' | 'female' | 'other'
    experience_years?: number
    phone?: string
    created_at?: string
    updated_at?: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

export interface LoginCredentials {
    email: string
    password: string
    remember?: boolean
}

export interface RegisterData {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
    department?: string
    city?: string
}

export interface AdminCredentials {
    email: string
    password: string
}

export interface AdminUser {
    id: number
    name: string
    email: string
    role: string
}
