import cloneDeep from 'lodash/cloneDeep';

import { PeDataGridFilterCondition } from '@pe/common';


const BASIC_CONDITIONS: PeDataGridFilterCondition[] = [
  {
    conditionLabel: 'Is',
    conditionValue: 'is',
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  },
  {
    conditionLabel: 'Is not',
    conditionValue: 'isNot',
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  },
];

export const NUMBER_CONDITIONS: PeDataGridFilterCondition[] = [
  ...BASIC_CONDITIONS.map(condition => cloneDeep(condition)),
  {
    conditionLabel: 'Greater than',
    conditionValue: 'greaterThan',
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  },
  {
    conditionLabel: 'Less than',
    conditionValue: 'lessThan',
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  },
  {
    conditionLabel: 'Between',
    conditionValue: 'between',
    conditionFields: [
      {
        label: 'From',
        inputValue: '',
      },
      {
        label: 'To',
        inputValue: '',
      },
    ],
  },
];
export const TEXT_CONDITIONS: PeDataGridFilterCondition[] = [
  ...BASIC_CONDITIONS,
  {
    conditionLabel: 'Contains',
    conditionValue: 'contains',
    conditionFields: [
      {
        label: 'Search',
        inputValue: '',
      },
    ],
  },
];
