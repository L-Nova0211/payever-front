import { PebRestrictType } from '@pe/builder-core';

export interface PebRestrictAccessFormInterface {
  restrict: boolean;
  type: PebRestrictType | string;
  customers?: string[];
  groups?: string[];
  password?: string;
}
