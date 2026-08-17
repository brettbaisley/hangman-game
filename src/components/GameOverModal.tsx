import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import type { GameStatus } from '../lib/hangman'

type GameOverModalProps = {
  status: GameStatus
  secretWord: string
  onPlayAgain: () => void
}

export function GameOverModal({ status, secretWord, onPlayAgain }: GameOverModalProps) {
  const playAgainRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    playAgainRef.current?.focus()
  }, [])

  const isWinner = status === 'won'
  const confettiPieces = useMemo(() => {
    if (!isWinner) {
      return []
    }

    return Array.from({ length: 48 }, (_, index) => {
      const spread = ((index % 12) / 11) * 100
      const delay = (index % 8) * 55
      const duration = 900 + (index % 5) * 140
      const drift = (index % 2 === 0 ? 1 : -1) * (20 + (index % 6) * 4)
      const hue = 18 + (index * 17) % 300

      return {
        id: `${index}`,
        style: {
          left: `${spread}%`,
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          '--drift': `${drift}px`,
          '--hue': `${hue}`,
        } as CSSProperties,
      }
    })
  }, [isWinner])

  return (
    <div className="modal-backdrop" role="presentation">
      {isWinner && (
        <div className="confetti-layer" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span key={piece.id} className="confetti-piece" style={piece.style} />
          ))}
        </div>
      )}
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="gameResultTitle">
        <h2 id="gameResultTitle" className="modal-title">
          {isWinner ? 'You solved it!' : 'Game over'}
        </h2>
        <p className="modal-copy">
          {isWinner
            ? 'All letters were revealed before the final strike.'
            : 'The hanging is complete. Better luck next round.'}
        </p>
        <p className="modal-word">
          Secret phrase: <strong>{secretWord}</strong>
        </p>
        <button ref={playAgainRef} className="primary-button" type="button" onClick={onPlayAgain}>
          Play Again
        </button>
      </section>
    </div>
  )
}
