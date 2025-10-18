import { describe, expect, test } from 'vitest';
import { getDisagreements } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedDisagreementKeywords: (string | string[])[];
  expectedDisagreement: boolean;
}

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
  // TODO: Add tests back after fixing issues with gpt-oss:20b model
  // {
  //   description: 'should not identify disagreements when participants agree',
  //   messages: [
  //     { sender: 'Alice', body: 'I think this proposal is excellent.' },
  //     { sender: 'Bob', body: 'I agree, it covers all the key points.' },
  //     { sender: 'Charlie', body: 'Yes, I’m on board with this.' },
  //   ],
  //   expectedDisagreementKeywords: [],
  //   expectedDisagreement: false,
  // },
  // {
  //   description: 'should handle empty messages gracefully',
  //   messages: [],
  //   expectedDisagreementKeywords: [],
  //   expectedDisagreement: false,
  // },
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
      const result = await getDisagreements({ messages });
      console.info({ description, result });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('disagreements');
      expect(Array.isArray(result.disagreements)).toBe(true);

      // Account for scenarios where there are no expected disagreements
      if (!expectedDisagreement) {
        expect(result.disagreements.length).toBe(0);
        return;
      }
      expect(result.disagreements.length).toBeGreaterThan(0);

      // Check if the disagreements contain the expected keywords
      const allDisagreements = result.disagreements.join(' ').toLowerCase();
      for (const keywordOrKeywords of expectedDisagreementKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            allDisagreements.includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(allDisagreements).toContain(keywordOrKeywords);
        }
      }
    },
    300000, // 5-minute timeout for each test case to accommodate slow gpt-oss:20b model
  );
});
