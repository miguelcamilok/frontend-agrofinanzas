import { axiosClient } from '@shared/services/api/axiosClient'

export interface ClimaData {
    main: { temp: number; humidity: number }
    wind: { speed: number }
    weather: Array<{ description: string }>
}

export interface AgroDataResponse {
    data: {
        payload?: {
            price_usd_per_ton?: string
            unit?: string
            monthly_variation?: string
        }
        values?: Record<string, string>
    }
    error?: string
}

export const inicioService = {
    async getClima() {
        const { data } = await axiosClient.get<ClimaData>('/clima')
        return data
    },
    async getAgroData(product: string, indicator: string) {
        const { data } = await axiosClient.get<AgroDataResponse>('/agro/data', {
            params: { product, indicator }
        })
        return data
    },
}
