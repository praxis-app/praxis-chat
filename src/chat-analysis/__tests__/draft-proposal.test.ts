import { describe, expect, test } from 'vitest';
import { draftProposal } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedTitleKeywords: (string | string[])[];
  expectedDescriptionKeywords: (string | string[])[];
}

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
    description: 'should draft a proposal for a technical decision',
    messages: [
      {
        sender: 'Dev1',
        body: 'I think we should use TypeScript for the new service.',
      },
      { sender: 'Dev2', body: 'Agreed, TypeScript will give us type safety.' },
      {
        sender: 'Dev3',
        body: "I was leaning towards Python, but I can agree with TypeScript if we don't use strict mode.",
      },
      {
        sender: 'Dev1',
        body: 'Deal. TypeScript without strict mode it is.',
      },
    ],
    expectedTitleKeywords: [
      ['technical', 'decision'],
      ['typescript', 'language'],
    ],
    expectedDescriptionKeywords: ['typescript', 'strict'],
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
      const result = await draftProposal({ messages });
      console.info({ description, result });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(typeof result.title).toBe('string');
      expect(typeof result.description).toBe('string');

      // Check if the title contains the expected keywords
      const title = result.title.toLowerCase();
      for (const keywordOrKeywords of expectedTitleKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) => title.includes(k));
          expect(found).toBe(true);
        } else {
          expect(title).toContain(keywordOrKeywords);
        }
      }

      // Check if the description contains the expected keywords
      const proposalDescription = result.description.toLowerCase();
      for (const keywordOrKeywords of expectedDescriptionKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            proposalDescription.includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(proposalDescription).toContain(keywordOrKeywords);
        }
      }
    },
    60000, // 60-second timeout for each test case
  );
});
