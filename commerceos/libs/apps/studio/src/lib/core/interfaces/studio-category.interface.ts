import { TreeFilterNode } from '@pe/common';

export interface PeStudioCategory {
  editing: boolean;
  listItems: any[];
  active: boolean;
  subCategory: PeStudioCategory[];
  _id: string;
  business: any;
  name: string;
  iconUrl: string;
  tree: TreeFilterNode[];
}
