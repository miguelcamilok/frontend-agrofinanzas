import { axiosClient } from '@shared/services/api/axiosClient'

export interface Coffee {
    id: number
    variety: string
    area: number
    altitude: number
    planted_date: string
    status: string
    production_kg?: number
    notes?: string
    created_at?: string
}

export const coffeService = {
    async getCoffees() {
        const { data } = await axiosClient.get<{ coffees: Coffee[] }>('/coffecrops')
        return data
    },
}
