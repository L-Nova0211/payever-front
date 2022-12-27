export enum CollectionEditorSections {
  Main = 'main',
  Content = 'content',
  Products = 'products',
}

export enum ConditionsType {
  NoCondition = 'no_condition',
  AllConditions = 'all_conditions',
  AnyCondition = 'any_condition',
}

export enum ConditionProperty {
  ProductTitle = 'title',
  ProductType = 'type',
  ProductPrice = 'price',
  Weight = 'weight',
}

export enum ConditionClause {
  Is = 'is',
  IsNot = 'isNot',
  StartsWith = 'startsWith',
  EndsWidth = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
}
