import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EventEmitter, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { MessageBus } from '@pe/common';

import { Headings, HEADINGS_DATA } from './confirm-screen-heading.model';
import { ConfirmationOverlayScreenComponent } from './confirm-screen.component';

@Injectable({ providedIn: 'any' })
export class ConfirmScreenService {
  private overlayRef: OverlayRef;
  private isClosed = false;

  constructor(
    private overlay: Overlay,
    private messageBus: MessageBus,
    private injector: Injector
  ) { }

  destroy() {
    this.overlayRef?.detach();
  }

  show(headings: Headings, useObservable: boolean = false) {
    this.isClosed = false;
    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      backdropClass: 'cdk-dark-backdrop',
      panelClass: 'confirm_panel',
    });
    const confirmScreenPortal = new ComponentPortal(ConfirmationOverlayScreenComponent, null, this.createInjector(headings));
    const confirmScreenRef = this.overlayRef.attach(confirmScreenPortal);
    const { confirmLoading$ } = confirmScreenRef.instance.headingsData;

    const close$ = (loading$: BehaviorSubject<boolean>, confirmation: boolean) => confirmation && loading$
      ? loading$.pipe(map(loading => !loading))
      : of(true);

    const closeScreen$ = (confirmation: boolean) => close$(confirmLoading$, confirmation)
      .pipe(
        filter(() => !this.isClosed),
        tap((status) => {
          if (status) {
            this.isClosed = true;
            confirmLoading$?.next(false);
            confirmLoading$?.complete();
            this.overlayRef.detach();
            this.overlayRef.dispose();
          }
        }),
        map(() => confirmation));

    const getConfirmation$ = (confirmation: EventEmitter<boolean>, useObservable = false) => confirmation
      .pipe(
        take(1),
        switchMap((confirmation) => {
          !useObservable && this.messageBus.emit('confirm', confirmation);

          return closeScreen$(confirmation)
        }));

    if (useObservable) {
      return getConfirmation$(confirmScreenRef.instance.confirmation, useObservable);
    } else {
      getConfirmation$(confirmScreenRef.instance.confirmation).subscribe();
    }
  }

  private createInjector(headings): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: HEADINGS_DATA,
        useValue: headings,
      }],
    });
  }
}
