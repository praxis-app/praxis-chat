import { ForcedSubject, MongoAbility } from '@casl/ability';
import { ABILITY_ACTIONS, ABILITY_SUBJECTS } from './server-role.constants';

export type AbilityAction = (typeof ABILITY_ACTIONS)[number];
export type AbilitySubject = (typeof ABILITY_SUBJECTS)[number];

export type Abilities = [
  AbilityAction,
  AbilitySubject | ForcedSubject<Exclude<AbilitySubject, 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;
