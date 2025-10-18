import { getCompromises } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expectedCompromiseKeywords: (string | string[])[];
  expectedCompromise: boolean;
}

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
      const result = await getCompromises({ messages });
      console.info({ description, result });

      // Ensure the result has the correct shape
      expect(result).toHaveProperty('compromises');
      expect(Array.isArray(result.compromises)).toBe(true);

      // Account for scenarios where there are no expected compromises
      if (!expectedCompromise) {
        expect(result.compromises.length).toBe(0);
        return;
      }
      expect(result.compromises.length).toBeGreaterThan(0);

      // Check if the compromises contain the expected keywords
      const allCompromises = result.compromises.join(' ').toLowerCase();
      for (const keywordOrKeywords of expectedCompromiseKeywords) {
        if (Array.isArray(keywordOrKeywords)) {
          const found = keywordOrKeywords.some((k) =>
            allCompromises.includes(k),
          );
          expect(found).toBe(true);
        } else {
          expect(allCompromises).toContain(keywordOrKeywords);
        }
      }
    },
    90000,
  );
});
