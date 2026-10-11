/** The Haze wordmark: set in Fraunces with the soft, wonky italic "a". */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'SOFT' 100, 'WONK' 1", letterSpacing: '-0.03em' }}>
      H<em style={{ fontStyle: 'italic' }}>a</em>ze
    </span>
  )
}
