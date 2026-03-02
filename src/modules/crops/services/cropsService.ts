import { axiosClient } from '@shared/services/api/axiosClient'

export interface Crop {
    id: number
    name: string
    area: number
    planted_date: string
    harvest_date?: string
    status: string
    yield_amount?: number
    notes?: string
    created_at?: string
}

export const cropsService = {
    async getCrops() {
        const { data } = await axiosClient.get<{ crops: Crop[] }>('/crops')
        return data
    },
    async getCrop(id: number) {
        const { data } = await axiosClient.get<{ crop: Crop }>(`/crops/${id}`)
        return data
    },
}
