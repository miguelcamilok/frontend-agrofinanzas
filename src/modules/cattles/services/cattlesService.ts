import { axiosClient } from '@shared/services/api/axiosClient'

export interface Cattle {
    id: number
    name: string
    breed: string
    purpose: string
    head_count: number
    area: number
    notes?: string
    created_at?: string
}

export const cattlesService = {
    async getCattles() {
        const { data } = await axiosClient.get<{ cattles: Cattle[] }>('/cattles')
        return data
    },
}
