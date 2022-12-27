import { SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PeDataGridItem {
  id?: string;
  image?: string;
  showAbbreviation?: boolean;
  title?: string | SafeHtml;
  subtitle?: string;
  description?: string | SafeHtml;
  customFields?: PeDatagridCustomField[];
  data?: any;
  selected?: boolean;
  action?: PeDataGridSingleSelectedAction;
  actions?: PeDataGridSingleSelectedAction[];
  labels?: string[];
  snapshot?: any;
}


export interface PeDatagridCustomField {
  content?: string | SafeHtml;
  component?: any;
  callback?: () => void;
}

export interface PeDataGridSelectableItem extends PeDataGridItem {
  selectable: boolean;
}

export interface PeDataGridListOptions {
  nameTitle: string;
  descriptionTitle?: string;
  customFieldsTitles?: (string | SafeHtml)[];

}

export interface PeDataGridMultipleSelectedAction {
  label: string|SafeHtml;
  callback?: (selectedIds: string[]) => void;
  onlyForSingleItem?: boolean;
  appearance?: PeDataGridButtonAppearance;
  actions?: {
    label: string;
    callback: (selectedIds: string[]) => void;
  }[];
}

export interface PeDataGridSingleSelectedAction {
  label: string;
  more?: boolean;
  shortLabel?: string;
  isLoading$?: Observable<boolean>;
  callback?: (selectedId?: string) => void;
}

export interface PeDataGridSortByAction {
  label: string;
  callback: () => void;
  icon?: PeDataGridSortByActionIcon;
}

export interface PeDataGridPaginator {
  page: number;
  perPage: number;
  total: number;
}

export enum PeDataGridLayoutType {
  Grid = 'grid',
  List = 'list',
}

export enum PeDataGridTheme {
  Dark = 'dark',
  Transparent = 'transparent',
  Light = 'light',
}

export enum PeDataGridButtonAppearance {
  Link = 'link',
  Button = 'button',
}

export enum PeDataGridSortByActionIcon {
  Ascending = 'ascending',
  Date = 'date',
  Descending = 'descending',
  Name = 'name',
  NameContacts = 'name-contacts',
}
export interface PeSelectableDataGridItem extends PeDataGridItem {
  selected: boolean;
}

export const isSelectableItem = (value: any): value is PeSelectableDataGridItem =>
  (value as PeSelectableDataGridItem).id !== undefined;

export interface PeDataGridButtonItem {
  title?: string|SafeHtml;
  icon?: string;
  apearance?: PeDataGridButtonAppearance;
  onClick?: () => void;
  children?: {
    title?: string;
    iconBefore?: string;
    onClick?: (e?: any) => void;
    icon?: string | SafeHtml;
    isCheckbox?: boolean;
    selected$?: Observable<boolean>;
  }[];
}

export enum PeFilterContainsEnum {
  'Contains',
  'Does not Contain',
}

export interface PeSearchItem {
  searchText: string;
  contains: PeFilterContainsEnum;
  filter: string;
}

export enum PeGridItemType {
  Item = 'item',
  Folder = 'folder'
}

export interface PeGridItemColumn {
  // label: string; We don't need it. Should be taken from whole table columns
  name: string;
  value: string;
  className?: string;
}

export interface PeGridItem<RawData = any> {
  action?: {
    label: string;
    backgroundColor?: string;
    color?: string;
  };
  badge?: {
    backgroundColor: string;
    color: string;
    label: string;
  };
  approve?: {
    backgroundColor: string;
    color: string;
    label: string;
  };
  columns: PeGridItemColumn[];
  id: string;
  image: string;
  title: string;
  type: PeGridItemType;
  isDraggable?: boolean;
  data?: RawData;
  itemLoader$?: BehaviorSubject<boolean>;
}
