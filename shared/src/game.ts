export type RoundStatus = "in_progress" | "won" | "lost";

export type Difficulty = "easy" | "medium" | "hard";

export type GuessResultCode = "correct" | "wrong" | "duplicate" | "invalid";

export interface SinglePlayerRound {
  id: string;
  word: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  status: RoundStatus;
  createdAtIso: string;
}

export interface PublicRoundState {
  id: string;
  maskedWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  attemptsLeft: number;
  status: RoundStatus;
}

export interface GuessOutcome {
  code: GuessResultCode;
  letter: string;
  state: PublicRoundState;
}

const WORD_BANK: Record<Difficulty, string[]> = {
  easy: ["apple", "chair", "beach", "light", "plant"],
  medium: ["planet", "window", "rocket", "silver", "jungle"],
  hard: ["mystery", "puzzling", "vortex", "zephyrs", "awkward"],
};

const MAX_WRONG_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 8,
  medium: 7,
  hard: 6,
};

export function createSinglePlayerRound(difficulty: Difficulty): SinglePlayerRound {
  const words = WORD_BANK[difficulty];
  const word = words[Math.floor(Math.random() * words.length)];

  return {
    id: crypto.randomUUID(),
    word,
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_BY_DIFFICULTY[difficulty],
    status: "in_progress",
    createdAtIso: new Date().toISOString(),
  };
}

export function toPublicRoundState(round: SinglePlayerRound): PublicRoundState {
  const attemptsLeft = Math.max(round.maxWrongGuesses - round.wrongGuesses, 0);
  const maskedWord = round.word
    .split("")
    .map((character) => (round.guessedLetters.includes(character) ? character : "_"))
    .join(" ");

  return {
    id: round.id,
    maskedWord,
    guessedLetters: [...round.guessedLetters],
    wrongGuesses: round.wrongGuesses,
    maxWrongGuesses: round.maxWrongGuesses,
    attemptsLeft,
    status: round.status,
  };
}

export function submitGuess(round: SinglePlayerRound, rawLetter: string): GuessOutcome {
  const letter = rawLetter.toLowerCase().trim();

  if (!/^[a-z]$/.test(letter) || round.status !== "in_progress") {
    return {
      code: "invalid",
      letter,
      state: toPublicRoundState(round),
    };
  }

  if (round.guessedLetters.includes(letter)) {
    return {
      code: "duplicate",
      letter,
      state: toPublicRoundState(round),
    };
  }

  round.guessedLetters.push(letter);

  if (round.word.includes(letter)) {
    const allRevealed = round.word.split("").every((character) => round.guessedLetters.includes(character));
    if (allRevealed) {
      round.status = "won";
    }

    return {
      code: "correct",
      letter,
      state: toPublicRoundState(round),
    };
  }

  round.wrongGuesses += 1;
  if (round.wrongGuesses >= round.maxWrongGuesses) {
    round.status = "lost";
  }

  return {
    code: "wrong",
    letter,
    state: toPublicRoundState(round),
  };
}
