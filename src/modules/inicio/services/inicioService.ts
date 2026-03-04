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

/* ── Types from PreciosController ── */
export interface PrecioItem {
    nombre: string
    precio: number
    precio_carga?: number
    unidad: string
    unidad_carga?: string
    variacion: number | null
    bolsa_ny?: number | null
    tasa_cambio?: number | null
    fecha: string
    fuente: string
    fuente_url?: string
    en_vivo: boolean
    error: boolean
    error_detalle?: string
}

export interface PreciosResponse {
    success: boolean
    actualizado: string
    precios: {
        cafe: PrecioItem
        maiz: PrecioItem
        leche: PrecioItem
        pollo: PrecioItem
        papa: PrecioItem
        carne: PrecioItem
    }
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

    /**
     * GET /api/precios
     * Returns real-time agro prices from PreciosController.
     * Café: scraped live from federaciondecafeteros.org
     * Others: static reference values (SIPSA-DANE, MADR, FENAVI, FEDEGÁN)
     * Server-side cache: 6 hours
     */
    async getPrecios() {
        const { data } = await axiosClient.get<PreciosResponse>('/precios')
        return data
    },
}