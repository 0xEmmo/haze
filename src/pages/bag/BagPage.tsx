import { Navigate } from 'react-router'
import { useUi } from '@/stores/ui'
import { useEffect } from 'react'

/** /bag is a shortcut (used by the PWA manifest): open the drawer over the shop. */
export default function BagPage() {
  const openBag = useUi((s) => s.openBag)
  useEffect(() => openBag(), [openBag])
  return <Navigate to="/shop" replace />
}
