import { useEffect } from 'react'

export function usePageTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · Haze` : 'Haze: fragrance, found slowly'
  }, [title])
}
