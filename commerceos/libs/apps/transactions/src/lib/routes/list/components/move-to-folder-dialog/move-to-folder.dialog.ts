import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ApiService } from '../../../../services/api.service';
import { PeFolder } from '../../../../shared/interfaces/folder.interface';

@Component({
  selector: 'pe-move-to-folder-form',
  templateUrl: './move-to-folder.dialog.html',
  styleUrls: ['./move-to-folder.dialog.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveToFolderDialogComponent implements OnInit {

  folders: PeFolder[] = [];
  selectedFolderId: string;

  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  loadFolders = new BehaviorSubject<boolean>(null);
  private apiService: ApiService;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private envService: EnvService,
    private destroy$: PeDestroyService,
    private overlay: PeOverlayWidgetService,
  ) {
    this.apiService = this.overlayData.injector.get(ApiService)
    this.config.backBtnCallback = () => {
      this.overlay.close();
    };
    this.config.doneBtnCallback = () => {
      if (this.selectedFolderId) {
        this.apiService.moveToFolder(this.selectedFolderId, this.overlayData.transactionId).subscribe({
          next: () => this.config.onSave$.next({ folderId: this.selectedFolderId, transactionId: this.overlayData.transactionId }),
        })
      } else {
        this.apiService.moveToRoot(this.overlayData.transactionId).subscribe({
          next: () => this.config.onSave$.next({ folderId: this.selectedFolderId, transactionId: this.overlayData.transactionId }),
        })
      }
      this.overlay.close();
    };
  }


  moveToFolderForm: FormGroup = this.formBuilder.group({
    businessId: [this.envService.businessId],
  });


  private getFolders(): void {
    this.apiService
      .getFlatFolders()
      .pipe(
        tap((folders) => {
          this.folders = folders.filter(folder => !folder.isHeadline);
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  ngOnInit(): void {
    console.log(this.config);
    this.getFolders();
  }

  onSelected(selected: string): void {
    this.selectedFolderId = selected;
  }
}
