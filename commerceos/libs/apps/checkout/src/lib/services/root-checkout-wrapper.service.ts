import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject, Observable, of, Subject, Subscription, throwError, timer } from 'rxjs';
import { catchError, first, flatMap, map, switchMap, tap } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface, CheckoutSharedService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { TimestampEvent } from '../components/timestamp-event';
import { CheckoutChannelSetInterface, CheckoutInterface } from '../interfaces';
import { CheckoutStateParamsInterface, CheckoutEventInterface, CheckoutPluginEventEnum } from '../shared/checkout-sdk';

import { StorageService } from './storage.service';


export type PrefilledLinkCallback = (link: string) => void;

interface CopyModalRequiredInterface {
  text: string;
  message: string;
}

@Injectable()
export class RootCheckoutWrapperService {

  channelSetId$: Observable<string> = null;
  params$: Observable<CheckoutStateParamsInterface> = null;
  isCustomElementReady$: Observable<boolean> = null;
  reCreateFlow$: Observable<TimestampEvent> = null;
  saveFlowToStorage$: Observable<TimestampEvent> = null;
  copyModalRequired$: Observable<CopyModalRequiredInterface> = null; // TODO not used, maybe better to remove

  checkoutVisible$: Observable<boolean> = null;
  checkoutLoading$: Observable<boolean> = null;
  cancelEmitted$: Observable<void> = null;

  readonly defaultParams: CheckoutStateParamsInterface = {
    forceNoPaddings: false,
    forceFullScreen: true,
    embeddedMode: false,
    forceShowBusinessHeader: true,
    layoutWithPaddings: true,
    forceNoCloseButton: true,
    cancelButtonText: this.translateService.translate('actions.switch_checkout'),
  };

  private channelSetIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private paramsSubject: BehaviorSubject<CheckoutStateParamsInterface> =
  new BehaviorSubject<CheckoutStateParamsInterface>(null);

  private isCustomElementReadySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private reCreateFlowSubject: BehaviorSubject<TimestampEvent> = new BehaviorSubject<TimestampEvent>(null);
  private saveFlowToStorageSubject: Subject<TimestampEvent> = new Subject();
  private copyModalRequiredSubject: Subject<CopyModalRequiredInterface> = new Subject();

  private checkoutVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private checkoutLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private cancelEmittedSubject: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  private checkoutUuid: string = null;
  private isSaving = false;
  private callback: PrefilledLinkCallback = null;

  private lastSetCheckoutSub: Subscription = null;
  private renderer: Renderer2 = null;

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private storageService: StorageService,
    private clipboardService: ClipboardService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private checkoutSharedService: CheckoutSharedService,
    rendererFactory: RendererFactory2
  ) {
    this.paramsSubject.next(this.defaultParams);

    this.channelSetId$ = this.channelSetIdSubject.asObservable();
    this.params$ = this.paramsSubject.asObservable();
    this.isCustomElementReady$ = this.isCustomElementReadySubject.asObservable();
    this.reCreateFlow$ = this.reCreateFlowSubject.asObservable();
    this.saveFlowToStorage$ = this.saveFlowToStorageSubject.asObservable();
    this.copyModalRequired$ = this.copyModalRequiredSubject.asObservable();

    this.checkoutVisible$ = this.checkoutVisibleSubject.asObservable();

    this.checkoutLoading$ = this.checkoutLoadingSubject.asObservable();
    this.cancelEmitted$ = this.cancelEmittedSubject.asObservable();

    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setCheckoutUuid(uuid: string): void {
    if (this.checkoutUuid !== uuid) {
      this.setCustomElementReady(false);
    }
    this.checkoutUuid = uuid;
    this.channelSetIdSubject.next(null);
    if (this.lastSetCheckoutSub) {
      this.lastSetCheckoutSub.unsubscribe();
      this.lastSetCheckoutSub = null;
    }
    this.lastSetCheckoutSub = this.getCheckoutChannelSetID(this.checkoutUuid).subscribe((channelSetId: string) => {
      this.channelSetIdSubject.next(channelSetId);
    }, (err: string) => {
      this.snackBarService.toggle(true, { content: err });
    });
  }

  setParams(params: CheckoutStateParamsInterface): void {
    this.paramsSubject.next(params);
  }

  setCustomElementReady(isReady: boolean): void {
    this.isCustomElementReadySubject.next(isReady);
  }

  showCheckout(value: boolean): void {
    this.checkoutVisibleSubject.next(value);
  }

  onSettingsUpdated(): void {
    this.reCreateFlow();
  }

  reCreateFlow(): void {
    if (this.channelSetIdSubject.getValue() && this.paramsSubject.getValue()) {
      this.setCustomElementReady(false);
      this.reCreateFlowSubject.next(new TimestampEvent());
    }
  }

  doCopyLink() {
    this.copyLink();
  }

/*
  doCopyWithPrefilled(): void {
    this.preparePrefilled(link => {
      this.clipboardCopy(link, this.translateService.translate('rootCheckoutWrapper.copied'));
    });
  }
*/
  doEmailPrefilled(): void {
    this.preparePrefilled((link) => {
      this.storageService.getUserBusiness().subscribe((business) => {
        const subject = this.translateService.translate('rootCheckoutWrapper.mail.subject');
        let body = this.translateService.translate('rootCheckoutWrapper.mail.body', {
          businessName: business.name,
          paymentLink: link,
        });
        body = body.split('<br>').join('\n');
        body = body.split('<br/>').join('\n');
        body = body.split('<br />').join('\n');
        const a: HTMLLinkElement = this.renderer.createElement('a');
        this.renderer.setAttribute(
        a, 'href', `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        a.click();
        a.remove();
      });
    });
  }

  preparePrefilled(callback: PrefilledLinkCallback): void {
    if (!this.isSaving) {
      this.isSaving = true;
      this.callback = callback;
      this.checkoutLoadingSubject.next(true);
      this.saveFlowToStorageSubject.next(new TimestampEvent());
    }
  }

  // onEventEmitted(e: CheckoutEventInterface): void {
  onEventEmitted(event: any): void {
    const e: CheckoutEventInterface = event && event.detail ? event.detail : null;

    if (e.event === CheckoutPluginEventEnum.payeverCheckoutClosed) {
      this.cancelEmittedSubject.next();
      this.showCheckout(false);
      this.reCreateFlow();
    }
    if (e.event === CheckoutPluginEventEnum.payeverCheckoutFlowSavedToStorage) {
      if (this.isSaving) {
        this.checkoutLoadingSubject.next(false);
        this.isSaving = false;
        if (e.value.restoreUrl) {
          this.callback(e.value.restoreUrl);
          this.callback = null;
        }
      }
    }
  }

  canCreateFlow(reset: boolean = false): Observable<boolean> {
    return this.storageService.getDefaultCheckoutOnce().pipe(flatMap((checkoutData) => {
      return this.storageService.getChannelSetsForCheckoutByTypeOnce(checkoutData._id, 'link').pipe(
        flatMap((channelSetIds: CheckoutChannelSetInterface[]) => {
          if (reset && channelSetIds && channelSetIds.length === 0) {
            return this.storageService.getChannelSetsForCheckoutByTypeOnce(checkoutData._id, 'link', true);
          } else {
            return of(channelSetIds);
          }
        }),
        map((channelSetIds: CheckoutChannelSetInterface[]) => {
          return channelSetIds && channelSetIds.length > 0;
        })
      );
    }));
  }

  getCheckoutChannelSetID(id: string): Observable<string> {
    let checkoutData: CheckoutInterface;

    return this.storageService.getCheckoutByIdOnce(id).pipe(
      switchMap((_checkoutData: CheckoutInterface) => {
        checkoutData = _checkoutData;

        return this.storageService.getChannelSetsForCheckoutByTypeOnce(checkoutData._id, 'link');
      }),
      switchMap((channelSetIds: CheckoutChannelSetInterface[]) => {
        let obs$: Observable<CheckoutChannelSetInterface[]> = of(channelSetIds);
        // Reset channel sets only if they are missed
        if (!channelSetIds || channelSetIds.length === 0) {
          obs$ = this.storageService.getChannelSetsForCheckoutByTypeOnce(checkoutData._id, 'link', true);
        }

        return obs$;
      }),
      map((channelSetIds: CheckoutChannelSetInterface[]) => {
        if (channelSetIds.length === 0) {
          throw new Error('Checkout doesn\'t have channel set with type "link"!');
        }

        return channelSetIds[0].id;
      }),
      catchError((error) => {
        console.error(error); // TODO Add better error handling

        return throwError('Not possible to create checkout flow!');
      })
    );
  }

  tryClipboardCopy(text: string): Observable<boolean> {
    this.clipboardService.copyFromContent(text);
    if (this.isPopupsBlocked()) {
      return timer(200).pipe(map(() => false));
    }
    this.snackBarService.toggle(true, { content: this.translateService.translate('rootCheckoutWrapper.copied') });

    return of(true);
  }

  getCopyLink(): Observable<string> {
    return this.checkoutSharedService.locale$.pipe(
      map(locale => this.storageService.makeCreateCheckoutLink(this.channelSetIdSubject.value, locale)),
    );
  }

  private copyLink(): void {
    this.checkoutSharedService.locale$.pipe(
      first(),
      tap(locale =>
        this.clipboardCopy(
          this.storageService.makeCreateCheckoutLink(this.channelSetIdSubject.value, locale),
          this.translateService.translate('rootCheckoutWrapper.copied'),
        )
      ),
    ).subscribe();
  }

  private clipboardCopy(text: string, message: string): void {
    /*
    if (this.isPopupsBlocked()) {
      console.error('Cant copy text to clipboard, popup blocked!');
      // TODO This line is not used for now
      this.copyModalRequiredSubject.next({text, message});
    } else {
      this.clipboardService.copyFromContent(text);
      this.snackBarService.show(message);
    }*/
    this.clipboardService.copyFromContent(text);
    this.snackBarService.toggle(true, { content: message });
  }

  private isPopupsBlocked(): boolean {
    let result = false;
    const win = window.open(this.env.frontend.checkoutWrapper, 'screenX=100');
    if (!win || win.closed || win.closed === undefined || win.screenX === 0) {
      result = true;
    }
    if (win) {
      win.close();
    }

    return result;
  }
}
