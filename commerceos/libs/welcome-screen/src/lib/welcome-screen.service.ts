import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { WelcomeOverlayScreenComponent } from './welcome-screen.component';

@Injectable({ providedIn: 'any' })
export class WelcomeScreenService {
  private overlayRef: OverlayRef;
  destroyed$ = new Subject<void>();

  constructor(private overlay: Overlay, private router: Router) {}

  destroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.overlayRef?.detach();
  }

  show() {
    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      backdropClass: 'cdk-dark-backdrop',
      panelClass: 'welcome_panel',
    });
    const welcomeScreenPortal = new ComponentPortal(WelcomeOverlayScreenComponent);
    const welcomeScreenRef = this.overlayRef.attach(welcomeScreenPortal);
    welcomeScreenRef.instance.detachOverlay
      .pipe(
        take(1),
        tap(() => this.overlayRef.detach())
      ).subscribe();
  }
}
