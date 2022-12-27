import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, take, tap, filter, debounceTime } from 'rxjs/operators';

import { MessageBus, PeDestroyService } from '@pe/common';
import { ErrorBag, FormSchemeField } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { CreateCheckoutFormComponent } from '../../components/create-checkout-form/create-checkout-form.component';
import { CheckoutInterface } from '../../interfaces';
import { StorageService } from '../../services';
import { TimestampEvent } from '../timestamp-event';

@Component({
  selector: 'checkout-create',
  templateUrl: './create-checkout.component.html',
  styleUrls: ['./create-checkout.component.scss'],
  providers: [ErrorBag, PeDestroyService],
})
export class CreateCheckoutComponent implements OnInit {

  @Input() createMode: boolean;
  @Input() checkoutUuid = '';

  @Output() openCheckout: EventEmitter<boolean> = new EventEmitter();
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();
  @Output() resetCheckout: EventEmitter<boolean> = new EventEmitter();

  currentCheckout$: Observable<CheckoutInterface> = this.stService.getCheckoutById(this.checkoutUuid).pipe(
    takeUntil(this.destroyed$),
    tap((checkout: CheckoutInterface) => this.currentCheckout = checkout)
  );

  theme = 'dark';
  submit$: BehaviorSubject<TimestampEvent> = new BehaviorSubject<TimestampEvent>(null);
  defaultCheckoutId: string = this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];

  currentCheckout: CheckoutInterface;
  businessUuid: FormControl = new FormControl();
  nameFieldset: FormSchemeField[];
  headerTitle: string;
  logoFieldset: FormSchemeField[];
  isModal: boolean;
  openedMicro: string;
  openedFromSwithcer: boolean = this.activatedRoute.snapshot.queryParams['fromSwitcher'];
  submitting: boolean;
  formStorageKey = 'checkout.new_checkout';

  title: string;
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<number>(0);
  onSuccessSubject$ = new BehaviorSubject<CheckoutInterface>(null);
  onDeletedSubject$ = new BehaviorSubject<CheckoutInterface>(null);

  private readonly nameMaxLength: number = 40;

  constructor(
    private activatedRoute: ActivatedRoute,
    private messageBus: MessageBus,
    private stService: StorageService,
    private router: Router,
    private destroyed$: PeDestroyService,
    public translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
  ) {
  }

  ngOnInit() {
    this.openedMicro = this.activatedRoute.snapshot.queryParams['openedMicro'];
    this.isModal = this.activatedRoute.snapshot.data['modal'] || this.activatedRoute.parent.snapshot.data['modal'];
    this.title = this.translateService.translate('create_checkout.title.add');
    this.currentCheckout$.pipe(takeUntil(this.destroyed$)).subscribe();
    this.stService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme
        && business?.themeSettings?.theme !== 'default' ? business.themeSettings.theme : 'dark';
        this.setModalOptions();
      });
  }

  get formScheme(): any {
    return {
      fieldsets: {
        logoFieldset: this.logoFieldset,
        nameFieldset: this.nameFieldset,
      },
    };
  }

  setModalOptions() {
    this.title = this.createMode
      ? this.translateService.translate('create_checkout.title.add')
      : this.translateService.translate('create_checkout.title.edit');
    this.onSaveSubject$ = new BehaviorSubject<number>(0);
    this.onSuccessSubject$ = new BehaviorSubject<CheckoutInterface>(null);
    this.onDeletedSubject$ = new BehaviorSubject<CheckoutInterface>(null);
    const config: PeOverlayConfig = {
      data: {
        createMode: this.createMode,
        isModal: this.isModal,
        submit$: this.onSaveSubject$.asObservable(),
        onSaved$: this.onSuccessSubject$,
        onDeleted$: this.onDeletedSubject$,
        checkoutUuid: this.checkoutUuid,
        isCurrentCheckout: this.checkoutUuid === this.defaultCheckoutId,
      },
      hasBackdrop: true,
      backdropClass: 'create-checkout-modal',
      headerConfig: {
        title: this.title,
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate(
          this.createMode ? 'create_checkout.buttons.create' : 'actions.open'
        ),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(1);
        },
        theme: this.theme,
      },
      component: CreateCheckoutFormComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.asObservable().pipe(take(1)).subscribe(() => {
      if (this.createMode) {
        if (this.isModal) {
          const channelSetId: string = this.activatedRoute.snapshot.params['channelSetId']
            || this.activatedRoute.parent.snapshot.params['channelSetId'];

          this.stService.attachChannelSetToCheckout(channelSetId, this.currentCheckout._id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
              this.backToModal(this.currentCheckout._id);
            });
        } else if (this.currentCheckout?._id && this.submitting) {
          this.submitting = false;
          setTimeout(() => this.router.navigate([this.stService.getHomeUrl(this.currentCheckout._id)]), 300);
        }
      } else {
        if (this.openedMicro) {
          this.messageBus.emit('checkout.navigate-to-app', 'connect/accountings/debitoor');
        } else if (this.submitting) {
          this.openCheckout.emit(true);
        } else {
          this.resetCheckout.emit(true);
        }
      }
      this.closeModal.emit(true);
    });

    this.onSuccessSubject$.asObservable()
      .pipe(filter(val => !!val), debounceTime(300), takeUntil(this.destroyed$))
      .subscribe(checkout => this.onSuccess(checkout));

    this.onDeletedSubject$.asObservable()
      .pipe(filter(val => !!val), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.dialogRef.close();
        this.resetCheckout.emit(true);
      });
  }

  goBack() {
    if (this.openedMicro) {
      this.messageBus.emit('checkout.navigate-to-app', 'connect/accountings/debitoor');
    } else if (this.isModal) {
      this.currentCheckout$.pipe(take(1)).subscribe((checkout: CheckoutInterface) => {
        this.backToModal(checkout ? checkout._id : null);
      });
    } else {
      if (this.currentCheckout) {
        this.router.navigate(['..'], { relativeTo: this.activatedRoute }); // this.stService.getHomeUrl()
      } else {
        this.stService.getCheckoutsOnce().subscribe((checkoutList: CheckoutInterface[]) => {
          if (checkoutList.length === 0) {
            this.messageBus.emit('checkout.back-to-dashboard', null);
          } else {
            history.back();
          }
        });
      }
    }

  }

  onSuccess(checkout: CheckoutInterface) {
    this.currentCheckout = checkout;
    this.submitting = true;
    this.dialogRef.close();
    this.resetCheckout.emit(true);
  }

  private backToModal(checkoutUuid: string): void {
    if (this.openedFromSwithcer) {
      if (this.createMode) {
        this.router.navigate([`../switch`], { relativeTo: this.activatedRoute });
      } else {
        this.router.navigate([`../../switch`], { relativeTo: this.activatedRoute });
      }
    } else {
      if (this.createMode) {
        this.router.navigate([`../${checkoutUuid}/view`], { relativeTo: this.activatedRoute });
      } else {
        this.router.navigate([`../view`], { relativeTo: this.activatedRoute });
      }
    }
  }

}
