import { ForcedSubject, MongoAbility } from '@casl/ability';
import {
  SERVER_ABILITY_ACTIONS,
  SERVER_ABILITY_SUBJECTS,
} from './server-role.constants';

export type ServerAbilityAction = (typeof SERVER_ABILITY_ACTIONS)[number];
export type ServerAbilitySubject = (typeof SERVER_ABILITY_SUBJECTS)[number];

export type ServerAbilities = [
  ServerAbilityAction,
  ServerAbilitySubject | ForcedSubject<Exclude<ServerAbilitySubject, 'all'>>,
];

export type ServerAbility = MongoAbility<ServerAbilities>;
