import { ForcedSubject, MongoAbility } from '@casl/ability';
import { AppAbilityAction } from '../role.types';
import { SERVER_ROLE_ABILITY_SUBJECTS } from './server-role.constants';

export type ServerAbilitySubject =
  (typeof SERVER_ROLE_ABILITY_SUBJECTS)[number];

export type ServerAbilities = [
  AppAbilityAction,
  ServerAbilitySubject | ForcedSubject<Exclude<ServerAbilitySubject, 'all'>>,
];

export type ServerAbility = MongoAbility<ServerAbilities>;
