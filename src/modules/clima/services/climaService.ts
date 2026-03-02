import { axiosClient } from '@shared/services/api/axiosClient'

export interface WeatherData {
    city: string
    temperature: number
    humidity: number
    wind_speed: number
    description: string
    icon: string
    feels_like?: number
    pressure?: number
}

export const climaService = {
    async getWeather() {
        const { data } = await axiosClient.get<WeatherData>('/clima')
        return data
    },
}
