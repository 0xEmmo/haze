import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { familyInfo, notesByFamily } from '@/data/notes'
import { FAMILIES, type Family } from '@/data/types'
import { arcPath, flipLabel, flipRadial, polar, rotationFor, segments, subdivide } from '@/lib/wheel'
import styles from './ScentWheel.module.css'

const C = 300
const R = { hub: 84, famIn: 88, famOut: 172, noteIn: 176, noteOut: 292 }

interface Props {
  family: Family
  note: string | null
  onSelect: (family: Family, note?: string) => void
}

const angleAt = (el: SVGSVGElement, x: number, y: number) => {
  const r = el.getBoundingClientRect()
  return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI
}

/**
 * The wheel itself. Families in the inner ring, their notes in the outer.
 * Tap to select, or drag to spin; on release it settles on the family at the top.
 */
export function ScentWheel({ family, note, onSelect }: Props) {
  const fams = useMemo(() => segments(FAMILIES.length), [])
  const famIndex = FAMILIES.indexOf(family)
  const [rotation, setRotation] = useState(() => -fams[famIndex]!.mid)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ start: number; from: number; moved: boolean } | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const suppressClick = useRef(false)

  // keep the selected family at twelve o'clock when it changes from outside (chips, URL)
  const [shownFor, setShownFor] = useState(family)
  if (shownFor !== family) {
    setShownFor(family)
    setRotation((r) => rotationFor(fams[famIndex]!.mid, r))
  }

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    drag.current = { start: angleAt(e.currentTarget, e.clientX, e.clientY), from: rotation, moved: false }
  }
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    let delta = angleAt(e.currentTarget, e.clientX, e.clientY) - d.start
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    if (!d.moved && Math.abs(delta) < 4) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setRotation(d.from + delta)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    setDragging(false)
    suppressClick.current = true
    window.setTimeout(() => (suppressClick.current = false), 0)
    // which family is now at the top?
    const top = (((-rotation % 360) + 360) % 360)
    const hit = fams.find((s) => top >= s.start - 1 && top <= s.end + 1) ?? fams.reduce((a, b) => (Math.abs(b.mid - top) < Math.abs(a.mid - top) ? b : a))
    const f = FAMILIES[hit.index]!
    setRotation(rotationFor(hit.mid, rotation))
    setShownFor(f)
    onSelect(f)
  }

  const activate = (e: KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }

  return (
    <div className={styles.frame}>
      <svg
        ref={svg}
        viewBox="0 0 600 600"
        className={styles.svg}
        data-dragging={dragging}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label="Scent wheel. Families in the inner ring, notes in the outer ring."
      >
        <g className={styles.spin} style={{ transform: `rotate(${rotation}deg)` }}>
          {fams.map((seg, i) => {
            const f = FAMILIES[i]!
            const info = familyInfo[f]
            const selected = f === family
            const kids = notesByFamily(f)
            const noteSegs = subdivide(seg, kids.length)
            const labelAt = polar(C, C, (R.famIn + R.famOut) / 2, seg.mid)
            const flip = flipLabel(seg.mid + rotation)
            return (
              <g key={f} data-selected={selected} className={styles.family}>
                <path
                  d={arcPath(C, C, R.famIn, R.famOut, seg.start, seg.end)}
                  fill={info.colour}
                  className={styles.famPath}
                  role="button"
                  tabIndex={0}
                  aria-label={`${info.label} family`}
                  aria-pressed={selected && !note}
                  onClick={() => !suppressClick.current && onSelect(f)}
                  onKeyDown={(e) => activate(e, () => onSelect(f))}
                />
                <text
                  x={labelAt.x}
                  y={labelAt.y}
                  className={styles.famLabel}
                  transform={`rotate(${seg.mid + (flip ? 180 : 0)} ${labelAt.x} ${labelAt.y})`}
                  aria-hidden
                >
                  {info.label}
                </text>
                {noteSegs.map((ns, j) => {
                  const n = kids[j]!
                  const active = n.id === note
                  const r0 = R.noteIn + 14
                  const nflip = flipRadial(ns.mid + rotation)
                  const p = polar(C, C, nflip ? R.noteOut - 12 : r0, ns.mid)
                  return (
                    <g key={n.id} className={styles.note} data-active={active}>
                      <path
                        d={arcPath(C, C, R.noteIn, R.noteOut, ns.start, ns.end)}
                        fill={info.colour}
                        className={styles.notePath}
                        role="button"
                        tabIndex={0}
                        aria-label={`${n.name}, ${info.label.toLowerCase()} note`}
                        aria-pressed={active}
                        onClick={() => !suppressClick.current && onSelect(f, n.id)}
                        onKeyDown={(e) => activate(e, () => onSelect(f, n.id))}
                      />
                      <text
                        x={p.x}
                        y={p.y}
                        className={styles.noteLabel}
                        transform={`rotate(${ns.mid - 90 + (nflip ? 180 : 0)} ${p.x} ${p.y})`}
                        textAnchor="start"
                        aria-hidden
                      >
                        {n.name.length > 13 ? n.name.slice(0, 12) + '…' : n.name}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
        <circle cx={C} cy={C} r={R.hub} className={styles.hub} />
        <text x={C} y={C - 8} className={styles.hubSmall} aria-hidden>
          {note ? 'note' : 'family'}
        </text>
        <text x={C} y={C + 22} className={styles.hubLabel} aria-hidden>
          {familyInfo[family].label}
        </text>
        <path d="M300 2 l-9 -0 l9 14 l9 -14 Z" className={styles.pointer} aria-hidden />
      </svg>
    </div>
  )
}
