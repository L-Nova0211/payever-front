import { ThemePalette } from '@angular/material/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { Params } from '@angular/router';

import { NavbarControlPosition, NavbarControlType } from '../enums/editor.enum';

export interface NavbarControlInterface {
  classes?: string;
  hidden?: boolean;
  position: NavbarControlPosition;
  type: NavbarControlType;
}

export interface TextControlInterface extends NavbarControlInterface, IconInterface {
  text: string;
}

export interface IconInterface {
  iconAppend?: string;
  iconAppendSize?: number;
  iconPrepend?: string;
  iconPrependSize?: number;
}

export interface LinkControlInterface extends TextControlInterface, IconInterface, TooltipInterface {
  color?: ThemePalette;
  href?: string;
  loading?: boolean;
  openInNewTab?: boolean;
  queryParams?: Params;
  routerLink?: any[];
  shortcutKey?: string;
  onClick?(): void;
}

export interface TooltipInterface {
  tooltipText?: string;
  tooltipClass?: string;
  tooltipPosition?: TooltipPosition;
}
