import { AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { PopupMode as ContactsPopupMode } from '@pe/shared/contacts';
import { PopupMode as ProductsPopupMode } from '@pe/shared/products';

import { PeAppointmentsRoutingPathsEnum } from '../../enums';
import { PeAppointmentsPickerService } from '../../services';

@Component({
  selector: 'pe-pickers-wrapper',
  templateUrl: './pickers-wrapper.component.html',
  styleUrls: ['./pickers-wrapper.component.scss'],
  providers: [PeDestroyService],
})
export class PeAppointmentsPickersWrapperComponent implements AfterViewInit, OnDestroy {

  @ViewChild(TemplateRef) ref;
  private dialogRef: MatDialogRef<any, boolean>;

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private store: Store,

    private envService: EnvService,
    private readonly destroy$: PeDestroyService,

    private peAppointmentsPickerService: PeAppointmentsPickerService,
  ) { }

  private get isContacts(): boolean {
    return this.router.url.includes(PeAppointmentsRoutingPathsEnum.Contacts);
  }

  private changeSaveStatus(status: boolean): void {
    this.peAppointmentsPickerService.changeSaveStatus$.next(status);
  }

  ngOnDestroy(): void {
    this.changeSaveStatus(false);
  }

  ngAfterViewInit(): void {
    const popupMode = (enable: boolean) => this.isContacts
      ? new ContactsPopupMode(enable)
      : new ProductsPopupMode(enable);

    this.store.dispatch(popupMode(true))
      .pipe(
        switchMap(() => {
          this.dialogRef = this.matDialog.open(this.ref, {
            backdropClass: 'pickers-wrapper-backdrop',
            panelClass: this.theme,
            maxWidth: window.innerWidth > 720 ? '80vw' : 'none',
            width: window.innerWidth > 720 ? 'auto' : 'calc(100vw - 32px)',
          });

          return this.dialogRef.afterClosed();
        }),
        switchMap((isSave: boolean) => {
          this.changeSaveStatus(isSave);

          return this.store.dispatch(popupMode(false));
        }),
        tap(() => {
          this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public closeDialog(isSave = false): void {
    this.dialogRef.close(isSave);
  }
}
