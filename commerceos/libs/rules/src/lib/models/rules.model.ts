/* eslint-disable no-unused-vars */
import { BehaviorSubject } from 'rxjs';

import { AppThemeEnum } from '@pe/common';
import { PeFilterType } from '@pe/grid';

export enum ActionType {
  Duplicate = 'duplicate',
  Add = 'add',
  Edit = 'edit',
  Delete = 'delete'
};
export interface RuleModel {
  _id: string;
  action: string;
  app: string;
  channel: string;
  businessId: string;
  condition: string;
  description: string;
  field: string;
  folderId: string;
  name: string;
  values: string[];
  start: string;
  startTime: string;
}

export interface ActionCallback {
  action?: ActionType;
  rule?: RuleModel
}

export interface ActionModel {
  ruleData: RuleModel;
  action: ActionType;
  callback$?: BehaviorSubject<ActionCallback>
}

export interface RuleAppAction {
  label: string;
  value: string;
}

export interface RuleChannels {
  label: string;
  value: string;
}

export interface RuleConditions {
  label: string;
  value: string;
}

export interface RuleFieldOptions {
  label: string;
  value: string;
}

export interface RuleFields {
  fieldName: string;
  label: string;
  conditions: string[];
  type: PeFilterType,
  options: RuleFieldOptions[];
}

export interface RuleValues {
  actions: RuleAppAction[];
  conditions: RuleConditions[];
  channels: RuleChannels[],
  fields: RuleFields[],
}

export interface RuleFolder {
  business: string;
  children: any[];
  image: string;
  name: string;
  _id: string;
}

export interface RuleOverlayData {
  conditions: RuleConditions[];
  fields: RuleFields[];
  rules: RuleModel[];
  action?: ActionType;
  actions: RuleAppAction[];
  folders: RuleFolder[];
  channels: RuleChannels[];
  rule?: RuleModel;
  theme?: AppThemeEnum;
}

export const START_LIST = [
  { label: 'rule.start.immediately', value: 'immediately' },
  { label: 'rule.start.time', value: 'time' },
];
