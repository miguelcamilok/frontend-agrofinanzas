import { axiosClient } from '@shared/services/api/axiosClient'

/* ═══════════════════════════════════════════════════════
   hatoService — mapeado completo con CattleController
   Campos reales del backend: use_milk_meat, average_weight,
   breed, gender (female/male), status, birth_date, photo_url
   ═══════════════════════════════════════════════════════ */

export interface Animal {
    id: number
    name: string
    tag_number: string
    breed: string
    gender: 'male' | 'female' | 'macho' | 'hembra' | string

    // El controller guarda "use_milk_meat" — el service lo expone
    // como "purpose" para compatibilidad con las vistas
    use_milk_meat?: string
    purpose?: string            // alias de use_milk_meat (calculado en normalizeAnimal)

    // El controller guarda "average_weight" — se expone como "weight"
    average_weight?: number | string
    weight?: number             // alias de average_weight (calculado en normalizeAnimal)

    birth_date?: string
    origin?: string
    mother_id?: number | null
    mother?: Animal
    notes?: string
    photo_url?: string
    photo?: string              // alias de photo_url

    status: string
    age_text?: string           // calculado en el frontend si no viene del backend

    calves?: Animal[]
    calves_count?: number

    id_animal_production?: number
    created_at?: string
    updated_at?: string
}

export interface HatoSummary {
    total:   number
    machos:  number
    hembras: number
    crias:   number
    active?: number
}

export interface AnimalCreatePayload {
    name:       string
    tag_number: string
    breed:      string
    gender:     string
    purpose:    string          // se envía como "purpose" y también como "use_milk_meat"
    weight:     number
    birth_date: string
    origin:     string
    mother_id?: number | null
    notes?:     string
    photo?:     File | null
}

export interface BirthPayload {
    mother_id:  number
    name:       string
    tag_number: string
    gender:     string
    birth_date: string
    notes?:     string
    photo?:     File | null
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

/**
 * Calcula edad legible a partir de birth_date.
 * Devuelve "2 años", "8 meses", "15 días", etc.
 */
function calcAgeText(birthDate?: string): string {
    if (!birthDate) return 'N/D'

    // Parseo manual para evitar desfase UTC:
    // new Date("2014-03-15") interpreta como UTC 00:00, lo que en zonas UTC-x
    // puede devolver el día anterior y arruinar el cálculo de edad.
    const raw   = birthDate.trim().split('T')[0]        // solo "YYYY-MM-DD"
    const parts = raw.split('-').map(Number)
    if (parts.length < 3 || parts.some(isNaN)) return 'N/D'

    const [y, m, d] = parts
    const birth = new Date(y, m - 1, d)                 // hora local, sin desfase
    if (isNaN(birth.getTime())) return 'N/D'

    const now = new Date()
    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86_400_000)
    if (totalDays < 0)  return 'N/D'
    if (totalDays < 1)  return 'Recién nacido'
    if (totalDays < 30) return `${totalDays} día${totalDays !== 1 ? 's' : ''}`

    // Diferencia exacta en años y meses por calendario
    let years  = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth()    - birth.getMonth()

    if (months < 0) { years--; months += 12 }

    // Si todavía no llegó el día del cumpleaños en el mes actual, restar 1 mes
    if (now.getDate() < birth.getDate()) {
        months--
        if (months < 0) { years--; months += 12 }
    }

    if (years < 1) return `${months} mes${months !== 1 ? 'es' : ''}`

    return months > 0
        ? `${years} a. ${months} m.`
        : `${years} año${years !== 1 ? 's' : ''}`
}

/**
 * Normaliza un objeto Animal que viene del backend:
 * - mapea use_milk_meat → purpose
 * - mapea average_weight → weight
 * - mapea photo_url → photo
 * - calcula age_text si no viene del backend
 * - normaliza calves recursivamente
 */
function normalizeAnimal(raw: Animal): Animal {
    const a: Animal = { ...raw }

    // purpose / use_milk_meat
    if (!a.purpose && a.use_milk_meat) a.purpose = a.use_milk_meat
    if (!a.use_milk_meat && a.purpose)  a.use_milk_meat = a.purpose

    // weight / average_weight
    if (a.weight == null && a.average_weight != null) {
        a.weight = Number(a.average_weight)
    }
    if (a.average_weight == null && a.weight != null) {
        a.average_weight = a.weight
    }

    // photo
    if (!a.photo && a.photo_url) a.photo = a.photo_url

    // age_text — si no viene del backend lo calculamos aquí
    if (!a.age_text) a.age_text = calcAgeText(a.birth_date)

    // normalizar crías recursivamente
    if (Array.isArray(a.calves)) {
        a.calves = a.calves.map(normalizeAnimal)
    }

    // normalizar madre
    if (a.mother) a.mother = normalizeAnimal(a.mother)

    return a
}

/* ══════════════════════════════════════════════
   SERVICE
   ══════════════════════════════════════════════ */
export const hatoService = {

    /** GET /api/hato — lista de animales + resumen */
    async getAnimals() {
        const { data } = await axiosClient.get<{
            animals: Animal[]
            cattle?: Animal[]
            summary: HatoSummary
        }>('/hato')

        // el controller responde con "cattle" Y "animals"
        const raw = data.animals ?? data.cattle ?? []
        return {
            animals: raw.map(normalizeAnimal),
            summary: data.summary,
        }
    },

    /** GET /api/hato/:id — detalle de un animal */
    async getAnimal(id: number) {
        const { data } = await axiosClient.get<{
            animal?: Animal
            cattle?: Animal
        }>(`/hato/${id}`)

        const raw = data.animal ?? data.cattle
        if (!raw) throw new Error('Animal no encontrado')
        return { animal: normalizeAnimal(raw) }
    },

    /** POST /api/hato — crear animal */
    async createAnimal(payload: AnimalCreatePayload) {
        const fd = new FormData()
        fd.append('name',       payload.name)
        fd.append('tag_number', payload.tag_number)
        fd.append('breed',      payload.breed)
        fd.append('gender',     payload.gender)

        // Enviamos el campo con AMBOS nombres para compatibilidad
        fd.append('purpose',      payload.purpose)
        fd.append('use_milk_meat', payload.purpose)

        fd.append('weight',         String(payload.weight))
        fd.append('average_weight', String(payload.weight))

        fd.append('birth_date', payload.birth_date)
        fd.append('origin',     payload.origin)

        if (payload.mother_id) fd.append('mother_id', String(payload.mother_id))
        if (payload.notes)     fd.append('notes', payload.notes)
        if (payload.photo)     fd.append('photo', payload.photo)

        const { data } = await axiosClient.post<{
            success: boolean
            message?: string
            animal?: Animal
            cattle?: Animal
        }>('/hato', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        const raw = data.animal ?? data.cattle
        return {
            success: data.success,
            message: data.message,
            animal:  raw ? normalizeAnimal(raw) : undefined,
        }
    },

    /** DELETE /api/hato/:id */
    async deleteAnimal(id: number) {
        const { data } = await axiosClient.delete<{ success: boolean }>(`/hato/${id}`)
        return data
    },

    /** POST /api/hato/birth — registrar nacimiento */
    async registerBirth(payload: BirthPayload) {
        const fd = new FormData()
        fd.append('mother_id',  String(payload.mother_id))
        fd.append('name',       payload.name)
        fd.append('tag_number', payload.tag_number)
        fd.append('gender',     payload.gender)
        fd.append('birth_date', payload.birth_date)
        if (payload.notes) fd.append('notes', payload.notes)
        if (payload.photo) fd.append('photo', payload.photo)

        const { data } = await axiosClient.post<{
            success: boolean
            message?: string
        }>('/hato/birth', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    /** POST /api/hato/:id — actualizar animal */
    async updateAnimal(id: number, payload: Partial<AnimalCreatePayload> & { status?: string }) {
        const fd = new FormData()

        if (payload.name       !== undefined) fd.append('name',          payload.name)
        if (payload.tag_number !== undefined) fd.append('tag_number',    payload.tag_number)
        if (payload.breed      !== undefined) fd.append('breed',         payload.breed)
        if (payload.gender     !== undefined) fd.append('gender',        payload.gender)
        if (payload.purpose    !== undefined) {
            fd.append('purpose',       payload.purpose)
            fd.append('use_milk_meat', payload.purpose)
        }
        if (payload.weight !== undefined) {
            fd.append('weight',         String(payload.weight))
            fd.append('average_weight', String(payload.weight))
        }
        if (payload.birth_date !== undefined) fd.append('birth_date', payload.birth_date)
        if (payload.origin     !== undefined) fd.append('origin',     payload.origin)
        if (payload.status     !== undefined) fd.append('status',     payload.status)
        if (payload.notes      !== undefined) fd.append('notes',      payload.notes)
        if (payload.photo)                    fd.append('photo',      payload.photo)

        // Laravel no acepta PUT con FormData; usamos POST con _method=PUT
        fd.append('_method', 'PUT')

        const { data } = await axiosClient.post<{
            success: boolean
            message?: string
            cattle?: Animal
            animal?: Animal
        }>(`/hato/${id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        const raw = data.cattle ?? data.animal
        return {
            success: data.success,
            message: data.message,
            animal:  raw ? normalizeAnimal(raw) : undefined,
        }
    },

    /** GET /api/hato/mothers — hembras activas para selector */
    async getMothers() {
        const { data } = await axiosClient.get<{ mothers: Animal[] }>('/hato/mothers')
        return {
            mothers: (data.mothers ?? []).map(normalizeAnimal),
        }
    },
}