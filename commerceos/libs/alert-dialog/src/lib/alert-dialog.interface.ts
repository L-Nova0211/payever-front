import { TemplateRef } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog/dialog-config';
import { SafeHtml } from '@angular/platform-browser';

/**
 * throw this to prevent dialog result
 * eg Promise.reject(new PeAlertDialogError())
 * */
export class PeAlertDialogError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PeAlertDialogError';
  }
}

export enum PeAlertDialogIcon {
  Alert = 'alert',
}

export interface PeAlertDialogAction {
  label: string;
  bgColor?: string;
  color?: string;
  callback: (event: Event) => Promise<any> | null; // dialog will be closed with promise result. null will be ignored
}

export interface PeAlertDialogData {
  title?: string | TemplateRef<any>;
  subtitle?: string | TemplateRef<any>;
  icon?: string | SafeHtml | TemplateRef<any>;
  actions?: PeAlertDialogAction[] | TemplateRef<any>;
}

export interface PeAlertDialogConfig extends MatDialogConfig<PeAlertDialogData> {}
