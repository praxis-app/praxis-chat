# Proposal Ratification

## Overview

This document explains how agreement threshold and quorum are evaluated for proposal ratification in Praxis. Understanding the distinction between these two checks is important because they use different bases for calculation.

## Proposals and Polls

In Praxis, proposals are implemented as a type of poll (`pollType: 'proposal'`). The Poll entity serves as the base abstraction for all decision-making processes, with proposals being the primary use case for formal voting and ratification.

For more details on this architecture, see [Poll Entity Architecture](./poll-entity-architecture.md).

## Quorum

Quorum determines the minimum number of votes required before a proposal can be considered for ratification. When quorum is enabled, the system checks whether enough channel members have participated in the vote.

### Calculation Basis

Quorum is calculated based on the **total member count of the channel** where the proposal was created:

```
requiredQuorum = Math.ceil(memberCount * (quorumThreshold / 100))
```

- `memberCount`: Total number of members in the proposal's channel
- `quorumThreshold`: Percentage configured in server settings (e.g., 51 for 51%)

### How Quorum is Checked

The current quorum is simply the total number of votes cast on the proposal, including all vote types (agreements, disagreements, abstains, and blocks):

```
currentQuorum = votes.length
```

If `currentQuorum < requiredQuorum`, the proposal cannot be ratified regardless of the agreement percentage.

See `src/polls/polls.service.ts:463-469` for the implementation.

## Agreement Threshold

Agreement threshold determines what percentage of participating voters must agree for a proposal to pass.

### Calculation Basis

Agreement threshold is calculated based on **participants only** - defined as the sum of yes votes (agreements) and no votes (disagreements), **excluding abstains and blocks**:

```
yesVotes = agreements.length
noVotes = disagreements.length
participants = yesVotes + noVotes

requiredAgreements = Math.ceil(participants * (agreementThreshold / 100))
```

- `participants`: Only voters who cast an agreement or disagreement vote
- `agreementThreshold`: Percentage configured in server settings (e.g., 75 for 75%)

### Why Abstains and Blocks Are Excluded

Abstentions indicate a member chooses not to participate in the decision while still being counted toward quorum. Blocks represent a fundamental objection that prevents ratification entirely (in consensus models). Neither represents a "yes" or "no" position on the proposal itself.

This means:
- A proposal with 8 agreements, 2 disagreements, and 5 abstains has `participants = 10` (not 15)
- The 5 abstains count toward quorum but not toward the agreement calculation

See `src/polls/polls.service.ts:472-488` for the implementation.

## Full Ratification Requirements

For a proposal to be ratified, it must meet all applicable criteria for its decision-making model.

### Consensus (Fully Implemented)

1. **Voting period closed**: `closingAt` time has passed (if set)
2. **Quorum met** (if enabled): `votes.length >= requiredQuorum`
3. **Agreement threshold met**: `yesVotes >= requiredAgreements`
4. **Disagreements within limit**: `disagreements.length <= disagreementsLimit`
5. **Abstains within limit**: `abstains.length <= abstainsLimit`
6. **No blocks**: `blocks.length === 0`

See `src/polls/polls.service.ts:446-489` for the `hasConsensus` function.

### Majority Vote (Partially Implemented)

1. **Voting period closed**: `closingAt` time has passed (if set)
2. **Quorum met** (if enabled): `votes.length >= requiredQuorum`
3. **Agreement threshold met**: `yesVotes >= requiredAgreements`

See `src/polls/polls.service.ts:492-524` for the `hasMajorityVote` function.

### Consent (Partially Implemented)

1. **Voting period closed**: `closingAt` time has passed (required)
2. **Disagreements within limit**: `disagreements.length <= disagreementsLimit`
3. **Abstains within limit**: `abstains.length <= abstainsLimit`
4. **No blocks**: `blocks.length === 0`

Note: Consent does not check agreement threshold - it only requires the absence of sufficient objections.

See `src/polls/polls.service.ts:526-536` for the `hasConsent` function.

## Implementation Status

### Fully Implemented

- **Consensus**: All ratification logic is complete and tested. This is the primary decision-making model currently in use.

### Partially Implemented (Future Work)

- **Consent**: Basic logic exists but requires additional work for full implementation.
- **Majority Vote**: Basic logic exists but is marked with a TODO for completion.

The consensus model should be used for production deployments until the other models are fully implemented.

## Related Files

- [src/polls/polls.service.ts](../../src/polls/polls.service.ts): Core ratification logic
- [common/polls/poll.utils.ts](../../common/polls/poll.utils.ts): Threshold calculation utilities
- [common/votes/vote.utils.ts](../../common/votes/vote.utils.ts): Vote sorting utilities
- [src/polls/entities/poll-config.entity.ts](../../src/polls/entities/poll-config.entity.ts): Configuration entity
