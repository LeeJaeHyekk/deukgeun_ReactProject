// ============================================================================
// Gym Data Types
// ============================================================================

export interface GymData {
  name: string
  address: string
  phone: string
  type: string
  updatedAt: string
  source: string
  confidence: number
  serviceType: string
  isCurrentlyOpen: boolean
  crawledAt: string
  businessStatus: string
  businessType: string
  detailBusinessType: string
  cultureSportsType: string
  managementNumber: string
  approvalDate: string
  siteArea: string
  postalCode: string
  latitude?: number
  longitude?: number
  [key: string]: any
}

export type GymsData = GymData[]
