import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PebBlogsApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';
import { MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeMediaFileTypeEnum, PeMediaService } from '@pe/media';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent implements OnInit  {
  blogId: string;
  errorMsg: string;
  isImageLoading: boolean;
  // As per BE currently no enum defined for media service for blogs
  blogContainer = 'miscellaneous';

  blogConfig = {
    picture: '',
    name: '',    
  }

  constructor(
    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private env: PebEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private translateService: TranslateService,
    private alertDialog: PeAlertDialogService,
    private messageBus: MessageBus,
    private peMediaService: PeMediaService,
  )
   {
    if (this.appData.id) {
      this.config.doneBtnTitle = 'Open';
      this.blogConfig.name = this.appData.name;
      this.blogId = this.appData.id;
      this.blogConfig.picture = this.appData.picture;
      this.config.doneBtnCallback = () => {
        const payload: {
          id: string,
          name?: string,
          picture?: string,
        } = {
          id: this.appData.id,
        }
        if (this.blogConfig.name !== this.appData.name) {
          payload.name = this.blogConfig.name;
        }
        if (this.blogConfig.picture !== this.appData.picture) {
          payload.picture = this.blogConfig.picture;
        }
        if (!this.errorMsg) {
          if (!payload.name && !payload.picture) {
            this.appData.isDefault ?
              this.openDashboard(this.appData) :
              this.apiBlog.markBlogAsDefault(this.appData.id).subscribe((data) => {
                this.openDashboard(data);
              });
          }
          else {
            this.apiBlog.updateBlog(this.blogId,payload).pipe(
              switchMap((blog) => {
                return this.appData.isDefault ?
                  of(this.openDashboard(blog)) :
                  this.apiBlog.markBlogAsDefault(this.appData.id)
                  .pipe(tap(data => this.openDashboard(data)))
              }),
            ).subscribe((data) => { }, (error) => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            })
          }
        }
      }

      return;
    }

    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      if(this.blogConfig.picture === ''){
        const payload: {  name: string} = 
        {
          name:this.blogConfig.name,
        }
        if (!this.errorMsg) {
          this.apiBlog.createBlog(payload).pipe(
            switchMap((data) => {
              this.appData.id = data._id;
  
              return this.apiBlog.markBlogAsDefault(data._id);
            }),
            tap((data) => {
              this.openDashboard(data);
            }),
          ).subscribe()
        }
      }
      else {
        const payload: { picture: string,  name: string} = 
        {
          picture:this.blogConfig.picture,
          name:this.blogConfig.name,
        }
        if (!this.errorMsg) {
          this.apiBlog.createBlog(payload).pipe(
            switchMap((data) => {
              this.appData.id = data._id;
  
              return this.apiBlog.markBlogAsDefault(data._id);
            }),
            tap((data) => {
              this.openDashboard(data);
            }),
          ).subscribe()
        }
      }    
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

  openDashboard(blog) {
    this.env.applicationId = this.appData.id;
    this.appData.onSved$.next({ openBlog: true, blog });
    this.overlay.close();
  }

  validateBlog(event) {
    const blogTitle=event.target.value;
    this.blogConfig.name = blogTitle

    if (!this.validateName(blogTitle)) {
      this.errorMsg = blogTitle.length < 3 ? 'Name should have at least 3 characters' : 'Name is not correct';
      this.cdr.markForCheck();

      return;
    }
    this.apiBlog.validateBlogName(blogTitle).subscribe((data) => {
      this.errorMsg = data.message && blogTitle != this.appData.name ? data.message : null;
      this.cdr.markForCheck();
    })
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

  removeBlog() {
    const dialog = this.alertDialog.open({
      data: {
        title: this.translateService.translate('blog-app.dialogs.delete_confirmation.delete'),
        subtitle: this.translateService.translate(
          'blog-app.dialogs.delete_confirmation.do_you_really_want_to_delete_item'),
        actions: [
          {
            label: this.translateService.translate('blog-app.dialogs.delete_confirmation.accept_button'),
            bgColor: '#eb4653',
            callback: () => Promise.resolve({ exit: true }),
          },
          {
            label: this.translateService.translate('blog-app.dialogs.delete_confirmation.decline_button'),
            callback: () => Promise.resolve({ exit: false }),
          },
        ],
      },
    });
    dialog.afterClosed().pipe(
      switchMap((result) => {
        if (result.exit) {
          return this.apiBlog.deleteBlog(this.appData.id).pipe(
            tap((data) => {
              this.appData.onSved$.next({ updateBlogList: true });
              this.overlay.close();
            }),
          );
        }

        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.peMediaService
        .postMediaBlob(file, PeMediaFileTypeEnum.Image, this.env.businessId, this.blogContainer)
        .pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                const resp = event.body as any;
                const url = this.peMediaService.getMediaUrl(resp.blobName, this.blogContainer);
                this.blogConfig.picture = (url || reader.result as string);
                this.isImageLoading = false;
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
