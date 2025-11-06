import { describe, expect, test } from 'vitest';
import { draftProposal } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedTitleKeywords: (string | string[])[];
  expectedDescriptionKeywords: (string | string[])[];
}

const MAX_ATTEMPTS = 3;
const MIN_PASS_RATE = 0.6;

const scenarios: TestScenario[] = [
  {
    description: 'should draft a proposal for a meeting schedule',
    messages: [
      { sender: 'Alice', body: 'So we all agree on meeting Thursdays at 2pm?' },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
    expectedTitleKeywords: [['meeting', 'decision'], 'thursday', '2pm'],
    expectedDescriptionKeywords: ['thursday', ['2pm', '2 pm']],
  },
  {
    description: 'should handle conversations with no clear outcome gracefully',
    messages: [
      { sender: 'Alice', body: 'Should we order pizza or tacos?' },
      { sender: 'Bob', body: 'I like both.' },
      { sender: 'Charlie', body: 'Maybe we should just flip a coin.' },
    ],
    expectedTitleKeywords: [['proposal', 'decision', 'food']],
    expectedDescriptionKeywords: [['pizza', 'tacos', 'food']],
  },
];

describe('draftProposal', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({
      description,
      expectedDescriptionKeywords,
      expectedTitleKeywords,
      messages,
    }) => {
      let passingAttempts = 0;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const result = await draftProposal({ messages });

        // Ensure the result has the correct shape
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('description');
        expect(typeof result.title).toBe('string');
        expect(typeof result.description).toBe('string');

        let attemptPassed = true;

        // Check if the title contains the expected keywords
        const title = result.title.toLowerCase();
        for (const keywordOrKeywords of expectedTitleKeywords) {
          if (Array.isArray(keywordOrKeywords)) {
            const found = keywordOrKeywords.some((keyword) =>
              title.includes(keyword.toLowerCase()),
            );
            if (!found) {
              attemptPassed = false;
              break;
            }
          } else if (!title.includes(keywordOrKeywords.toLowerCase())) {
            attemptPassed = false;
            break;
          }
        }

        if (attemptPassed) {
          const proposalDescription = result.description.toLowerCase();
          for (const keywordOrKeywords of expectedDescriptionKeywords) {
            if (Array.isArray(keywordOrKeywords)) {
              const found = keywordOrKeywords.some((keyword) =>
                proposalDescription.includes(keyword.toLowerCase()),
              );
              if (!found) {
                attemptPassed = false;
                break;
              }
            } else if (
              !proposalDescription.includes(keywordOrKeywords.toLowerCase())
            ) {
              attemptPassed = false;
              break;
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
    60000, // 60-second timeout for each test case
  );
});
