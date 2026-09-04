import { describe, expect, it } from 'vitest'
import { createGame, guess, revealedCharacters } from './hangmanGame'

describe('Hangman rules', () => {
  it('reveals all matching letters, while automatically revealing punctuation', () => {
    const game = guess(createGame("Papa's Hat"), 'p')
    expect(revealedCharacters(game.answer, game.guessedLetters).map(({ char, isRevealed }) => [char, isRevealed])).toEqual([['P', true], ['a', false], ['p', true], ['a', false], ["'", true], ['s', false], [' ', true], ['H', false], ['a', false], ['t', false]])
  })
  it('normalizes case and does not count duplicates', () => { const first = guess(createGame('Cat'), 'C'); expect(guess(first, 'c')).toEqual(first) })
  it('loses exactly on the sixth wrong guess', () => { let game = createGame('A'); for (const letter of 'bcdef') game = guess(game, letter); expect(game.status).toBe('playing'); game = guess(game, 'g'); expect(game).toMatchObject({ incorrectGuesses: 6, status: 'lost' }) })
  it('wins when every distinct answer letter is guessed', () => { let game = createGame('A-A'); game = guess(game, 'a'); expect(game.status).toBe('won') })
})
