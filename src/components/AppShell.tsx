import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { useCart } from '@/stores/cart'
import { useBox } from '@/stores/box'
import { useCompare } from '@/stores/compare'
import { useUi } from '@/stores/ui'
import { BagDrawer } from './BagDrawer'
import { CompareTray } from './CompareTray'
import { Footer } from './Footer'
import { Icon } from './Icon'
import { OfflineBanner } from './OfflineBanner'
import { SearchPanel } from './SearchPanel'
import { UpdatePrompt } from './UpdatePrompt'
import { Wordmark } from './Wordmark'
import styles from './AppShell.module.css'

const NAV = [
  { to: '/shop', label: 'Shop', icon: 'vial' },
  { to: '/wheel', label: 'Scent wheel', short: 'Wheel', icon: 'wheel' },
  { to: '/quiz', label: 'Find your scent', short: 'Quiz', icon: 'spark' },
  { to: '/box', label: 'Sample box', short: 'Box', icon: 'box' },
] as const

export function AppShell() {
  const count = useCart((s) => s.lines.reduce((n, l) => n + (l.type === 'box' ? 1 : l.qty), 0))
  const boxCount = useBox((s) => s.slugs.length)
  const compareCount = useCompare((s) => s.slugs.length)
  const openBag = useUi((s) => s.openBag)
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const inCheckout = pathname === '/checkout'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={`wrap ${styles.bar}`}>
          <NavLink to="/" className={styles.logo} aria-label="Haze, home">
            <Wordmark />
          </NavLink>
          {!inCheckout && (
            <nav aria-label="Main" className={styles.nav}>
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} className={styles.navLink}>
                  {n.label}
                  {n.to === '/box' && boxCount > 0 && <span className={styles.mini}>{boxCount}/5</span>}
                </NavLink>
              ))}
            </nav>
          )}
          <div className={styles.actions}>
            {!inCheckout && (
              <>
                <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search" aria-keyshortcuts="Control+K /">
                  <Icon name="search" size={22} />
                </button>
                {compareCount > 0 && (
                  <NavLink to="/compare" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label={`Compare, ${compareCount} chosen`}>
                    <Icon name="compare" size={22} />
                    <span className={styles.badge}>{compareCount}</span>
                  </NavLink>
                )}
              </>
            )}
            <button type="button" className={styles.iconBtn} onClick={openBag} aria-label={`Bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
              <Icon name="bag" size={22} />
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <OfflineBanner />

      <main id="main" className={styles.main} tabIndex={-1}>
        <Suspense fallback={<div className={styles.loading} aria-busy="true" aria-label="Loading" />}>
          <Outlet />
        </Suspense>
      </main>

      {!inCheckout && <Footer />}

      {!inCheckout && (
        <nav aria-label="Main" className={styles.tabs}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={styles.tab}>
              <Icon name={n.icon} size={22} />
              <span>{'short' in n ? n.short : n.label}</span>
              {n.to === '/box' && boxCount > 0 && <span className={styles.tabBadge}>{boxCount}</span>}
            </NavLink>
          ))}
          <button type="button" className={styles.tab} onClick={openBag}>
            <Icon name="bag" size={22} />
            <span>Bag</span>
            {count > 0 && <span className={styles.tabBadge}>{count}</span>}
          </button>
        </nav>
      )}

      {!inCheckout && <CompareTray />}
      <BagDrawer />
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <UpdatePrompt />
      <ScrollRestoration />
    </>
  )
}
