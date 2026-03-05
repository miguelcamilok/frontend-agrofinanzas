import { axiosClient } from '@shared/services/api/axiosClient'
import type { User } from '@shared/types/auth.types'

export interface LoginResponse {
    success: boolean
    token: string
    user: User
    message?: string
}

export interface RegisterResponse {
    success: boolean
    user_id: number
    email: string
    message?: string
    errors?: Record<string, string[]>
}

export interface VerifyResponse {
    success: boolean
    redirect?: string
    token?: string
    user?: User
    message?: string
}

export const authService = {
    async login(email: string, password: string, remember: boolean): Promise<LoginResponse> {
        const { data } = await axiosClient.post<LoginResponse>('/login', { email, password, remember })
        return data
    },

    async register(formData: FormData): Promise<RegisterResponse> {
        const { data } = await axiosClient.post<RegisterResponse>('/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    async verifyCode(userId: number, code: string): Promise<VerifyResponse> {
        const { data } = await axiosClient.post<VerifyResponse>('/verify-code', { user_id: userId, code })
        return data
    },

    async resendCode(userId: number): Promise<{ success: boolean; message?: string }> {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/resend-code', { user_id: userId })
        return data
    },

    async logout(): Promise<void> {
        await axiosClient.post('/logout')
    },
    async forgotPassword(email: string): Promise<{ success: boolean; message: string; user_id?: number; email?: string }> {
    const { data } = await axiosClient.post('/forgot-password', { email })
    return data
},

async resetPassword(userId: number, code: string, password: string, passwordConfirmation: string): Promise<{ success: boolean; message: string; expired?: boolean }> {
    const { data } = await axiosClient.post('/reset-password', {
        user_id: userId,
        code,
        password,
        password_confirmation: passwordConfirmation,
    })
    return data
},
}

