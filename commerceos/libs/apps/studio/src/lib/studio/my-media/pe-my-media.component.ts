import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, HostBinding, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { StudioApiService } from '../../core';
import { MediaViewEnum } from '../../core';
import { PeStudioMedia } from '../../core';

import { PePreviewComponent } from './preview/pe-preview.component';

@Component({
  selector: 'lib-my-media',
  templateUrl: './pe-my-media.component.html',
  styleUrls: ['./pe-my-media.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeMyMediaComponent implements OnInit {
  @HostBinding('class') previewModal = 'pe-my-media';

  image$: Observable<PeStudioMedia>;
  theme: string;

  constructor(
    private mediaService: StudioApiService,
    public dialog: MatDialog,
    private overlay: Overlay,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public mediaData,
  ) {}

  ngOnInit(): void {
    this.theme = this.mediaData.theme;

    if (this.mediaData.mediaView === MediaViewEnum.allMedia) {
      this.image$ = this.mediaService.getSubscriptionMediaById(this.mediaData.id);
    } else {
      this.image$ = this.mediaService.getUserSubscriptionMediaById(this.mediaData.id);
    }
  }

  openPreviewDialog() {
    this.image$.pipe(
      switchMap((image) => {
        const overlayRef = this.overlay.create({
          disposeOnNavigation: true,
          hasBackdrop: true,
          positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
          backdropClass: 'cdk-dark-backdrop',
          panelClass: 'preview-modal',
        });
        const confirmScreenPortal = new ComponentPortal(PePreviewComponent, null, this.createInjector(image));
        const confirmScreenRef = overlayRef.attach(confirmScreenPortal);

        return confirmScreenRef.instance.detachOverlay
          .pipe(
            tap(() => {
              overlayRef.detach();
              overlayRef.dispose();
            })
          );
      }),
      take(1),
    ).subscribe();
  }

  private createInjector(headings = {}): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: { ...this.mediaData, ...headings },
      }],
    });
  }

  downloadImage() {
    this.image$.pipe(
      tap((image) => {
        this.mediaService.downloadMedia(image.url);
      }),
      take(1),
    ).subscribe();
  }
}
