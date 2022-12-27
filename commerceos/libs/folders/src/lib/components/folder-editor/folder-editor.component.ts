import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeMediaFileTypeEnum } from '@pe/media';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeFoldersActionsEnum } from '../../enums';
import { FolderItem } from '../../interfaces';
import { FolderService, PeFoldersActionsService, PeFoldersApiService } from '../../services';

import { PeFolderEditorDataToSaveInterface, PeFolderEditorDataInterface } from './folder-editor-data.interface';

@Component({
  selector: 'pe-folder-editor',
  templateUrl: './folder-editor.component.html',
  styleUrls: ['./folder-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeFolderEditorComponent {
  
  public readonly businessId = this.envService.businessId;
  public readonly theme = this.peOverlayConfig.theme;
  public folderForm = this.formBuilder.group({
    image: [[]],
    name: [],
  });
  
  public loading = false;

  constructor(
    // Angular
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    // Pe services
    private confirmScreenService: ConfirmScreenService,
    private envService: EnvService,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: PeFolderEditorDataInterface,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    // Folders services
    private peFoldersActionsService: PeFoldersActionsService,
    private peFoldersApiService: PeFoldersApiService,
    private peFolderService: FolderService,
  ) {
    this.peFolderService.backdropClick = this.closeEditor;
    this.peOverlayConfig.backBtnCallback = this.closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      !this.peOverlayConfig.isLoading && this.saveFolder();
    };
    const { actionType, item } = peOverlayData;

    if (item && actionType === PeFoldersActionsEnum.Update) {
      const image: any = {
        localUrl: null,
        mediaUrl: item.image,
        mediaMimeType: PeMediaFileTypeEnum.Image,
      };
      const folder = {
        image: image.mediaUrl ? [image] : [],
        name: item.title,
      };
      this.folderForm.patchValue(folder);
      this.folderForm.markAsPristine();
    }
  }

  public updatePicture(media: any[]): void {
    this.folderForm.controls.image.patchValue(media);
    this.folderForm.markAsDirty();
  }

  private readonly closeEditor = () => {
    if (this.folderForm.dirty && !this.loading) {
      this.peFolderService.confirmation$
        .pipe(
          take(1),
          filter(Boolean),
          tap(() => {
            this.peOverlayWidgetService.close();
          }),
          takeUntil(this.destroy$))
        .subscribe();

      const isActionUpdate = this.peOverlayData.actionType === PeFoldersActionsEnum.Update;
      const headingTitle = isActionUpdate
        ? 'folders.confirm_dialog.cancel.folder_editor.editing.title'
        : 'folders.confirm_dialog.cancel.folder_editor.creating.title';
      const headingSubtitle = isActionUpdate
        ? 'folders.confirm_dialog.cancel.folder_editor.editing.subtitle'
        : 'folders.confirm_dialog.cancel.folder_editor.creating.subtitle';
      const config: Headings = {
        title: this.translateService.translate(headingTitle),
        subtitle: this.translateService.translate(headingSubtitle),
        confirmBtnText: this.translateService.translate('folders.actions.close'),
        declineBtnText: this.translateService.translate('folders.actions.cancel'),
      };

      this.confirmScreenService.show(config);
    } else if (!this.loading) {
      this.peOverlayWidgetService.close();
    }
  }

  private saveFolder = () => {
    const { image, name } = this.folderForm.controls;
    name.setValidators([Validators.required]);
    name.updateValueAndValidity();
    const { dirty, invalid, valid } = this.folderForm;

    if (dirty && valid) {
      const { actionType, activeItem, item, nextPosition } = this.peOverlayData;
      const isActionUpdate = actionType === PeFoldersActionsEnum.Update;
      const folderData: FolderItem = {
        image: image.value.length ? image.value[0].mediaUrl : null,
        isHeadline: item?.data.isHeadline ?? false,
        name: name.value,
        position: isActionUpdate
          ? item.data.position ?? 0
          : nextPosition,
      }

      if (isActionUpdate) {
        folderData._id = item.id;
      } else {
        folderData.parentFolderId = activeItem ? activeItem?._id : null;
      }

      const event = { data: folderData };

      of(folderData)
        .pipe(
          switchMap((folder: FolderItem) => {
            this.loading = true;
            this.peOverlayConfig.doneBtnTitle = this.translateService.translate('folders.actions.loading');
            this.peOverlayConfig.isLoading = true;
            this.cdr.detectChanges();

            return isActionUpdate
              ? this.peFoldersApiService.updateFolder(folder)
              : this.peFoldersApiService.createFolder(folder);
          }),
          tap((folder: FolderItem) => {
            const savedData: PeFolderEditorDataToSaveInterface = {
              actionType: actionType,
              updatedFolder: folder,
            };
            this.peOverlayConfig.onSaveSubject$.next(savedData);
            this.peOverlayWidgetService.close();
          }),
          catchError(error => {
            this.loading = false;
            this.peOverlayConfig.doneBtnTitle = this.translateService.translate('folders.actions.save');
            this.peOverlayConfig.isLoading = false;
            this.cdr.markForCheck();

            return throwError(error);
          }),
          this.peFoldersActionsService.errorHandler(event),
          takeUntil(this.destroy$))
        .subscribe();
    } else if (dirty || invalid) {
      this.cdr.detectChanges();
    } else {
      this.peOverlayWidgetService.close();
    }
  }

  public showWarning = (notification: string) => this.peFoldersActionsService.showWarning(notification);
}
