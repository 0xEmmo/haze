import { Photo } from '@/components/Photo'
import styles from './Quiz.module.css'

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className={`wrap ${styles.intro}`}>
      <div className={styles.introText}>
        <p className="eyebrow">Scent quiz · about two minutes</p>
        <h1 className="display">
          You already know what you like. <em>We’ll translate.</em>
        </h1>
        <p className={styles.lede}>
          Eight smells you’ve met before. Keep the ones that make you lean in, pass on the ones that don’t. Then three quick sliders, and
          we’ll match you to our perfumes and tell you why.
        </p>
        <button type="button" className="btn btn-ember" onClick={onStart}>
          Start
        </button>
        <p className="hint">No email needed. Your answers live in the link, so you can share the result.</p>
      </div>
      <Photo name="p-woman-flowers" alt="A woman with roses in her hair, eyes closed, smelling a flower" sizes="(min-width: 960px) 40vw, 100vw" ratio={4 / 5} priority className={styles.introPhoto} />
    </div>
  )
}
