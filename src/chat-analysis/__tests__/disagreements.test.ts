import { describe, expect, test } from 'vitest';
import { getDisagreements } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedDisagreementKeywords: (string | string[])[];
  expectedDisagreement: boolean;
}

const MAX_ATTEMPTS = 3;
const MIN_PASS_RATE = 0.6;

const scenarios: TestScenario[] = [
  {
    description: 'should identify disagreements in the conversation',
    messages: [
      { sender: 'Alice', body: 'I think we should use a blue color scheme.' },
      { sender: 'Bob', body: 'No, I think red is much better.' },
      {
        sender: 'Charlie',
        body: 'I disagree with both, green would be the best option.',
      },
    ],
    expectedDisagreementKeywords: [
      ['blue', 'red', 'green', 'color', 'disagree'],
    ],
    expectedDisagreement: true,
  },
];

describe('getDisagreements', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      description,
      expectedDisagreement,
      expectedDisagreementKeywords,
      messages,
    }) => {
      let passingAttempts = 0;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const result = await getDisagreements({ messages });

        // Ensure the result has the correct shape
        expect(result).toHaveProperty('disagreements');
        expect(Array.isArray(result.disagreements)).toBe(true);

        let attemptPassed = true;

        // Account for scenarios where there are no expected disagreements
        if (!expectedDisagreement) {
          if (result.disagreements.length !== 0) {
            attemptPassed = false;
          }
        } else {
          if (result.disagreements.length === 0) {
            attemptPassed = false;
          } else {
            const allDisagreements = result.disagreements
              .join(' ')
              .toLowerCase();
            for (const keywordOrKeywords of expectedDisagreementKeywords) {
              if (Array.isArray(keywordOrKeywords)) {
                const found = keywordOrKeywords.some((keyword) =>
                  allDisagreements.includes(keyword.toLowerCase()),
                );
                if (!found) {
                  attemptPassed = false;
                  break;
                }
              } else if (
                !allDisagreements.includes(keywordOrKeywords.toLowerCase())
              ) {
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
