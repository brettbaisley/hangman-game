import { useState, type FormEvent } from 'react'
import { isValidSecretWord, sanitizeSecretWordInput } from '../lib/hangman'

type SecretWordFormProps = {
  onStart: (secretWord: string) => void
}

export function SecretWordForm({ onStart }: SecretWordFormProps) {
  const [secretWord, setSecretWord] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanedWord = secretWord.trim()

    if (!cleanedWord) {
      setErrorMessage('Enter a word or phrase to begin.')
      return
    }

    if (!isValidSecretWord(cleanedWord)) {
      setErrorMessage('Use letters only. Spaces are allowed for phrases.')
      return
    }

    onStart(cleanedWord)
    setErrorMessage('')
    setSecretWord('')
  }

  return (
    <form className="entry-card" onSubmit={handleSubmit}>
      <p className="eyebrow">A two-player word game</p>
      <h1 className="title">Neon Gallows</h1>
      <p className="subtitle">Set a secret phrase, pass the device, and let the guessing begin.</p>

      <label className="field-label" htmlFor="secretWord">
        Secret word or phrase
      </label>
      <input
        id="secretWord"
        className="secret-input"
        autoFocus
        value={secretWord}
        onChange={(event) => {
          const sanitizedValue = sanitizeSecretWordInput(event.target.value)
          setSecretWord(sanitizedValue)

          if (sanitizedValue !== event.target.value) {
            setErrorMessage('Only letters and spaces are allowed.')
            return
          }

          if (errorMessage) {
            setErrorMessage('')
          }
        }}
        inputMode="text"
        autoCapitalize="none"
        placeholder="Example: giant jellyfish"
      />

      {errorMessage && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button className="primary-button" type="submit">
        Begin the round <span aria-hidden="true">→</span>
      </button>

      <ul className="rules-list" aria-label="How to play">
        <li>Miss 6 letters and the hanging is complete.</li>
        <li>Secret words may contain letters and spaces only.</li>
        <li>Guess all letters before the final body part appears.</li>
      </ul>
    </form>
  )
}
