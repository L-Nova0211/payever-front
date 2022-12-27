export interface LayerNode {
  data: {
    name: string;
  };
  type: string;
  isVisible: boolean;
  children?: LayerNode[];
  id: string;
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: string;
}
