import { describe, expect, test } from 'vitest';
import { getChatSummary } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedSummaryKeywords: (string | string[])[];
}

const MAX_ATTEMPTS = 3;
const MIN_PASS_RATE = 0.6;

const scenarios: TestScenario[] = [
  {
    description: 'should summarize food co-op planning discussion',
    messages: [
      { sender: 'Sarah', body: 'We need to order more organic vegetables' },
      { sender: 'Mike', body: 'The current supplier is too expensive' },
      { sender: 'Lisa', body: 'I found a local farm that offers 20% discount' },
      { sender: 'Sarah', body: 'What about delivery schedule?' },
      { sender: 'Mike', body: 'They can deliver twice weekly' },
      { sender: 'Lisa', body: 'Perfect, should we switch to them?' },
      { sender: 'Sarah', body: 'Yes, approved for next month' },
    ],
    expectedSummaryKeywords: [
      ['vegetables', 'organic'],
      ['supplier', 'farm'],
      ['discount', 'cheaper'],
      'delivery',
    ],
  },
];

describe('getChatSummary', () => {
  test.each(scenarios)(
    '$description',
    async ({ description, messages, expectedSummaryKeywords }) => {
      console.info(description);

      let passingAttempts = 0;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const summary = await getChatSummary({ messages });
        console.info({ attempt: attempt + 1, result: summary });

        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);

        const conversationSize = messages.reduce(
          (acc, { sender, body }) => acc + sender.length + body.length,
          0,
        );

        expect(summary.length).toBeLessThan(conversationSize);

        const normalizedSummary = summary.toLowerCase();
        let attemptPassed = true;

        for (const keywordOrKeywords of expectedSummaryKeywords) {
          if (Array.isArray(keywordOrKeywords)) {
            const found = keywordOrKeywords.some((keyword) =>
              normalizedSummary.includes(keyword.toLowerCase()),
            );
            if (!found) {
              attemptPassed = false;
              break;
            }
          } else if (
            !normalizedSummary.includes(keywordOrKeywords.toLowerCase())
          ) {
            attemptPassed = false;
            break;
          }
        }

        if (attemptPassed) {
          passingAttempts += 1;
        }
      }

      const passRate = passingAttempts / MAX_ATTEMPTS;
      console.info({ passingAttempts, passRate });

      expect(passRate).toBeGreaterThanOrEqual(MIN_PASS_RATE);
    },
    60000, // 60-second timeout for each test case
  );
});
