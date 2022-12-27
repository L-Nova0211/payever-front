export interface MenuSidebarFooterItem {
  title: string;
  onClick?: () => void;
  color?: string;
}

export interface MenuSidebarFooterData {
  headItem?: MenuSidebarFooterItem;
  menuItems?: MenuSidebarFooterItem[];
}
