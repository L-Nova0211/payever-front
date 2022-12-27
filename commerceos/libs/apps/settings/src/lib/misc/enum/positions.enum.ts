export enum PositionsEnum {
  cashier = 'Cashier',
  sales = 'Sales',
  marketing = 'Marketing',
  staff = 'Staff',
  admin = 'Admin',
  others = 'Others'
}

export const positionsOptions = [
  { labelKey: 'form.create_form.employee.position.options.cashier', value: PositionsEnum.cashier },
  { labelKey: 'form.create_form.employee.position.options.sales', value: PositionsEnum.sales },
  { labelKey: 'form.create_form.employee.position.options.marketing', value: PositionsEnum.marketing },
  { labelKey: 'form.create_form.employee.position.options.staff', value: PositionsEnum.staff },
  { labelKey: 'form.create_form.employee.position.options.admin', value: PositionsEnum.admin },
  { labelKey: 'form.create_form.employee.position.options.others', value: PositionsEnum.others },
];
