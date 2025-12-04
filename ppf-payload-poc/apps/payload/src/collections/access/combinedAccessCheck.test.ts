import { describe, expect, test } from 'vitest'

import { Access, AccessArgs } from "payload";
import { combinedAccessCheck } from "./combinedAccessCheck"

type TestCase = { checkers: boolean[], expectedResult: boolean }
type TestCases = Record<keyof typeof combinedAccessCheck, TestCase[]>
const testCases: TestCases = {
  or: [
    { checkers: [true], expectedResult: true },
    { checkers: [false], expectedResult: false },
    { checkers: [false, false, false], expectedResult: false },
    { checkers: [false, true, false], expectedResult: true },
    { checkers: [true, true, true], expectedResult: true },
  ],
  and: [
    { checkers: [true], expectedResult: true },
    { checkers: [false], expectedResult: false },
    { checkers: [false, false, false], expectedResult: false },
    { checkers: [false, true, false], expectedResult: false },
    { checkers: [true, true, true], expectedResult: true },
  ]
}

describe('combinedAccessCheck', () => {
  const accessArgs: AccessArgs = {} as unknown as AccessArgs;
  Object.entries(testCases).map(([key, testCases]) =>
    describe(key, () => {
      const check = combinedAccessCheck[key as keyof typeof combinedAccessCheck]
      describe('access', () => {
        testCases.map(({ checkers, expectedResult }) =>
          test(`${checkers} -> ${expectedResult}`, async () => {
            const accessCheckers = checkers.map(x => () => x) satisfies Access[]
            const checker = check.access(...accessCheckers)
            expect(await checker(accessArgs)).toBe(expectedResult)
          })
        )
      })
      describe('fieldAccess', () => {
        testCases.map(({ checkers, expectedResult }) =>
          test(`${checkers} -> ${expectedResult}`, async () => {
            const accessCheckers = checkers.map(x => () => x) satisfies Access[]
            const checker = check.fieldAccess(...accessCheckers)
            expect(await checker(accessArgs)).toBe(expectedResult)
          })
        )
      })
    }))
});