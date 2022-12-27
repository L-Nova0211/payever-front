export interface IGroupsInterface {
  count: number;
  data: IGroupItemInterface[];
}

export interface IGroupItemInterface {
  name: string;
  businessId: string;
  employees: string[];
  _id: string;
}
