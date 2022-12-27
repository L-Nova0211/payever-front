import { Component, Inject, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ErrorBag,
  ErrorBagDeepData,
  FormAbstractComponent,
  FormScheme,
  PeValidators,
  SnackBarService,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { CheckoutSettingsInterface } from '../../../interfaces';
import { StorageService } from '../../../services/storage.service';

interface FormInterface {
  hosts: {
    [key: string]: string
  };
}

@Component({
  selector: 'checkout-csp',
  templateUrl: './csp.component.html',
  styleUrls: ['./csp.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CspComponent extends FormAbstractComponent<FormInterface> implements OnInit, OnDestroy {

  startValue: FormInterface;
  formStorageKey = 'checkout-settings-csp'; // TODO Make more unique
  hideDisabled = false;

  formScheme: FormScheme;

  checkoutUuid = this.overlayData.checkoutUuid;

  checkoutHosts: string[];

  isModal = this.overlayData.isModal;
  title = this.translateService.translate('settings.csp.host.label');
  placeholder = this.translateService.translate('settings.csp.host.placeholder');
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errorBag: ErrorBag = this.injector.get(ErrorBag);
  errorsNonFlat$: Observable<ErrorBagDeepData> = this.errorBag.errors$;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));

  protected snackBarService: SnackBarService = this.injector.get(SnackBarService);
  protected checkoutStorageService: StorageService = this.injector.get(StorageService);
  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected router: Router = this.injector.get(Router);

  constructor(
    injector: Injector,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any
  ) {
    super(injector);
  }

  ngOnInit() {
    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();
    this.overlayConfig.doneBtnCallback = () => {
      if (this.form) {
        this.onSuccess();
      }
    }

    this.onClose$.subscribe(() => {
      if (this.form) {
        this.overlayData.close();
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.flushDataStorage();
  }

  createForm(initialData: FormInterface) {
    this.checkoutStorageService.getCheckoutByIdOnce(
      this.checkoutUuid
    ).pipe(takeUntil(this.destroyed$)).subscribe((currentCheckout) => {
      timer(0).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.createFormDeferred(currentCheckout.settings.cspAllowedHosts || []);
      });
    });
  }

  createFormDeferred(initialHosts: string[]) {
    this.checkoutHosts = initialHosts;
    this.form = this.formBuilder.group({
      host: ['', [
        PeValidators.notEmptyStringValidator(),
        this.forbiddenHostValidator(this.checkoutHosts),
      ]],
    });
    this.changeDetectorRef.detectChanges();
  }

  goBack(): void {
    if (this.isModal) {
      this.backToModal();
    } else {

      this.router.navigate([`${this.checkoutStorageService.getHomeSettingsUrl(this.checkoutUuid)}`]);

    }
  }

  onSuccess() {
    this.isLoading$.next(true);
    this.checkoutStorageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((currentCheckout) => {
      const settings: CheckoutSettingsInterface = {
        ...currentCheckout.settings,
        cspAllowedHosts: this.checkoutHosts,
      };
      this.form.get('host').patchValue('', { emitEvent: false });

      this.checkoutStorageService.saveCheckoutSettings(currentCheckout._id, settings)
        .subscribe((checkout) => {
          this.checkoutHosts = checkout.settings.cspAllowedHosts;
          this.isLoading$.next(false);
          this.overlayData.close();
          this.changeDetectorRef.detectChanges();
        }, (error) => {
          this.showError(error.message || this.translateService.translate('settings.csp.unknownError'));
          this.isLoading$.next(false);
        });
    });
  }

  onRemove(index: number): void {
    this.checkoutHosts.splice(index, 1);
  }

  addOne(): void {
    this.checkoutHosts = [this.form.get('host').value, ...this.checkoutHosts];
    this.form.get('host').patchValue('', { emitEvent: false });
  }

  protected onUpdateFormData(formValues: any): void {
    return;
  }

  protected backToModal(): void {
    // TODO pass payments,settings as param somehow
    this.router.navigate(['../../panel-settings'], { relativeTo: this.activatedRoute });
  }

  protected showError(error: string): void {
    const defaultMessage: string = this.translateService.translate('settings.csp.unknownError');
    this.snackBarService.toggle(true, error || defaultMessage, {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private forbiddenHostValidator(hosts: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = hosts.some(host => control.value === host);

      return forbidden ? { forbiddenHost: { value: control.value } } : null;
    };
  }
}
