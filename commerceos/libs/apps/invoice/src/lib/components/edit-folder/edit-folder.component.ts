import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { skip, tap } from 'rxjs/operators';

import { AppThemeEnum } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { InvoiceApiService } from '../../services/api.service';

@Component({
  selector: 'pe-edit-folder',
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFolderComponent {
  isSaving$ = new BehaviorSubject<boolean>(false);
  theme: AppThemeEnum;
  businessId: string;
  image: string;
  submited = false;

  formGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
  })

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: OverlayHeaderConfig,
    private cdr: ChangeDetectorRef,
    private overlay: PeOverlayWidgetService,
    private invoiceApi: InvoiceApiService,
    private formBuilder: FormBuilder,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {
    config.doneBtnCallback = this.saveData;
    this.theme = appData.theme;

    if (appData.item && appData.type === 'edit') {
      this.formGroup.setValue({ title: appData.item.title, description: appData.item?.data?.description || '' })
      this.image = appData.item.image;
    }

    this.isSaving$.pipe(
      skip(1),
      tap((saving: boolean) => {
        this.config.doneBtnTitle = this.translateService.translate(saving ? 'saving' : 'done');
      })
    ).subscribe();

  }

  onUpdatePicture(image) {
    this.image = image.image;
  }

  saveData = () => {
    this.submited = true;
    this.cdr.detectChanges();

    if (this.formGroup.valid) {
      const { title, description } = this.formGroup.value
      let payload: any = {
        name: title,
        image: this.image,
        position: this.appData.nextPosition,
        description,
      };

      let request:  Observable<FolderItem<any>>;

      this.isSaving$.next(true);

      if (this.appData.type === 'edit') {
        payload = {
          _id: this.appData.item.id,
          ...payload,
        };

        request = this.invoiceApi.patchFolder(payload);
      } else {
        if (this.appData.activeItem) {
          payload.parentFolderId = this.appData.activeItem?._id ?? null;
        }

        request = this.invoiceApi.postFolder(payload);
      }

      request.pipe(
        tap({
          next: (data) => {
            this.config.onSaveSubject$.next({ updatedItem: data, appData: this.appData });
            this.overlay.close();
          },
          error: (error) => {
            this.snackbarService.toggle(true, {
              content: error.error.errors || error.error.message,
            });
          },
          complete: () => this.isSaving$.next(false),
        })
        ).subscribe();
    }
  }
}