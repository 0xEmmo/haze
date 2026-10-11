import { Link } from 'react-router'
import { Photo } from '@/components/Photo'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Not found')
  return (
    <div className="wrap" style={{ display: 'grid', gap: 'var(--space-5)', justifyItems: 'start', paddingBlock: 'var(--space-8)', maxWidth: '44rem' }}>
      <Photo name="n-smoke" alt="" sizes="(min-width: 700px) 600px, 100vw" ratio={2} style={{ borderRadius: 'var(--radius-l)', width: '100%' }} />
      <p className="eyebrow">404</p>
      <h1 className="display" style={{ fontSize: 'var(--step-4)' }}>
        This page has <em>evaporated</em>.
      </h1>
      <p className="muted">It may have been moved, or the link was mistyped.</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link to="/shop" className="btn">
          Go to the shop
        </Link>
        <Link to="/" className="btn btn-ghost">
          Home
        </Link>
      </div>
    </div>
  )
}
