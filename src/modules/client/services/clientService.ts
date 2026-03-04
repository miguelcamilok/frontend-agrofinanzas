import { axiosClient } from '@shared/services/api/axiosClient'

export interface FinanceItem {
    id: number; type: string; amount: number; date: string
    date_formatted?: string; date_original?: string
    description?: string; category?: string
    asset_name?: string; creditor?: string
    interest_rate?: number; installments?: number; paid_installments?: number; due_date?: string
    product_name?: string; quantity?: number; unit?: string; unit_cost?: number
    crop_name?: string; area?: number; cost_per_unit?: number; production_cycle?: string
}

export interface FinanceSummary {
    totalIncome: number; totalExpense: number; balance: number
    totalInvestment: number; totalDebt: number; totalInventory: number; totalCosts: number
}

export const clientService = {
    async getFinances(filter = 'all') {
        const { data } = await axiosClient.get<{
            finances: FinanceItem[]; filter: string
            totalIncome: number; totalExpense: number; balance: number
            totalInvestment: number; totalDebt: number; totalInventory: number; totalCosts: number
        }>('/client/finances', { params: { filter } })
        return data
    },

    /**
     * Requests the backend to generate and return a PDF of the financial history.
     * Returns a Blob which the caller can turn into a download link.
     *
     * Backend route: POST /api/client/finances/export-pdf
     * Expects JSON body: { filter, date_from, date_to }
     * Returns: application/pdf
     */
    async exportFinancesPDF(payload: {
        filter?: string
        date_from?: string
        date_to?: string
    }): Promise<Blob> {
        const response = await axiosClient.post(
            '/client/finances/export-pdf',
            payload,
            { responseType: 'blob' }
        )
        return response.data as Blob
    },

    async createIncome(payload: { amount: number; date: string; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/income', payload)
        return data
    },
    async createExpense(payload: { amount: number; date: string; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/expense', payload)
        return data
    },
    async createInvestment(payload: { amount: number; date: string; asset_name: string; category?: string; depreciation_years?: number; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/investment', payload)
        return data
    },
    async createDebt(payload: { amount: number; date: string; creditor: string; due_date?: string; interest_rate?: number; installments?: number; paid_installments?: number; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/debt', payload)
        return data
    },
    async createInventory(payload: { date: string; category: string; product_name: string; quantity: number; unit: string; amount: number; unit_cost?: number; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/inventory', payload)
        return data
    },
    async createCosts(payload: { date: string; amount: number; crop_name: string; area?: number; cost_per_unit?: number; production_cycle?: string; category?: string; description?: string }) {
        const { data } = await axiosClient.post<{ success: boolean; message?: string }>('/client/costs', payload)
        return data
    },
    async updateFinance(id: number, payload: { amount: number; date: string; category?: string; description?: string }) {
        const { data } = await axiosClient.put<{ success: boolean }>(`/client/finances/${id}`, payload)
        return data
    },
    async deleteFinance(id: number) {
        const { data } = await axiosClient.delete<{ success: boolean }>(`/client/finances/${id}`)
        return data
    },
    async payDebtInstallment(id: number) {
        const { data } = await axiosClient.patch<{ success: boolean }>(`/client/debt/${id}/pay`)
        return data
    },
}