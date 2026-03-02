import { axiosClient } from '@shared/services/api/axiosClient'

export interface AgronomyItem {
    id: number
    title: string
    image: string
    route: string
    description?: string
}

export const agronomyService = {
    async getItems() {
        const { data } = await axiosClient.get<{ items: AgronomyItem[] }>('/agronomy')
        return data
    },
}
