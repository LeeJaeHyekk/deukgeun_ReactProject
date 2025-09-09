// ============================================================================
// 공통 타입 정의
// ============================================================================

export interface Machine {
  id: number
  name: string
  category: string
  muscleGroups: string[]
  equipment?: string
  instructions?: string[]
  tips?: string[]
  imageUrl?: string
}

export interface Gym {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  latitude: number
  longitude: number
  facilities: string[]
  operatingHours: OperatingHours
  price?: PriceInfo
  rating: number
  reviewCount: number
  images: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface OperatingHours {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export interface PriceInfo {
  monthly: number
  daily?: number
  hourly?: number
  currency: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: PaginationInfo
}

export interface ApiListResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  address: string
  roadAddress: string
  jibunAddress: string
  buildingName?: string
  zoneCode: string
}

export interface FileUpload {
  file: File
  preview?: string
  progress?: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  facilities?: string[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
