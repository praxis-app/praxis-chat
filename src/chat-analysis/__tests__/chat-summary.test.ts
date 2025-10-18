import { describe, expect, test } from 'vitest';
import { getChatSummary } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedSummaryKeywords: (string | string[])[];
}

const scenarios: TestScenario[] = [
  {
    description: 'should summarize a meeting schedule discussion',
    messages: [
      { sender: 'Alice', body: 'We need to decide on our meeting schedule' },
      { sender: 'Bob', body: 'What are the options?' },
      { sender: 'Charlie', body: "I'm not sure what works for everyone" },
      {
        sender: 'Alice',
        body: 'So we all agree on meeting Thursdays at 2pm?',
      },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
    expectedSummaryKeywords: [
      ['schedule', 'scheduling', 'time'],
      ['2pm', '2 pm'],
      'meeting',
      'thursday',
    ],
  },
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
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({ description, messages, expectedSummaryKeywords }) => {
      const summary = await getChatSummary({ messages });
      console.info({ description, result: summary });

      // Ensure the summary is a non-empty string
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);

      // Ensure summary is shorter than the original messages
      const conversationSize = messages.reduce(
        (acc, { sender, body }) => acc + sender.length + body.length,
        0,
      );
      expect(summary.length).toBeLessThan(conversationSize);

      // Check if the summary contains the expected keywords
      for (const keywordOrKeywords of expectedSummaryKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            summary.toLowerCase().includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(summary.toLowerCase()).toContain(keywordOrKeywords);
        }
      }
    },
    60000, // 60-second timeout for each test case
  );
});
