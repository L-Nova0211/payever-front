import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PebBlogsApi, PebEditorApi } from '@pe/builder-api';
import { PebShopContainer } from '@pe/builder-core';
import { MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';


@Component({
  selector: 'peb-social-image',
  templateUrl: './social-image.component.html',
  styleUrls: ['./social-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PeSettingsSocialImageComponent implements OnInit {
  socialImage = this.appData.accessConfig.socialImage;
  isImageLoading: boolean;

  constructor(

    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private translateService: TranslateService,
    private messageBus: MessageBus,
    private destroy$: PeDestroyService,
  ) {
    this.config.doneBtnTitle = this.translateService.translate('blog-app.actions.save');

    this.config.doneBtnCallback = () => {
      if (this.socialImage && this.socialImage !== this.appData.accessConfig.socialImage) {
        this.apiBlog.addSocialImage(this.appData._id, this.socialImage).subscribe((data) => {
          this.appData.onSved$.next({ updateBlogList: true });
          this.overlay.close();
        })

        return
      }
      this.overlay.close();

    }
  }

  ngOnInit(){
    this.messageBus.listen('confirm').pipe(take(1))
    .subscribe((confirm) => {
      if (confirm) {
        this.overlay.close();
      }
    });
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
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
