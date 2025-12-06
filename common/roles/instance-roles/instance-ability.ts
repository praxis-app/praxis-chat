import { ForcedSubject, MongoAbility } from '@casl/ability';
import {
  INSTANCE_ROLE_ABILITY_ACTIONS,
  INSTANCE_ROLE_ABILITY_SUBJECTS,
} from './instance-role.constants';

export type InstanceAbilityAction =
  (typeof INSTANCE_ROLE_ABILITY_ACTIONS)[number];

export type InstanceAbilitySubject =
  (typeof INSTANCE_ROLE_ABILITY_SUBJECTS)[number];

export type InstanceAbilities = [
  InstanceAbilityAction,
  (
    | InstanceAbilitySubject
    | ForcedSubject<Exclude<InstanceAbilitySubject, 'all'>>
  ),
];

export type InstanceAbility = MongoAbility<InstanceAbilities>;
