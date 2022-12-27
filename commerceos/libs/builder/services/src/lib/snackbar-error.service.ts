import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { PebEditorSnackbarErrorComponent } from './snackbar-error/snackbar-error.component';
import { PebEditorSnackbarComponent } from './snackbar/snackbar.component';


interface SnackbarData {
  position?: 'top' | 'bottom';
  panelClass?: string[];
  retryAction?: object;
  cancelAction?: () => void;
  retryBtnCaption?: string;
  hideBtnCaption?: string;
  errorText?: string;
  textStyles?: CSSStyleDeclaration;
  actionStyles?: CSSStyleDeclaration;
  mainBtnCaption?: string;
  mainAction?: () => void;
  text?: string;
  reloadOnHide?: boolean;
  pending?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SnackbarErrorService implements OnDestroy{

  snackbarRef: MatSnackBarRef<any>;

  private readonly destroyedSubject$ = new Subject();

  readonly destroyed$ = this.destroyedSubject$.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.router.events.pipe(
      takeUntil(this.destroyed$),
      filter(event => event instanceof NavigationEnd),
    ).subscribe((event) => {
      const currentRoute = this.router.url.split('/').reverse()[0].split('?')[0];
      if (currentRoute !== 'builder') {
        this.snackBar.dismiss();
      }
    });
  }

  openSnackbarSuccess(data?: SnackbarData): void {
    const defaultClasses = ['mat-snackbar-success-container'];

    this.snackbarRef = this.snackBar.openFromComponent(PebEditorSnackbarComponent, {
      verticalPosition: data?.position || 'top',
      panelClass: data?.panelClass ? [...defaultClasses, ...data.panelClass] : defaultClasses,
      data: {
        mainAction: data?.mainAction || null,
        cancelAction: data?.cancelAction || null,
        mainBtnCaption: data?.mainBtnCaption || null,
        hideBtnCaption: data?.hideBtnCaption || null,
        errorText: data?.errorText || null,
        textStyles: data?.textStyles || null,
        actionStyles: data?.actionStyles || null,
        text: data?.text || 'Something went wrong',
        reloadOnHide: !!data?.reloadOnHide,
        pending: !!data?.pending,
      },
    });
  }

  openSnackbarError(data?: SnackbarData): void {
    const defaultClasses = ['mat-snackbar-error-container'];

    this.snackbarRef = this.snackBar.openFromComponent(PebEditorSnackbarErrorComponent, {
      verticalPosition: data?.position || 'top',
      panelClass: data?.panelClass ? [...defaultClasses, ...data.panelClass] : defaultClasses,
      data: {
        retryAction: data?.retryAction || null,
        cancelAction: data?.cancelAction || null,
        retryBtnCaption: data?.retryBtnCaption || null,
        hideBtnCaption: data?.hideBtnCaption || null,
        errorText: data?.errorText || null,
        textStyles: data?.textStyles || null,
        actionStyles: data?.actionStyles || null,
        text: data?.text || 'Something went wrong',
        reloadOnHide: !!data?.reloadOnHide,
      },
    });
  }

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }
}
