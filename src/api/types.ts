import type { CartLine, DeliveryId, Totals } from '@/lib/cart'
import type { Address, Contact, FieldErrors } from '@/lib/checkout'
import type { CardErrors, CardInput } from '@/lib/payment'

export type PaymentMethod = 'card' | 'transfer'

export interface CheckoutRequest {
  lines: CartLine[]
  giftWrap: boolean
  contact: Contact
  address: Address
  delivery: DeliveryId
  payment: { method: PaymentMethod; card?: CardInput }
  /** What the client thinks it can spend; the server works it out again. */
  credit: number
  giftNote?: string
}

export interface OrderLine {
  key: string
  title: string
  detail: string
  photo: string
  qty: number
  total: number
}

export interface Order {
  id: string
  placedAt: string
  lines: OrderLine[]
  totals: Totals
  contact: Contact
  address: Address
  delivery: DeliveryId
  payment: { method: PaymentMethod; last4?: string }
  giftNote?: string
  /** Credit this order earns for a later full bottle. */
  boxCredit: number
}

export type CheckoutError = {
  kind: 'invalid' | 'payment' | 'stock' | 'empty' | 'network'
  message: string
  fields?: { contact?: FieldErrors<Contact>; address?: FieldErrors<Address>; card?: CardErrors }
}
