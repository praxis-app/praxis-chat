import { ForcedSubject, MongoAbility } from '@casl/ability';
import { RoleAbilityAction } from '../role.types';
import { SERVER_ROLE_ABILITY_SUBJECTS } from './server-role.constants';

export type ServerAbilitySubject =
  (typeof SERVER_ROLE_ABILITY_SUBJECTS)[number];

export type ServerAbilities = [
  RoleAbilityAction,
  ServerAbilitySubject | ForcedSubject<Exclude<ServerAbilitySubject, 'all'>>,
];

export type ServerAbility = MongoAbility<ServerAbilities>;
