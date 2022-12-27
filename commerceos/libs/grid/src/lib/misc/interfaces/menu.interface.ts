import { TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeGridMenuDivider, PeGridMenuPosition } from '../enums';
import { PeGridDefaultIcons } from '../enums/icons.enum';

import { PeGridItem } from './grid.interface';


export interface PeGridMenuConfig {
  minWidth?: number,
  offsetX?: number,
  offsetY?: number,
  position?: PeGridMenuPosition,
  classList?: string;
}

export interface PeGridMenu {
  items: PeGridMenuItem[];
  title?: string;
  showCloseButton?: boolean;
  templateRef?: TemplateRef<any>;
}

export interface PeGridMenuIconPosition {
  iconPosition?: 'start' | 'end';
}

export interface PeGridMenuItemConfig {
  minItemWidth?: number;
  maxColumns?: number;
}

export interface PeGridMenuItem extends PeGridMenuIconPosition {
  minItemWidth?: number;
  maxColumns?: number;
  label: string;
  containsTranslations?: boolean;
  value?: any;
  defaultIcon?: PeGridDefaultIcons | string;
  svgIcon?: string;
  active?: boolean;
  checked$?: BehaviorSubject<boolean>;
  disabled?: boolean;
  checkbox?: boolean;
  color?: string;
  dividers?: PeGridMenuDivider[];
  hidden?: boolean,
  onClick?: () => void;
}

export interface PeGridItemContextSelect {
  gridItem: PeGridItem,
  menuItem: PeGridMenuItem
}

export interface PeGridViewportContextSelect {
  menuItem: PeGridMenuItem
}
