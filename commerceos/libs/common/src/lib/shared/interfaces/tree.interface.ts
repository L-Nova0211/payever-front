export interface TreeFilterNode<T = any> {
  id?: string;
  _id?: string;
  name: string;
  image?: string;
  editing?: boolean;
  parentId?: string;
  data?: T;
  noToggleButton?: boolean;
  children?: TreeFilterNode[];
}

export interface FilterNode<T = any> {
  id?: string;
  _id?: string;
  name: string;
  image?: string;
  editing?: boolean;
  parentId?: string;
  data?: T;
}
