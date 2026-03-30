export type Client = {
    id: number
    name: string
    phone: string
    gender: string
    birth_date: string
}

export type Service = {
    id: number
    title: string
    description: string
    duration: string // "HH:MM:SS"
    value: number
    photo: string
}

export type PaymentHistory = {
    id: number
    payment_id: number
    title: string
    description: string | null
    value: number
    is_enter: boolean
    method: string | null
    created_at: string
}

export type Payment = {
    id: number
    title: string
    description: string | null
    value: number
    is_enter: boolean
    method: string
    user_id: number
    payment_histories: PaymentHistory[]
    created_at: string
    updated_at: string
}