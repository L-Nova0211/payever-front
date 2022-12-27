import { PeDataGridFilterConditionType, PeDataGridFilterWithConditions } from '@pe/common';

export enum GQLFilterOperator {
  EqualTo = 'equalTo',
  NotEqualTo = 'notEqualTo',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Includes = 'includes',
  LessThan = 'lessThan',
  GreaterThan = 'greaterThan',
  Between = 'between',
}

export const nameFilter: PeDataGridFilterWithConditions = {
  filterName: 'Name',
  filterKey: 'name',
  type: PeDataGridFilterConditionType.Text,
  icon: 'name_filter',
  applyFilter: () => {},
  conditions: [
    {
      conditionLabel: 'Is',
      conditionValue: GQLFilterOperator.EqualTo,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Starts with',
      conditionValue: GQLFilterOperator.StartsWith,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Ends with',
      conditionValue: GQLFilterOperator.EndsWith,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Contains',
      conditionValue: GQLFilterOperator.Includes,
      conditionFields: [{
        label: 'Search',
      }],
    },
  ],
};

export const membersCountFilter: PeDataGridFilterWithConditions = {
  filterName: 'Members count',
  filterKey: 'members_count',
  type: PeDataGridFilterConditionType.Number,
  icon: 'members_count_filter',
  applyFilter: () => {},
  conditions: [
    {
      conditionLabel: 'Is',
      conditionValue: GQLFilterOperator.EqualTo,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Is not',
      conditionValue: GQLFilterOperator.NotEqualTo,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Less than',
      conditionValue: GQLFilterOperator.LessThan,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Greater than',
      conditionValue: GQLFilterOperator.GreaterThan,
      conditionFields: [{
        label: 'Search',
      }],
    },
    {
      conditionLabel: 'Between',
      conditionValue: GQLFilterOperator.Between,
      conditionFields: [{
        label: 'Search',
      }],
    },
  ],
};
