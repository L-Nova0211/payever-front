import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog/dialog-ref';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/internal/operators';
import { take } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { BusinessEmployeeInterface } from '../../../../misc/interfaces/business-employees/business-employee.interface';
import { BusinessEnvService } from '../../../../services';
import { NewEmployeeDialogComponent } from '../../components/new-employee-dialog/new-employee-dialog.component';
import { NewEmployeeGroupComponent } from '../../components/new-employee-group/new-employee-group.component';
import { positionQueryParam } from '../../constants';
import { CreateEmployeeDialogDataInterface, ICreateEmployeeGroupDialogDataInterface } from '../../interfaces';

@Injectable()
export class PebEmployeeDialogOpenerService {
  theme = AppThemeEnum.default;
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  constructor(
    private dialog: MatDialog,
    private envService: BusinessEnvService,
    private translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  openNewEmployeeDialog(groupId) {
    const data: CreateEmployeeDialogDataInterface = {
      groupId,
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData?.themeSettings?.theme] || AppThemeEnum.default,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_employee.title.add',
      NewEmployeeDialogComponent
    );

    return this.overlayService.open(config);
  }

  openUpdateEmployeeDialog(editedEmployee: BusinessEmployeeInterface) {
    const data: CreateEmployeeDialogDataInterface = {
      businessId: this.envService.businessUuid,
      employee: editedEmployee,
      theme: AppThemeEnum[this.envService.businessData?.themeSettings?.theme] || AppThemeEnum.default,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_employee.title.edit',
      NewEmployeeDialogComponent
    );

    return this.overlayService.open(config);
  }

  openNewEmployeeGroupDialog() {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData?.themeSettings?.theme] || AppThemeEnum.default,
    };

    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_group.title.add',
      NewEmployeeGroupComponent
    );

    return this.overlayService.open(config);
  }

  openEditEmployeeGroupDialog(groupId, group) {
    const data: ICreateEmployeeGroupDialogDataInterface = {
      groupId,
      group,
      businessId: this.envService.businessUuid,
      theme: AppThemeEnum[this.envService.businessData?.themeSettings?.theme] || AppThemeEnum.default,
    };
    const config: PeOverlayConfig = this.getOverlayConfig(
      data,
      'dialogs.new_group.title.permissions',
      NewEmployeeGroupComponent
    );

    return this.overlayService.open(config);
  }

  onCloseWindow() {
    this.showConfirmationDialog();
  }

  showConfirmationDialog = () => {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: 'employee-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('dialogs.window_exit.title'),
        subtitle: this.translateService.translate('dialogs.window_exit.label'),
        cancelButtonTitle: this.translateService.translate('dialogs.window_exit.decline'),
        confirmButtonTitle: this.translateService.translate('dialogs.window_exit.confirm'),
        theme: this.theme,
      },
    });
    dialogRef.afterClosed().pipe(
      take(1),
      switchMap((dismiss: boolean | undefined) => {
        if (dismiss === true && this.dialogRef) {
          this.dialogRef.close();
        }

        return this.route.queryParams.pipe(
          tap((res) => {
            const queryParams = {};
            if (res[positionQueryParam]) {
              queryParams[positionQueryParam] = res[positionQueryParam];
            }

            this.router.navigate([], { queryParams });
          }),
        );
      }),
    ).subscribe();
  }

  getOverlayConfig(data, title, component) {
    return {
      panelClass: 'new-employee-dialog',
      data: { data },
      headerConfig: {
        title: this.translateService.translate(title),
        backBtnTitle: this.translateService.translate('dialogs.new_employee.buttons.cancel'),
        backBtnCallback: () => {
          this.onCloseWindow();
        },
        doneBtnTitle: this.translateService.translate('actions.save'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: data.theme,
      },
      backdropClick: () => {
        this.onCloseWindow();
      },
      component,
    };
  }

  private openDialog<T>(data: CreateEmployeeDialogDataInterface): MatDialogRef<NewEmployeeDialogComponent, T> {
    return this.dialog.open(NewEmployeeDialogComponent, {
      hasBackdrop: false,
      panelClass: ['settings-dialog', 'settings-dialog-without-padding'],
      data,
    });
  }
}
