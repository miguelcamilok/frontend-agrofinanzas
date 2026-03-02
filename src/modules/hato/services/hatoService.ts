import { axiosClient } from '@shared/services/api/axiosClient'

export interface Animal {
    id: number
    name: string
    tag_number: string
    breed: string
    gender: 'macho' | 'hembra' | 'male' | 'female' | string
    purpose: string
    weight: number
    birth_date: string
    origin: string
    mother_id: number | null
    mother?: Animal
    notes?: string
    photo?: string
    photo_url?: string
    status: string
    age_text?: string
    calves?: Animal[]
    calves_count?: number
    created_at?: string
    updated_at?: string
}

export interface HatoSummary {
    total: number
    machos: number
    hembras: number
    crias: number
}

export interface AnimalCreatePayload {
    name: string
    tag_number: string
    breed: string
    gender: string
    purpose: string
    weight: number
    birth_date: string
    origin: string
    mother_id?: number | null
    notes?: string
    photo?: File | null
}

export interface BirthPayload {
    mother_id: number
    name: string
    tag_number: string
    gender: string
    birth_date: string
    notes?: string
    photo?: File | null
}

export const hatoService = {
    async getAnimals() {
        const { data } = await axiosClient.get<{
            animals: Animal[]
            summary: HatoSummary
        }>('/hato')
        return data
    },

    async getAnimal(id: number) {
        const { data } = await axiosClient.get<{ animal: Animal }>(`/hato/${id}`)
        return data
    },

    async createAnimal(payload: AnimalCreatePayload) {
        const formData = new FormData()
        formData.append('name', payload.name)
        formData.append('tag_number', payload.tag_number)
        formData.append('breed', payload.breed)
        formData.append('gender', payload.gender)
        formData.append('purpose', payload.purpose)
        formData.append('weight', String(payload.weight))
        formData.append('birth_date', payload.birth_date)
        formData.append('origin', payload.origin)
        if (payload.mother_id) formData.append('mother_id', String(payload.mother_id))
        if (payload.notes) formData.append('notes', payload.notes)
        if (payload.photo) formData.append('photo', payload.photo)

        const { data } = await axiosClient.post<{ success: boolean; message?: string; animal?: Animal }>(
            '/hato',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
    },

    async deleteAnimal(id: number) {
        const { data } = await axiosClient.delete<{ success: boolean }>(`/hato/${id}`)
        return data
    },

    async registerBirth(payload: BirthPayload) {
        const formData = new FormData()
        formData.append('mother_id', String(payload.mother_id))
        formData.append('name', payload.name)
        formData.append('tag_number', payload.tag_number)
        formData.append('gender', payload.gender)
        formData.append('birth_date', payload.birth_date)
        if (payload.notes) formData.append('notes', payload.notes)
        if (payload.photo) formData.append('photo', payload.photo)

        const { data } = await axiosClient.post<{ success: boolean; message?: string }>(
            '/hato/birth',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
    },

    async getMothers() {
        const { data } = await axiosClient.get<{ mothers: Animal[] }>('/hato/mothers')
        return data
    },
}
