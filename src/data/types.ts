export type Family = 'citrus' | 'floral' | 'green' | 'aquatic' | 'woody' | 'amber' | 'gourmand' | 'smoky'

export const FAMILIES: Family[] = ['citrus', 'floral', 'green', 'aquatic', 'woody', 'amber', 'gourmand', 'smoky']

export interface Note {
  id: string
  name: string
  family: Family
  /** Photo name in public/photos, if we have one. */
  photo?: string
  /** One line on what it smells like, in plain words. */
  smells: string
}

export type Season = 'harmattan' | 'rainy' | 'all-year'
export type Time = 'day' | 'night' | 'any'

export interface Size {
  id: string
  label: string
  ml: number
  price: number
  stock: number
}

export interface Review {
  id: string
  author: string
  city: string
  rating: 1 | 2 | 3 | 4 | 5
  body: string
  date: string
}

interface BaseProduct {
  slug: string
  name: string
  tagline: string
  story: string
  photos: string[]
  sizes: Size[]
  badge?: 'new' | 'bestseller' | 'limited'
  reviews: Review[]
}

export interface Fragrance extends BaseProduct {
  kind: 'fragrance'
  /** How much of each family is in it, 0 to 1. Keys not listed are 0. */
  profile: Partial<Record<Family, number>>
  notes: { top: string[]; heart: string[]; base: string[] }
  /** 1 (skin scent) to 5 (fills the room). */
  intensity: 1 | 2 | 3 | 4 | 5
  longevityHours: number
  season: Season
  time: Time
  perfumer: string
  year: number
}

export interface Candle extends BaseProduct {
  kind: 'candle'
  profile: Partial<Record<Family, number>>
  notes: string[]
  burnHours: number
  wax: string
}

export type Product = Fragrance | Candle
