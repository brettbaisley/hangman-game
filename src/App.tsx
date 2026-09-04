import { useCallback, useEffect, useState } from 'react'
import words from './data/words.json'
import { AnswerDisplay } from './components/AnswerDisplay'
import { GameKeyboard } from './components/GameKeyboard'
import { HangmanDrawing } from './components/HangmanDrawing'
import { GameOverlay } from './components/GameOverlay'
import { createGame, guess, type HangmanGameState } from './game/hangmanGame'
import { selectWord } from './game/wordSelection'
import styles from './App.module.css'

const testAnswer = new URLSearchParams(window.location.search).get('answer')
function nextAnswer(previousAnswer?: string) { return testAnswer ?? selectWord(words.entries, previousAnswer) }

export default function App() {
  const [screen, setScreen] = useState<'home' | 'game'>('home')
  const [previousAnswer, setPreviousAnswer] = useState<string | undefined>()
  const [game, setGame] = useState<HangmanGameState>(() => createGame(nextAnswer()))
  const [confirmingNewGame, setConfirmingNewGame] = useState(false)
  const startGame = useCallback(() => { const answer = nextAnswer(previousAnswer); setPreviousAnswer(answer); setGame(createGame(answer)); setConfirmingNewGame(false); setScreen('game') }, [previousAnswer])
  const makeGuess = useCallback((letter: string) => setGame((current) => guess(current, letter)), [])
  useEffect(() => { if (screen !== 'game' || game.status !== 'playing') return; const onKeyDown = (event: KeyboardEvent) => { if (/^[a-z]$/i.test(event.key)) { event.preventDefault(); makeGuess(event.key) } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [game.status, makeGuess, screen])
  function goHome() { setConfirmingNewGame(false); setScreen('home') }
  return <main className={styles.app}>{screen === 'home' ? <section className={styles.home} aria-labelledby="home-title"><div className={styles.homeArt} aria-hidden="true"><span>?</span></div><p className={styles.kicker}>A word game for bright minds</p><h1 id="home-title">Hangman</h1><p className={styles.homeCopy}>Guess the secret word before the drawing is complete.</p><button className={styles.playButton} type="button" onClick={startGame}>Play <span aria-hidden="true">→</span></button></section> : <section className={styles.game} aria-label="Hangman game"><header className={styles.topBar}><button className={styles.textButton} type="button" onClick={goHome}>Home</button><p className={styles.misses} aria-live="polite"><span aria-hidden="true">♥</span> Misses {game.incorrectGuesses}/6</p><button className={styles.textButton} type="button" onClick={() => game.status === 'playing' ? setConfirmingNewGame(true) : startGame()}>New Game</button></header><div className={styles.board}><HangmanDrawing misses={game.incorrectGuesses} /><AnswerDisplay answer={game.answer} guessedLetters={game.guessedLetters} revealAll={game.status === 'lost'} /></div><GameKeyboard guessedLetters={game.guessedLetters} answer={game.answer} disabled={game.status !== 'playing'} onGuess={makeGuess} />{confirmingNewGame && <div className={styles.confirmBackdrop} role="presentation"><section className={styles.confirm} role="dialog" aria-modal="true" aria-labelledby="new-game-title"><h2 id="new-game-title">Start new game?</h2><p>Your current word will be abandoned.</p><div><button className={styles.secondaryButton} type="button" onClick={() => setConfirmingNewGame(false)}>No</button><button className={styles.playButton} type="button" onClick={startGame}>Yes</button></div></section></div>}{game.status !== 'playing' && <GameOverlay game={game} onPlayAgain={startGame} />}</section>}</main>
}
