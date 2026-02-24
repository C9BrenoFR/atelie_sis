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
}