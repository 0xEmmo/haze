import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react'
import { useEffect } from 'react'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { MOMENTS, type Moment, type Swipe } from '@/lib/quiz'
import styles from './Quiz.module.css'

interface Props {
  swipes: Record<string, Swipe>
  onSwipe: (id: string, s: Swipe) => void
  onUndo: () => void
}

export function SwipeDeck({ swipes, onSwipe, onUndo }: Props) {
  const remaining = MOMENTS.filter((m) => !(m.id in swipes))
  const done = MOMENTS.length - remaining.length
  const current = remaining[0]

  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') onSwipe(current.id, 'love')
      else if (e.key === 'ArrowLeft') onSwipe(current.id, 'no')
      else if (e.key === 'ArrowDown') onSwipe(current.id, 'skip')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, onSwipe])

  return (
    <div className={`wrap ${styles.deckPage}`}>
      <div className={styles.progress}>
        <span className="num">
          {Math.min(done + 1, MOMENTS.length)} of {MOMENTS.length}
        </span>
        <span className={styles.track} aria-hidden>
          <span style={{ transform: `scaleX(${done / MOMENTS.length})` }} />
        </span>
        <button type="button" className="link-btn" onClick={onUndo} disabled={done === 0}>
          Back
        </button>
      </div>

      <h1 className={`display ${styles.deckTitle}`}>Would you wear this?</h1>

      <div className={styles.deck}>
        {remaining
          .slice(0, 3)
          .reverse()
          .map((m) => (
            <Card key={m.id} moment={m} top={m === current} depth={remaining.indexOf(m)} onSwipe={(s) => onSwipe(m.id, s)} />
          ))}
      </div>

      {current && (
        <div className={styles.actions} role="group" aria-label={`Your answer for ${current.title}`}>
          <button type="button" className={styles.round} onClick={() => onSwipe(current.id, 'no')} aria-label="Not for me">
            <Icon name="close" size={26} />
          </button>
          <button type="button" className={styles.skip} onClick={() => onSwipe(current.id, 'skip')}>
            Not sure
          </button>
          <button type="button" className={`${styles.round} ${styles.love}`} onClick={() => onSwipe(current.id, 'love')} aria-label="I’d wear this">
            <Icon name="heart" size={26} filled />
          </button>
        </div>
      )}
      <p className={`hint ${styles.keys}`}>Swipe the card, or use ← and → on a keyboard.</p>
    </div>
  )
}

function Card({ moment, top, depth, onSwipe }: { moment: Moment; top: boolean; depth: number; onSwipe: (s: Swipe) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-14, 14])
  const love = useTransform(x, [20, 120], [0, 1])
  const nope = useTransform(x, [-120, -20], [1, 0])
  const reduce = useReducedMotion()

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600
    if (!far) {
      void animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
      return
    }
    const dir = info.offset.x > 0 ? 1 : -1
    void animate(x, dir * 600, { duration: reduce ? 0 : 0.25 }).then(() => onSwipe(dir > 0 ? 'love' : 'no'))
  }

  return (
    <motion.article
      className={styles.card}
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14 }}
      drag={top ? 'x' : false}
      dragSnapToOrigin={false}
      onDragEnd={onDragEnd}
      aria-hidden={!top}
      aria-label={top ? moment.title : undefined}
    >
      <Photo name={moment.photo} alt="" sizes="(min-width: 600px) 420px, 90vw" ratio={4 / 5} priority={depth < 2} />
      <motion.span className={`${styles.stamp} ${styles.stampLove}`} style={{ opacity: love }} aria-hidden>
        Yes
      </motion.span>
      <motion.span className={`${styles.stamp} ${styles.stampNo}`} style={{ opacity: nope }} aria-hidden>
        Pass
      </motion.span>
      <div className={styles.cardText}>
        <h2 className="display">{moment.title}</h2>
        <p>{moment.line}</p>
      </div>
    </motion.article>
  )
}
