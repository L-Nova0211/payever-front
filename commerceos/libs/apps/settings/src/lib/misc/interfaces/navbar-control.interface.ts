import { TemplateRef } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { Params } from '@angular/router';


import { NavbarControlPosition } from '../enum/navbar-control-position.enum';
import { NavbarControlType } from '../enum/navbar-control-type.enum';

export interface NavbarControlInterface {
  classes?: string;
  hidden?: boolean;
  position: NavbarControlPosition;
  type: NavbarControlType;
}

export interface TextControlInterface extends NavbarControlInterface, IconInterface {
  text: string;
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

export interface MenuControlInterface extends TextControlInterface, IconInterface {
  color?: ThemePalette;
  menuItems?: MenuItemInterface[];
  content?: TemplateRef<any>;
  buttonClasses?: string;
  uniqueName?: string;
}

export interface MenuItemInterface extends IconInterface {
  routerLink?: any[];
  queryParams?: Params;
  text?: string;
  onClick?(): void;
}

export interface DividerControlInterface extends NavbarControlInterface {
  fullHeight?: boolean;
}

export interface CustomControlInterface extends NavbarControlInterface {
  content: TemplateRef<any>;
}

export interface CustomElementInterface extends NavbarControlInterface {
  tag: string;
  options?: { [key: string]: any };
  events?: { [key: string]: () => void };
}

export interface IconInterface {
  iconAppend?: string;
  iconAppendSize?: number;
  iconPrepend?: string;
  iconPrependSize?: number;
}

export interface TooltipInterface {
  tooltipText?: string;
  tooltipClass?: string;
  tooltipPosition?: TooltipPosition;
}
