import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { BehaviorSubject, EMPTY, merge } from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { StorageService } from '../../../services';

import { CALLBACKS, PANELS, WEBHOOKS } from './constants';

@Component({
  selector: 'checkout-callbacks',
  templateUrl: './callbacks.component.html',
  styleUrls: ['./callbacks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class CallbacksComponent implements OnInit {
  @ViewChildren(MatExpansionPanel) panelRefs: QueryList<MatExpansionPanel>;

  urlPattern = /^((http|https):\/\/)/;

  callbacksForm = this.fb.group({
    successUrl: [null, [Validators.required, Validators.pattern(this.urlPattern)]],
    pendingUrl: [null, [Validators.required, Validators.pattern(this.urlPattern)]],
    cancelUrl: [null, [Validators.required, Validators.pattern(this.urlPattern)]],
    failureUrl: [null, [Validators.required, Validators.pattern(this.urlPattern)]],
    noticeUrl: [null, [Validators.required, Validators.pattern(this.urlPattern)]],
  });

  readonly panels = PANELS;
  readonly callbacks = CALLBACKS;
  readonly webhooks = WEBHOOKS;

  private readonly fetchCheckout$ = this.checkoutStorageService.getCheckoutByIdOnce(this.overlayData.checkoutUuid).pipe(
    shareReplay(1),
  );

  private readonly isLoadingSubject$ = new BehaviorSubject<boolean>(false);

  private readonly onClose$ = this.overlayData.onClose$.pipe(
    filter(val => !!val),
    tap(() => this.callbacksForm.dirty ? this.initWarningModal() : this.overlayData.close()),
  );

  private readonly onSave$ = this.overlayData.onSave$.pipe(
    filter(value => !!value),
    tap(() => {
      this.callbacksForm.markAsDirty();
      Object.values(this.callbacksForm.controls).forEach(ctrl => ctrl.markAsDirty());
      this.cdr.detectChanges();
    }),
    filter(() => this.callbacksForm.valid),
    tap(() => {
      this.isLoadingSubject$.next(true);
    }),
    switchMap(() => this.fetchCheckout$.pipe(
      map(checkout => ({
        ...checkout,
        settings: {
          ...checkout.settings,
          callbacks: { ...this.callbacksForm.value },
        },
      })),
      switchMap(checkout => this.checkoutStorageService.saveCheckout(checkout._id, checkout).pipe(
        tap(() => {
          this.isLoadingSubject$.next(false);
          this.overlayData.close();
        }),
        catchError(() => {
          this.isLoadingSubject$.next(false);

          return EMPTY;
        }),
      )),
    )),
  );

  private readonly initForm$ = this.fetchCheckout$.pipe(
    map(checkout => ({
      cancelUrl: checkout.settings.callbacks?.cancelUrl ?? null,
      failureUrl: checkout.settings.callbacks?.failureUrl ?? null,
      noticeUrl: checkout.settings.callbacks?.noticeUrl ?? null,
      pendingUrl: checkout.settings.callbacks?.pendingUrl ?? null,
      successUrl: checkout.settings.callbacks?.successUrl ?? null,
    })),
    tap(value => this.callbacksForm.setValue(value, { emitEvent: false })),
  );

  errors$ = this.callbacksForm.valueChanges.pipe(
    startWith(this.callbacksForm.value),
    map(() => this.getErrorObject()),
    shareReplay(1),
  );

  constructor(
    private fb: FormBuilder,
    protected checkoutStorageService: StorageService,
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private cdr: ChangeDetectorRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.overlayConfig.isLoading$ = this.isLoadingSubject$.asObservable();

    merge(
      this.initForm$,
      this.onSave$,
      this.onClose$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private initWarningModal() {
    const headings: Headings = {
      title: this.translateService.translate('settings.callbacks.warning-modal.title'),
      subtitle: this.translateService.translate('settings.callbacks.warning-modal.description'),
      confirmBtnText: this.translateService.translate('settings.callbacks.warning-modal.actions.yes'),
      declineBtnText: this.translateService.translate('settings.callbacks.warning-modal.actions.no'),
    }

    this.confirmScreenService.show(headings, true).pipe(
      filter(val => val),
      tap(() => this.overlayData.close()),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getErrorObject(): { [key: string]: string } {
    return Object.entries(this.callbacksForm.controls).reduce((acc, [key, value], idx) => {
      const error = Object.keys(value.errors || {})?.[0];
      const hooks = this.callbacks.concat(this.webhooks);
      const hook = hooks.find(hook => hook.controlName === key);
      acc[key] = hook.error[error] || '';

      return acc;
    }, {});
  }
}
