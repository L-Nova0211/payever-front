import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebSitesApi } from '../../services/site/abstract.sites.api';


@Component({
  selector: 'peb-social-image',
  templateUrl: './social-image.component.html',
  styleUrls: ['./social-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsSocialImageComponent {
  socialImage = this.appData.accessConfig.socialImage;
  isImageLoading: boolean;

  constructor(
    private destroy$: PeDestroyService,
    private apiSite: PebSitesApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
  ) {
    this.config.doneBtnTitle = 'Save';

    this.config.doneBtnCallback = () => {
      if (this.socialImage && this.socialImage !== this.appData.accessConfig.socialImage) {
        this.apiSite.addSocialImage(this.appData.id, this.socialImage).subscribe((data) => {
          this.appData.onSaved$.next({ updateSiteList: true });
          this.overlay.close();
        })

        return
      }
      this.overlay.close();
    }
  }


  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.isImageLoading = false;
                this.socialImage = (event?.body?.blobName || reader.result as string);
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

}
