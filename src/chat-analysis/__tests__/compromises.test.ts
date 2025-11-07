import { describe, expect, test } from 'vitest';
import { getCompromises } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedCompromiseKeywords: (string | string[])[];
  expectedCompromise: boolean;
}

const MAX_ATTEMPTS = 3;
const MIN_PASS_RATE = 0.6;

const scenarios: TestScenario[] = [
  {
    description: 'should identify potential compromises in the conversation',
    messages: [
      { sender: 'Alice', body: "I'd prefer to meet in the morning." },
      { sender: 'Bob', body: 'I can only do afternoons.' },
      { sender: 'Alice', body: 'Morning works much better with my schedule.' },
      {
        sender: 'Bob',
        body: 'Sorry, I have meetings all morning every day this week.',
      },
    ],
    expectedCompromiseKeywords: [
      [
        'noon',
        'lunch',
        'midday',
        '12pm',
        '1pm',
        'late morning',
        'early afternoon',
      ],
    ],
    expectedCompromise: true,
  },
  {
    description:
      'should not identify compromises when there are no disagreements',
    messages: [
      { sender: 'Alice', body: 'Should we meet at 2pm tomorrow?' },
      { sender: 'Bob', body: 'Yes, 2pm works perfectly for me.' },
      { sender: 'Alice', body: 'Great! See you then.' },
    ],
    expectedCompromiseKeywords: [],
    expectedCompromise: false,
  },
];

describe('getCompromises', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      description,
      expectedCompromise,
      expectedCompromiseKeywords,
      messages,
    }) => {
      let passingAttempts = 0;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const result = await getCompromises({ messages });

        console.log('result', result);

        // Ensure the result has the correct shape
        expect(result).toHaveProperty('compromises');
        expect(Array.isArray(result.compromises)).toBe(true);

        let attemptPassed = true;

        if (!expectedCompromise) {
          if (result.compromises.length !== 0) {
            attemptPassed = false;
          }
        } else {
          if (result.compromises.length === 0) {
            attemptPassed = false;
          } else {
            const allCompromises = result.compromises.join(' ').toLowerCase();
            for (const keywordOrKeywords of expectedCompromiseKeywords) {
              const keywords = Array.isArray(keywordOrKeywords)
                ? keywordOrKeywords
                : [keywordOrKeywords];

              const found = keywords.some((keyword) =>
                allCompromises.includes(keyword.toLowerCase()),
              );
              if (!found) {
                attemptPassed = false;
                break;
              }
            }
          }
        }

        if (attemptPassed) {
          passingAttempts += 1;
        }
      }

      const passRate = passingAttempts / MAX_ATTEMPTS;
      console.info({ description, passingAttempts, passRate });

      expect(passRate).toBeGreaterThanOrEqual(MIN_PASS_RATE);
    },
    90000, // 90-second timeout for each test case
  );
});
