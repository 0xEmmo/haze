import credits from '@/data/photo-credits.json'
import { Photo } from '@/components/Photo'
import { usePageTitle } from '@/hooks/usePageTitle'

const list = Object.entries(credits as Record<string, { author: string; authorUrl: string; page: string }>).map(([file, c]) => ({ name: file.replace(/\.jpg$/, ''), ...c }))

export default function CreditsPage() {
  usePageTitle('Photo credits')
  return (
    <div className="wrap" style={{ paddingTop: 'var(--space-7)' }}>
      <p className="eyebrow">Credits</p>
      <h1 className="display" style={{ fontSize: 'var(--step-4)', marginBottom: 'var(--space-3)' }}>
        The <em>photographs</em>
      </h1>
      <p className="muted" style={{ maxWidth: '40rem', marginBottom: 'var(--space-6)' }}>
        Every photo in Haze is a real photograph from Unsplash, used under the Unsplash License. Thank you to the {new Set(list.map((l) => l.author)).size} photographers below. Haze itself, its perfumes and people’s names are made up.
      </p>
      <ul role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-5) var(--space-4)' }}>
        {list.map((c) => (
          <li key={c.name} style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 'var(--step--1)' }}>
            <a href={c.page} target="_blank" rel="noreferrer" aria-label={`Photo by ${c.author} on Unsplash`}>
              <Photo name={c.name} alt="" sizes="180px" ratio={1} style={{ borderRadius: 'var(--radius-s)' }} />
            </a>
            <a href={c.authorUrl} target="_blank" rel="noreferrer">
              {c.author}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
