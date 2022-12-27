import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import transform from 'lodash/transform';
import uniqBy from 'lodash/uniqBy';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer, PebShopThemeVersionEntity, PebTheme } from '@pe/builder-core';
import { MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { PebEditorAccessorService } from '../../../../../../builder/services/src/lib/editor-accessor.service';
import { ReviewPublishComponent } from '../../../../../../builder/publishing/src/lib/review-publish.component';

import { PeInvoiceApi } from '../../services/abstract.invoice.api';

enum PublishIcons {
  'publish' = '/assets/icons/publish.svg',
  'close' = '/assets/icons/close-icon.svg',
}

@Component({
  selector: 'pe-builder-publish',
  templateUrl: './builder-publish.component.html',
  styleUrls: ['./builder-publish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeInvoiceBuilderPublishComponent implements OnInit {
  loading = true;
  errorMsg = ''
  publishing: boolean;
  theme;
  preview;
  activeVersion
  tags: string[] = []
  publishable;
  reviewable = false;
  canUndo = false;
  themeVersions: PebShopThemeVersionEntity[];
  invoice: any;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('fileInput') fileInput: ElementRef;
  isLargeThenParent = false;
  readonly isPictureLoadingSubject = new BehaviorSubject(true);
  uploadProgress = 0;

  reviewData: any;

  constructor(
    public dialogRef: MatDialogRef<PeInvoiceBuilderPublishComponent>,
    private editorApi: PebEditorApi,
    private invoicesApi: PeInvoiceApi,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private messageBus: MessageBus,
    private dialog: MatDialog,
    private editorAccessorService: PebEditorAccessorService,
    public iconRegistry: MatIconRegistry,
    public domSanitizer: DomSanitizer,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any,
    ) {
      Object.entries(PublishIcons).forEach(([name, path]) => {
        iconRegistry.addSvgIcon(
          name,
          domSanitizer.bypassSecurityTrustResourceUrl(`${path}`),
        );
      });
  }

  ngOnInit() {
    if(this.dialogData.invoiceId) {
      this.invoicesApi.getSingleInvoice(this.dialogData.invoiceId).pipe(
        tap(invoice => this.invoice = invoice),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    this.editorApi.getShopActiveTheme().pipe(
      tap((data) => {
          this.getSnapshot(data.theme);
        },
        (err) => {
          this.errorMsg = this.translateService.translate(`header.unknown_publish_error`);
          this.loading = false;
          this.cdr.detectChanges();
        },
      ),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  getSnapshot(themeId: string) {
    this.editorApi.getShopThemeById(themeId).pipe(
      switchMap((theme: PebTheme) => {
        this.theme = theme;
        if (!theme.picture) {
          this.isPictureLoadingSubject.next(false);
        };

        return this.editorApi.getThemeDetail(theme.id, 'front');
      }),
      switchMap((data) => {
        if (data.pages.length) {

          return this.editorApi.getPage(themeId, data.pages[0].id, 'desktop');
        }

        return of([]);
      }),
      tap((data) => {
        this.preview = data;
      }),
      switchMap((data) => {

        return this.editorApi.getShopThemeActiveVersion(themeId);
      }),
      switchMap((theme: any) => {
        this.activeVersion = theme?.id;
        this.tags = theme?.tags.length ? theme.tags : [];
        this.loading = false;
        if (theme?.published) {

          return this.editorApi.getCurrentShopPreview(this.dialogData.invoiceId, true, false);
        }
        this.reviewable = false;
        this.publishable = true;
        this.cdr.detectChanges();

        return EMPTY;
      }),
      tap(({ current, published }) => {
        const stylesheetIds = {};
        const pages = current.pages.map((page: any) => {
          if(page.stylesheets?.body) {
            page.stylesheets = page.stylesheets.body;
            Object.keys(page.stylesheets).map((key) => {
              stylesheetIds[key] = page.stylesheets[key]._id;
              page.stylesheets[key] = { ...page.stylesheets[key].body };
              page.stylesheetIds = stylesheetIds;
              page.contextId = page.context._id;
            });
          }
          page.template = page.template.body;
          page.context = {};

          return page;
        });
        const curr = { pages, snapshot: current };

        const totalPages = uniqBy([...pages, ...published.pages], 'id');
        const samePages = totalPages.filter((page) => {
          const currentPage = curr.pages.find(p => p.id === page.id);
          const publishedPage = published.pages.find(p => p.id === page.id);
          if (currentPage && publishedPage) {
            const diff = this.difference(currentPage, publishedPage);
            const keys = Object.keys(diff);

            return !(keys.includes('stylesheets') || keys.includes('template'));
          }

          return false;
        });
        const filteredPages = totalPages.filter((page) => {
          if (page.type === 'replica') {

            return !samePages.includes(page);
          }
        });

        this.reviewData = {
          published,
          totalPages: filteredPages,
          current: curr,
        };

        this.reviewable = true;
        this.publishable = true;
        this.cdr.detectChanges();
      }),
      catchError((err) => {
        this.errorMsg = this.translateService.translate(`invoice-app.errors.unknown_error`);
        this.loading = false;
        this.cdr.detectChanges();

        return this.errorMsg;
      }),
    ).subscribe();
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  updateThemeName(event) {
    this.editorApi.updateShopThemeName(this.theme.id, event).subscribe(data => this.theme = data.theme)
  }

  onPublish(): void {
    this.publishing = true;
    if (!this.publishable) {

      return;
    }
    if (this.reviewable) {

      this.editorApi.getCurrentShopPreview(this.dialogData.invoiceId, true).pipe(
        tap(({ current, published }) => {
          const stylesheetIds = {};
          const pages = current.pages.map((page: any) => {
            if(page.stylesheets?.body) {
              page.stylesheets = page.stylesheets.body;
              Object.keys(page.stylesheets).map((key) => {
                stylesheetIds[key] = page.stylesheets[key]._id;
                page.stylesheets[key] = { ...page.stylesheets[key].body };
                page.stylesheetIds = stylesheetIds;
                page.contextId = page.context._id;
              });
            }
            page.template = page.template.body;
            page.context = {};

            return page;
          });
          const curr = { pages, snapshot: current };
          const totalPages = uniqBy([...curr.pages, ...published.pages], 'id');
          const samePages = totalPages.filter((page) => {
            const currentPage = curr.pages.find(p => p.id === page.id);
            const publishedPage = published.pages.find(p => p.id === page.id);

            return currentPage?.updatedAt === publishedPage?.updatedAt;
          });
          const filteredPages = totalPages.filter((page) => {
            if(page.type === 'replica') {

              return !samePages.includes(page);
            }
          });

          const data = {
            published,
            totalPages: filteredPages,
            current: curr,
          };

          this.openPublishDialog(data);
        }),
      ).subscribe();

      this.dialogRef.close(true);
    } else {
      this.publish();
      this.dialogRef.close(true);
    }
  }

  onViewUrl(): void {
    this.messageBus.emit('invoice.open', this.invoice);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
    this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe()
  }

  remove(index): void {
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe()
    }
  }

  onImageUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';
      reader.onload = () => {
        this.isPictureLoadingSubject.next(true);
        this.editorApi.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroyed$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.uploadProgress = event.loaded;
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.uploadProgress = 0;
                this.updateThemeImage(event?.body?.blobName)
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          },
            (err) => {
              alert(this.translateService.translate(`header.no_update_image`));
            },
            () => {
              this.isPictureLoadingSubject.next(false);
            },
          ),
        ).subscribe();
      };
    }
  }

  updateThemeImage(image) {
    this.editorApi.updateShopThemePreview(this.theme.id, image).subscribe((data) => {
      this.theme = data;
      this.cdr.markForCheck();
      this.isPictureLoadingSubject.next(false)
    },
      (err) => {
        this.isPictureLoadingSubject.next(false);
        alert(this.translateService.translate(`header.no_update_image`));
      },
    )
  }

  onload() {
    this.isPictureLoadingSubject.next(false)
  }

  openPublishDialog(dialogData: any): void {
    const dialogRef = this.dialog.open(ReviewPublishComponent, {
      height: '82.3vh',
      maxHeight: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: 'review-publish-dialog',
      data: { ...dialogData },
    });

    dialogRef.backdropClick().pipe(
      tap(() => dialogRef.close()),
    ).subscribe();

    dialogRef.afterClosed().pipe(
      tap((toPublish: boolean) => {
        this.publishing = false;
        this.cdr.detectChanges();

        if (toPublish) {
          this.publishing = true;
          this.publish();
        }
      }),
    ).subscribe();
  }

  private difference(object, base) {
    // tslint:disable-next-line:no-shadowed-variable
    function changes(object, base) {

      return transform(object, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }

    return changes(object, base);
  }

  private publish(): void {
    this.editorApi.createShopThemeVersion(this.theme.id).pipe(
      switchMap((data) => {

        return this.editorApi.publishShopThemeVersion(this.theme.id, data.id)
      }),
      tap(() => this.editorAccessorService.editorComponent.commands$.next({ type: 'publish' })),
      catchError((err: any) => {
        this.publishing = false
        alert(this.translateService.translate(`header.no_publish`))

        return EMPTY
      }),
    ).subscribe(() => this.dialogRef.close(true));
  }
}
