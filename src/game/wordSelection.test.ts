import { describe, expect, it } from 'vitest'
import { selectWord } from './wordSelection'
describe('word selection', () => { it('avoids the immediately previous answer when possible', () => expect(selectWord(['A', 'B'], 'A', () => 0)).toBe('B')); it('supports a single entry list', () => expect(selectWord(['A'], 'A')).toBe('A')) })
