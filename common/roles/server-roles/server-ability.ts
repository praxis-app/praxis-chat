import { ForcedSubject, MongoAbility } from '@casl/ability';
import { AbilityAction } from '../role.types';
import { SERVER_ROLE_ABILITY_SUBJECTS } from './server-role.constants';

export type ServerAbilitySubject =
  (typeof SERVER_ROLE_ABILITY_SUBJECTS)[number];

export type ServerAbilities = [
  AbilityAction,
  ServerAbilitySubject | ForcedSubject<Exclude<ServerAbilitySubject, 'all'>>,
];

export type ServerAbility = MongoAbility<ServerAbilities>;
