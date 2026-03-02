import { axiosClient } from '@shared/services/api/axiosClient'

export interface Hen {
    id: number
    breed: string
    quantity: number
    age_weeks: number
    purpose: string
    egg_production: number
    notes?: string
    status: string
    created_at?: string
}

export const hensService = {
    async getHens() {
        const { data } = await axiosClient.get<{ hens: Hen[] }>('/hens')
        return data
    },
    async getHen(id: number) {
        const { data } = await axiosClient.get<{ hen: Hen }>(`/hens/${id}`)
        return data
    },
}
