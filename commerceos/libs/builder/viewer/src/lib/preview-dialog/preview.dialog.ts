import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { PebScreen, PebThemeDetailInterface, PebThemePageInterface } from '@pe/builder-core';
import { PeDestroyService } from '@pe/common';

import { fromResizeObserver } from '../../../../renderer/src/lib/shared/from-resize-observer';

const desktopBreakHeight = 900;
const desktopMinWidth = 1200;

export interface PreviewDialogData {
  themeSnapshot: { snapshot: PebThemeDetailInterface, pages: PebThemePageInterface[] };
  screen: PebScreen;
}

@Component({
  selector: 'peb-viewer-preview-dialog',
  templateUrl: './preview.dialog.html',
  styleUrls: ['./preview.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebViewerPreviewDialog implements AfterViewInit {
  PebScreen = PebScreen;

  frameScreenType$: BehaviorSubject<PebScreen>;
  activeScreen$: Observable<PebScreen>;

  themeSnapshot: { snapshot: PebThemeDetailInterface, pages: PebThemePageInterface[] };

  @ViewChild('frameWrapper')
  private frameWrapper: ElementRef;

  readonly viewInit$ = new Subject<void>();

  readonly deviceFrameTransform$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.frameWrapper.nativeElement)),
    map((ds) => {
      if (this.frameScreenType$.value === PebScreen.Desktop) {
        return ds.width < desktopMinWidth ?
          `scale(${ds.width / desktopMinWidth})` : `scale(1)`;
      }

      return 'scale(1)';
    }),
    takeUntil(this.destroy$),
  );

  readonly deviceFrameHeight$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.frameWrapper.nativeElement)),
    map((ds) => {
      if (this.frameScreenType$.value === PebScreen.Desktop) {
        return ds.width < desktopMinWidth ?
        `calc(100% / ${ds.width / desktopMinWidth})` : '100%';
      }

      return '100%';
    }),
    takeUntil(this.destroy$),
  )

  constructor(
    private dialogRef: MatDialogRef<PebViewerPreviewDialog>,
    readonly destroy$: PeDestroyService,
    @Inject(MAT_DIALOG_DATA) data: PreviewDialogData,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.themeSnapshot = data.themeSnapshot;
    this.frameScreenType$ = new BehaviorSubject<PebScreen>(data.screen || PebScreen.Desktop);
    this.activeScreen$ = this.frameScreenType$.asObservable();

    iconRegistry.addSvgIcon(
      'preview-back',
      domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/general/preview-back.svg`),
    );
  }

  ngAfterViewInit() {
    this.viewInit$.next();
  }

  close() {
    this.dialogRef.close();
  }

  changeScreenType(screen: PebScreen) {
    this.frameScreenType$.next(screen);
  }
}

const HIDE_WARNINGS = [
  ElementRef,
];
