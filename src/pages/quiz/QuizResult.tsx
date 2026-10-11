import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { Radar } from '@/components/Radar'
import { ScentStrip } from '@/components/ScentStrip'
import { useToast } from '@/components/toast'
import { familyInfo } from '@/data/notes'
import { FAMILIES } from '@/data/types'
import { BOX_PRICE, BOX_SIZE } from '@/lib/box'
import { formatNaira } from '@/lib/money'
import { buildProfile, matchFragrances, type QuizAnswers } from '@/lib/quiz'
import { useBox } from '@/stores/box'
import styles from './Quiz.module.css'

export function QuizResult({ answers, onRestart }: { answers: QuizAnswers; onRestart: () => void }) {
  const profile = useMemo(() => buildProfile(answers), [answers])
  const matches = useMemo(() => matchFragrances(answers), [answers])
  const fill = useBox((s) => s.fill)
  const boxCount = useBox((s) => s.slugs.length)
  const toast = useToast()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const top = matches.slice(0, 3)
  const leading = FAMILIES.filter((f) => profile[f] > 0)
    .sort((a, b) => profile[b] - profile[a])
    .slice(0, 2)
  const empty = leading.length === 0

  const share = async () => {
    const url = location.href
    try {
      if (navigator.share) await navigator.share({ title: 'My Haze scent matches', url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast('Link copied', { tone: 'ok' })
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className={`wrap ${styles.result}`}>
      <header className={styles.resultHead}>
        <div>
          <p className="eyebrow">Your scent profile</p>
          <h1 className="display">
            {empty ? (
              <>
                A <em>clean slate</em>
              </>
            ) : (
              <>
                Mostly <em>{familyInfo[leading[0]!].label.toLowerCase()}</em>
                {leading[1] && <>, with some {familyInfo[leading[1]].label.toLowerCase()}</>}
              </>
            )}
          </h1>
          <p className={styles.lede}>
            {empty
              ? 'You passed on everything, which is useful too. These are the gentlest things we make; a sample box is the best way in.'
              : leading.map((f) => familyInfo[f].blurb).join(' ')}
          </p>
          <div className={styles.resultActions}>
            <button
              type="button"
              className="btn btn-ember"
              onClick={() => {
                fill(matches.map((m) => m.fragrance.slug))
                toast(`Your top matches are in the sample box`, { tone: 'ok' })
                void navigate('/box')
              }}
            >
              <Icon name="vial" size={18} /> {boxCount > 0 ? 'Fill my sample box with these' : `Sample my top ${BOX_SIZE}`} · {formatNaira(BOX_PRICE)}
            </button>
            <button type="button" className="btn btn-ghost" onClick={share}>
              {copied ? 'Copied' : 'Share result'}
            </button>
            <button type="button" className="link-btn" onClick={onRestart}>
              Start again
            </button>
          </div>
        </div>
        <Radar profile={profile} label={`Your profile: ${leading.map((f) => familyInfo[f].label).join(' and ') || 'no strong leanings'}`} />
      </header>

      <h2 className={`display ${styles.matchesTitle}`}>Your matches</h2>
      <ol role="list" className={styles.matchList}>
        {top.map((m, i) => (
          <li key={m.fragrance.slug} className={styles.matchCard}>
            <Link to={`/shop/${m.fragrance.slug}`} className={styles.matchPhoto} tabIndex={-1} aria-hidden>
              <Photo name={m.fragrance.photos[0]!} alt="" sizes="(min-width: 960px) 30vw, 100vw" ratio={4 / 3} />
              <span className={styles.rank}>{i + 1}</span>
            </Link>
            <div className={styles.matchBody}>
              <p className={styles.score}>
                <span className="num">{m.score}%</span> match
              </p>
              <h3 className="display">
                <Link to={`/shop/${m.fragrance.slug}`}>{m.fragrance.name}</Link>
              </h3>
              <p className="muted">{m.fragrance.tagline}</p>
              <ScentStrip product={m.fragrance} height={5} />
              {m.reasons.length > 0 && (
                <ul className={styles.reasons}>
                  {m.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      <details className={styles.rest}>
        <summary>See how all twelve scored</summary>
        <ol>
          {matches.map((m) => (
            <li key={m.fragrance.slug}>
              <Link to={`/shop/${m.fragrance.slug}`}>{m.fragrance.name}</Link>
              <span className={styles.bar} aria-hidden>
                <span style={{ width: `${m.score}%` }} />
              </span>
              <span className="num">{m.score}%</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}
