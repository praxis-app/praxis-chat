import { isReadyForProposal } from '../chat-analysis.service';

interface TestScenario {
  description: string;
  messages: { sender: string; body: string }[];
  expected: boolean;
  reasonContains?: string;
}

const scenarios: TestScenario[] = [
  {
    description:
      'should return true for conversations that are ready for proposal',
    messages: [
      {
        sender: 'Alice',
        body: 'So we all agree on meeting Thursdays at 2pm?',
      },
      { sender: 'Bob', body: 'Yes, Thursday works for me' },
      { sender: 'Charlie', body: 'Thursday at 2pm is perfect' },
      { sender: 'Alice', body: "Great, let's lock that in" },
    ],
    expected: true,
  },
  {
    description:
      'should correctly identify final decisions in conversations with changed minds',
    messages: [
      { sender: 'Alice', body: "Let's meet on Mondays" },
      { sender: 'Bob', body: 'Monday works' },
      { sender: 'Charlie', body: 'Actually, I have conflicts on Monday' },
      { sender: 'Alice', body: 'How about Thursday instead?' },
      { sender: 'Bob', body: 'Thursday is better for me too' },
      { sender: 'Charlie', body: "Yes, let's do Thursday" },
    ],
    expected: true,
    reasonContains: 'thursday',
  },
  {
    description:
      'should return false for conversations that are not ready for proposal',
    messages: [
      { sender: 'Alice', body: 'We need to decide on our meeting schedule' },
      { sender: 'Bob', body: 'What are the options?' },
      { sender: 'Charlie', body: "I'm not sure what works for everyone" },
    ],
    expected: false,
  },
];

describe('isReadyForProposal', () => {
  // Parameterized test for all defined scenarios
  test.each(scenarios)(
    '$description',
    async ({ description, messages, expected, reasonContains }) => {
      const result = await isReadyForProposal({ messages });
      console.info({ description, result });

      // Ensure the response has the correct shape
      expect(result).toHaveProperty('isReady');
      expect(result).toHaveProperty('reason');

      // Assert the expected outcome
      expect(result.isReady).toBe(expected);

      // Optionally, check if the reason contains a specific substring
      if (reasonContains && result.reason) {
        expect(result.reason.toLowerCase()).toContain(reasonContains);
      }
    },
    60000, // 60-second timeout for each test case
  );
});
