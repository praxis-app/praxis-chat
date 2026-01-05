import { ForcedSubject, MongoAbility } from '@casl/ability';
import { AppAbilityAction } from '../role.types';
import { INSTANCE_ROLE_ABILITY_SUBJECTS } from './instance-role.constants';

export type InstanceAbilitySubject =
  (typeof INSTANCE_ROLE_ABILITY_SUBJECTS)[number];

export type InstanceAbilities = [
  AppAbilityAction,
  (
    | InstanceAbilitySubject
    | ForcedSubject<Exclude<InstanceAbilitySubject, 'all'>>
  ),
];

export type InstanceAbility = MongoAbility<InstanceAbilities>;
