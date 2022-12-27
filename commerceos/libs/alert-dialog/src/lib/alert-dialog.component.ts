import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { from, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, filter, map, retry, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  PeAlertDialogAction,
  PeAlertDialogData,
  PeAlertDialogError,
  PeAlertDialogIcon,
} from './alert-dialog.interface';


@Component({
  selector: 'pe-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAlertDialogComponent implements OnInit, OnDestroy {

  readonly PeAlertDialogIcon = PeAlertDialogIcon;
  private readonly actionInvoker$ = new Subject<{ event: Event, action: PeAlertDialogAction }>();
  private readonly destroy$ = new ReplaySubject<void>(1);

  constructor(
    public readonly dialogRef: MatDialogRef<PeAlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: PeAlertDialogData,
  ) { }

  ngOnInit() {
    this.actionInvoker$.pipe(
      filter(({ action }) => action?.callback instanceof Function),
      map(({ action, event }) => action.callback(event)),
      filter(Boolean),
      switchMap((action$: Promise<any>) => from(action$)),
      tap(result => this.dialogRef.close(result)),
      catchError((err) => {
        if (!(err instanceof PeAlertDialogError)) {
          console.error(err);
        }

        return throwError(err);
      }),
      retry(),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isTemplateRef(subject: any): subject is TemplateRef<any> {
    return subject instanceof TemplateRef;
  }

  isString(object: any): object is string {
    return typeof object === 'string';
  }

  invokeAction(event: Event, action: PeAlertDialogAction): void {
    this.actionInvoker$.next({ event, action });
  }
}
