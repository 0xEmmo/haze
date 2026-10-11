import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { usePageTitle } from '@/hooks/usePageTitle'
import { decodeAnswers, encodeAnswers, MOMENTS, type QuizAnswers, type Swipe } from '@/lib/quiz'
import { QuizIntro } from './QuizIntro'
import { QuizResult } from './QuizResult'
import { SliderStep } from './SliderStep'
import { SwipeDeck } from './SwipeDeck'

type Step = 'intro' | 'swipe' | 'sliders'

export default function QuizPage() {
  const [params, setParams] = useSearchParams()
  const result = useMemo(() => decodeAnswers(params), [params])
  const [step, setStep] = useState<Step>('intro')
  const [swipes, setSwipes] = useState<Record<string, Swipe>>({})
  usePageTitle(result ? 'Your matches' : 'Find your scent')

  if (result) {
    return (
      <QuizResult
        answers={result}
        onRestart={() => {
          setSwipes({})
          setStep('swipe')
          setParams({}, { replace: false })
        }}
      />
    )
  }

  if (step === 'intro') return <QuizIntro onStart={() => setStep('swipe')} />

  if (step === 'swipe') {
    return (
      <SwipeDeck
        swipes={swipes}
        onSwipe={(id, s) => {
          const next = { ...swipes, [id]: s }
          setSwipes(next)
          if (Object.keys(next).length === MOMENTS.length) setStep('sliders')
        }}
        onUndo={() => {
          const answered = MOMENTS.filter((m) => m.id in swipes)
          const last = answered[answered.length - 1]
          if (!last) return
          const next = { ...swipes }
          delete next[last.id]
          setSwipes(next)
        }}
      />
    )
  }

  return (
    <SliderStep
      onBack={() => {
        const next = { ...swipes }
        delete next[MOMENTS[MOMENTS.length - 1]!.id]
        setSwipes(next)
        setStep('swipe')
      }}
      onDone={(s) => {
        const answers: QuizAnswers = { swipes, ...s }
        setParams(new URLSearchParams(encodeAnswers(answers)))
        window.scrollTo({ top: 0 })
      }}
    />
  )
}
