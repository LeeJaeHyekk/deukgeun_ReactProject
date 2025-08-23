// ============================================================================
// GymDTO - Data Transfer Object
// ============================================================================

export interface GymDTO {
  id: number
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string
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

// Create DTO (for creating new Gym)
export interface CreateGymDTO {
  id: number
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string
  openHour?: string
  is24Hours: boolean
  hasGX: boolean
  hasPT: boolean
  hasGroupPT: boolean
  hasParking: boolean
  hasShower: boolean
}

// Update DTO (for updating existing Gym)
export interface UpdateGymDTO {
  id?: number
  name?: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string
  openHour?: string
  is24Hours?: boolean
  hasGX?: boolean
  hasPT?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
}

// Response DTO (for API responses)
export interface GymDTOResponse {
  success: boolean
  data?: GymDTO
  message?: string
  error?: string
}

// List Response DTO
export interface GymDTOListResponse {
  success: boolean
  data?: GymDTO[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
