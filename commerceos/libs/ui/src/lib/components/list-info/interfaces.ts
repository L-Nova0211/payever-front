export interface ListDataModel {
  logo?: string;
  itemName: string;
  action?: (e, detail) => void;
}
