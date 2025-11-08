import { describe, expect, test } from 'vitest';
import { getCompromises } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedKeywords: (string | string[])[];
  isCompromiseExpected: boolean;
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
    expectedKeywords: [
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
    isCompromiseExpected: true,
  },
  {
    description:
      'should not identify compromises when there are no disagreements',
    messages: [
      { sender: 'Alice', body: 'Should we meet at 2pm tomorrow?' },
      { sender: 'Bob', body: 'Yes, 2pm works perfectly for me.' },
      { sender: 'Alice', body: 'Great! See you then.' },
    ],
    expectedKeywords: [],
    isCompromiseExpected: false,
  },
];

describe('getCompromises', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      description,
      isCompromiseExpected,
      expectedKeywords,
      messages,
    }) => {
      let passingAttempts = 0;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const result = await getCompromises({ messages });
        const isResultEmpty = result.compromises.length === 0;
        const allCompromises = result.compromises.join(' ').toLowerCase();

        // Check result shape
        expect(result).toHaveProperty('compromises');
        expect(Array.isArray(result.compromises)).toBe(true);

        const isValidResult = () => {
          if (!isCompromiseExpected) {
            return isResultEmpty;
          }
          if (isResultEmpty) {
            return false;
          }

          return expectedKeywords.every((keywordOrKeywords) => {
            const keywords = Array.isArray(keywordOrKeywords)
              ? keywordOrKeywords
              : [keywordOrKeywords];

            return keywords.some((keyword) =>
              allCompromises.includes(keyword.toLowerCase()),
            );
          });
        };

        if (isValidResult()) {
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
