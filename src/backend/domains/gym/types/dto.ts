// ============================================================================
// Gym DTO Types
// ============================================================================

export interface GymDTO {
  id: number
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  facilities?: string[]
  openHour?: string
  is24Hours: boolean
  hasGX: boolean
  hasPT: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateGymDTO {
  name: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  facilities?: string[]
  openHour?: string
  is24Hours: boolean
  hasGX: boolean
  hasPT: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
}

export interface UpdateGymDTO {
  name?: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string[]
  openHour?: string
  is24Hours?: boolean
  hasGX?: boolean
  hasPT?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
}

export interface GymSearchParams {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  radius?: number
  facilities?: string[]
  hasGX?: boolean
  hasPT?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
  is24Hours?: boolean
}
