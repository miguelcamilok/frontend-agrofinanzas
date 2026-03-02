import { axiosClient } from '@shared/services/api/axiosClient'

export interface AdminUser {
    id: number
    name: string
    email: string
    profile_photo?: string
    is_active: boolean
    finances_count: number
    cattle_count: number
    recommendations_count: number
    created_at: string
}

export interface DashboardStats {
    total_users: number
    active_users: number
    total_finances: number
    total_comments: number
    total_income: number
    total_expense: number
}

export interface FinanceRecord {
    id: number
    date: string
    type: string
    amount: number
    category: string
    description: string
    user?: { id: number; name: string }
}

export interface FinanceSummary {
    total_income: number
    total_expense: number
    total_investment: number
    total_debt: number
    total_inventory: number
    balance: number
    records: number
}

export interface AdminComment {
    id: number
    content: string
    created_at: string
    user: { id: number; name: string; email: string; photo?: string }
}

export const adminService = {
    async login(email: string, password: string) {
        const { data } = await axiosClient.post<{ success: boolean; token: string; message?: string; admin?: { id: number; name: string; email: string } }>('/admin/login', { email, password })
        return data
    },

    async getDashboard() {
        const { data } = await axiosClient.get<{ stats: DashboardStats; users: AdminUser[] }>('/admin/dashboard')
        return data
    },

    async getUsers(params?: { search?: string; status?: string }) {
        const { data } = await axiosClient.get<{ users: AdminUser[] }>('/admin/users', { params })
        return data
    },

    async getUserDetail(userId: number) {
        const { data } = await axiosClient.get<{
            user: AdminUser
            finances: { finances: FinanceRecord[]; summary: FinanceSummary }
            comments: AdminComment[]
        }>(`/admin/users/${userId}`)
        return data
    },

    async toggleUser(userId: number) {
        const { data } = await axiosClient.patch<{ success: boolean; message?: string }>(`/admin/users/${userId}/toggle`)
        return data
    },

    async deleteUser(userId: number) {
        const { data } = await axiosClient.delete<{ success: boolean; message?: string }>(`/admin/users/${userId}`)
        return data
    },

    async getFinances(params?: { user_id?: string; type?: string }) {
        const { data } = await axiosClient.get<{
            finances: FinanceRecord[]
            summary: FinanceSummary
            users: { id: number; name: string; email: string }[]
        }>('/admin/finances', { params })
        return data
    },

    async getComments(params?: { search?: string; user_id?: string }) {
        const { data } = await axiosClient.get<{
            comments: AdminComment[]
            users: { id: number; name: string }[]
        }>('/admin/comments', { params })
        return data
    },

    async deleteComment(commentId: number) {
        const { data } = await axiosClient.delete<{ success: boolean }>(`/admin/comments/${commentId}`)
        return data
    },
}
