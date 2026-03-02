import { axiosClient } from '@shared/services/api/axiosClient'

export interface Avocado {
    id: number
    variety: string
    area: number
    planted_date: string
    status: string
    trees_count?: number
    production_kg?: number
    notes?: string
    created_at?: string
}

export const avocadoService = {
    async getAvocados() {
        const { data } = await axiosClient.get<{ avocados: Avocado[] }>('/avocadocrops')
        return data
    },
    async getAvocado(id: number) {
        const { data } = await axiosClient.get<{ avocado: Avocado }>(`/avocadocrops/${id}`)
        return data
    },
}
