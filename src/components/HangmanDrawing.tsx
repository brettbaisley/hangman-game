type HangmanDrawingProps = {
  misses: number
}

export function HangmanDrawing({ misses }: HangmanDrawingProps) {
  return (
    <section className="panel" aria-label="Hangman drawing">
      <h2 className="panel-title">Gallows</h2>
      <svg className="hangman-svg" viewBox="0 0 220 240" role="img" aria-label={`Incorrect guesses: ${misses} out of 6`}>
        <line x1="20" y1="220" x2="200" y2="220" className="wood" />
        <line x1="58" y1="220" x2="58" y2="28" className="wood" />
        <line x1="58" y1="28" x2="142" y2="28" className="wood" />
        <line x1="142" y1="28" x2="142" y2="55" className="wood" />

        {misses > 0 && <circle cx="142" cy="76" r="20" pathLength="1" className="body-part body-part-head" />}
        {misses > 1 && <line x1="142" y1="96" x2="142" y2="148" pathLength="1" className="body-part" />}
        {misses > 2 && <line x1="142" y1="114" x2="116" y2="134" pathLength="1" className="body-part" />}
        {misses > 3 && <line x1="142" y1="114" x2="168" y2="134" pathLength="1" className="body-part" />}
        {misses > 4 && <line x1="142" y1="148" x2="120" y2="184" pathLength="1" className="body-part" />}
        {misses > 5 && <line x1="142" y1="148" x2="164" y2="184" pathLength="1" className="body-part" />}
      </svg>
    </section>
  )
}
