import { TemplateRef } from '@angular/core';

import { PeGridSortingDirectionEnum } from '../enums';

export enum PeFilterConditions { // TODO Move to @pe/common
  Is = 'is',
  IsIn = 'isIn',
  IsNot = 'isNot',
  IsNotIn = 'isNotIn',
  IsDate = 'isDate',
  IsNotDate = 'isNotDate',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  // DynamicTypes:
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Between = 'between',
  AfterDate = 'afterDate',
  BeforeDate = 'beforeDate',
  BetweenDates = 'betweenDates'
}

export const PeTwoFieldsConditions = [PeFilterConditions.Between, PeFilterConditions.BetweenDates];

export enum PeFilterType { // TODO Take as PeDataGridFilterItemType from @pe/common
  String = 'string',
  Date = 'date',
  Option = 'option',
  Number = 'number',
  Time = 'time'
}

export interface FilterInterface {
  fieldName: string;
  label: string;
  filterConditions: PeFilterConditions[];
  type: PeFilterType;
}

export interface PeFilterKeyInterface { // TODO Take as PeDataGridFilterItems from @pe/common
  fieldName: string;
  filterConditions: PeFilterConditions[];
  label: string;
  type: PeFilterType;
  options?: {
    label: string;
    value: string;
  }[];
  containsTranslations?: boolean;
}

export interface PeCustomMenuItemInterface {
  icon: string;
  label: string;
  onClick: () => void;
}

export interface PeCustomMenuInterface {
  title: string;
  items?: PeCustomMenuItemInterface[];
  icon?: string;
  templateRef?: TemplateRef<any>;
}

export interface PeAddedFilter {
  key: {
    formatted: string;
    value: string;
  };
  condition: {
    formatted: string;
    value: PeFilterConditions;
  };
  value: {
    formatted: string;
    value: string | number | Date;
  };
  disableEmit?: boolean;
}

type PeFilterChangeValueType = Date | string | number

export interface PeFilterChange {
  filter: string;
  contain: PeFilterConditions;
  search: PeFilterChangeValueType | { from: PeFilterChangeValueType, to: PeFilterChangeValueType };
}

export interface PeGridSearchFilterInterface {
  condition: PeFilterConditions | string;
  value: any;
}

export interface PeGridSearchFiltersInterface {
  [propName: string]: PeGridSearchFilterInterface[];
}

export interface PeGridSearchDataInterface {
  configuration?: PeGridSearchFiltersInterface;
  direction?: PeGridSortingDirectionEnum;
  orderBy?: string;
  page?: number;
  perPage?: number;
}
