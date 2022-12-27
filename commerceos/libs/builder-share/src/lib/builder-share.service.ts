import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ThemeSwitcherService } from '@pe/theme-switcher';

import { PeBuilderShareComponent } from './builder-share.component';
import { PeBuilderShareGetLinkComponent } from './get-link/get-link.component';


@Injectable()
export class PeBuilderShareService {

  constructor(
    private overlayWidgetService: PeOverlayWidgetService,
    private themeSwitcherService: ThemeSwitcherService,
  ) { }

  openShareDialog(): PeOverlayRef {
    const doneSubject$ = new ReplaySubject(1);
    const overlayRef = this.overlayWidgetService.open({
      component: PeBuilderShareComponent,
      hasBackdrop: true,
      panelClass: 'builder-share-panel',
      headerConfig: {
        title: 'Share',
        theme: this.themeSwitcherService.theme,
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          overlayRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          doneSubject$.next();
        },
      },
      data: { done$: doneSubject$.asObservable() },
      backdropClick: () => {},
    });
    overlayRef.afterClosed.subscribe(() => doneSubject$.complete());

    return overlayRef;
  }

  openGetLinkDialog({ appType }: { appType: string }): PeOverlayRef {
    const doneSubject$ = new ReplaySubject(1);
    const overlayRef = this.overlayWidgetService.open({
      component: PeBuilderShareGetLinkComponent,
      hasBackdrop: true,
      panelClass: 'builder-share-panel',
      headerConfig: {
        title: 'Get Link',
        theme: this.themeSwitcherService.theme,
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          overlayRef.close();
        },
        doneBtnTitle: 'Copy link',
        doneBtnCallback: () => {
          doneSubject$.next();
        },
      },
      data: { done$: doneSubject$.asObservable(), appType },
      backdropClick: () => {},
    });
    overlayRef.afterClosed.subscribe(() => doneSubject$.complete());

    return overlayRef;
  }
}
