import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { FolderItem, PeFoldersActionsEnum, PeFoldersActionsService, PeFoldersApiService } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayRef, OverlayHeaderConfig } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { ContactsGQLService } from '../../services';

@Component({
  selector: 'pe-group-modal',
  templateUrl: './group-modal.component.html',
  styleUrls: ['./group-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class GroupModalComponent implements OnInit {
  public folderNameLabel = this.translateService.translate('contacts-app.group_modal.group_name');
  public folderNameErrorMessage = this.translateService.translate('contacts-app.group_modal.group_name_required');

  public foldersData$: Observable<any[]>;
  triggerRefresh$ = new BehaviorSubject(null);

  public form = this.fb.group({
    selectedFolder: ['', Validators.required],
    folderName: ['', Validators.required],
  });

  private contactId = '';
  private foldersData: FolderItem[] = [];
  public isFolderInputFocused = false;

  constructor(
    private translateService: TranslateService,
    private overLayRef: PeOverlayRef,
    private peFoldersActionsService: PeFoldersActionsService,
    private fb: FormBuilder,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private snackbarService: SnackbarService,
    private contactsApiService: ContactsGQLService,
    private peFoldersApiService: PeFoldersApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.contactId = this.peOverlayData.item.data.id.split('|')[0];
    this.peOverlayConfig.doneBtnCallback = () => this.moveToFolder();
    this.peOverlayConfig.backBtnCallback = () => this.overLayRef.close();
    this.peOverlayConfig.title = this.translateService.translate('contacts-app.group_modal.title');
    this.foldersData$ = this.triggerRefresh$.pipe(
      switchMap(() => this.getFolder())
    )
  }

  get folderNameInvalid() {
    return this.form.get('folderName').invalid && this.form.get('folderName').dirty && this.isFolderInputFocused;
  }

  get selectedFolderInvalid() {
    return this.form.get('selectedFolder').invalid && this.form.get('selectedFolder').dirty;
  }

  get onFolderInputFocus() {
    return (this.isFolderInputFocused = true);
  }

  get onFolderInputUnfocus() {
    return (this.isFolderInputFocused = false);
  }

  getFolder(){
    const foldersData = this.peFoldersApiService.getFolders().pipe(
      map(res => {
        const folders = res.filter(folder => folder.isFolder && folder.parentFolderId !== null);

        return (this.foldersData = folders);
      }),
    );

    return foldersData;
  }

  addFolder() {
    const folderNameCtrl = this.form.get('folderName');
    if (folderNameCtrl.invalid) {
      this.isFolderInputFocused = true;
      folderNameCtrl.markAsDirty();

      return;
    }

    this.isFolderInputFocused = false;

    this.peFoldersActionsService
      .folderAction({ data: { name: folderNameCtrl.value, position: 1 } }, PeFoldersActionsEnum.Create)
      .pipe(
        tap(res => {
          this.triggerRefresh$.next(true);
          this.peOverlayData.onCreateFolder.next();
          folderNameCtrl.setValue('');
          this.form.get('selectedFolder').setValue(res._id);
          this.snackbarService.toggle(true, {
            content: this.translateService.translate(`contacts-app.group_modal.create_folder_success`),
            duration: 2500,
            iconColor: '#00B640',
            iconId: 'icon-commerceos-success',
            iconSize: 24,
          });
        }),
      )
      .subscribe();
      this.cdr.detectChanges();
  }

  moveToFolder() {
    const targetFolderCtrl = this.form.get('selectedFolder');
    if (targetFolderCtrl.invalid) {
      targetFolderCtrl.markAsDirty();

      return;
    }

    this.peOverlayConfig.isLoading = true;
    this.peOverlayConfig.doneBtnTitle = this.translateService.translate('contacts-app.group_modal.loading');
    this.contactsApiService
      .moveToFolder(targetFolderCtrl.value, this.contactId)
      .pipe(
        tap(res => {
          this.peOverlayConfig.doneBtnTitle = this.translateService.translate('contacts-app.group_modal.done');
          this.peOverlayConfig.isLoading = false;
          const targetFolder = this.foldersData.find(a => (a._id = targetFolderCtrl.value));
          targetFolder.children = targetFolder.children || [];
          this.peOverlayData.onSelectFolder.next(targetFolder);
          this.overLayRef.close();
        }),
      )
      .subscribe();
      this.cdr.detectChanges();
  }
}
