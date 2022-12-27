import { PeDataGridFilterCondition } from '@pe/common';


const exactMatch = (str) => {
  return `^${str}$`;
};

const isNot = (str) => {
  return  `^(?!${str}$)`;
};

const startsWith = (str) => {
  return  `^${str}`;
};

const endsWith = (str) => {
  return `${str}$`;
};

const notContains = (str) => {
  return`^((?!${str}).)*$`;
};

export const getFilterValue = (filter: PeDataGridFilterCondition): string => {
  switch (filter.conditionLabel) {
    case 'is':
      return exactMatch(filter.conditionValue);
    case 'isNot':
      return isNot(filter.conditionValue);
    case 'startsWith':
      return startsWith(filter.conditionValue);
    case 'endsWith':
      return endsWith(filter.conditionValue);
    case 'doesNotContain':
      return notContains(filter.conditionValue);
    case 'contains':
    default:
      return filter.conditionValue;
  }
};
