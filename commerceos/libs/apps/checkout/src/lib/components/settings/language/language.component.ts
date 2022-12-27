import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, merge, Observable, ReplaySubject } from 'rxjs';
import { filter, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { CheckoutSettingsInterface, LanguageInterface } from '../../../interfaces';
import { RootCheckoutWrapperService, StorageService } from '../../../services';
import { BaseSettingsComponent } from '../base-settings.component';

@Component({
  selector: 'checkout-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageComponent extends BaseSettingsComponent implements OnInit {

  languagePanel: LanguageInterface[];
  checkoutUuid = this.overlayData.checkoutUuid;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  hasDefault$ = new ReplaySubject<boolean>(1);

  onSave$: Observable<any> = this.overlayData.onSave$.pipe(
    withLatestFrom(this.hasDefault$),
    filter(([_, hasDefault]) => hasDefault),
    tap(() => {
      this.goBack();
    }),
  );

  onClose$: Observable<any> = this.overlayData.onClose$.pipe(
    filter(() => !!this.languagePanel),
    tap(() => {
      this.overlayData.close();
    }),
  );

  constructor(
    injector: Injector,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any
  ) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();

    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();

    merge(
      this.onClose$,
      this.onSave$,
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    this.parseLanguages();
  }

  setDefaultLanguage(languageDefault: LanguageInterface) {
    this.languagePanel.map((language) => {
      if (language.isDefault) {
        language.isDefault = false;
      }
    });
    languageDefault.isDefault = true;
    languageDefault.active = true;
    this.hasDefault$.next(true);
  }

  goBack() {
    // TODO Saving on Back is not good idea
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      const newSettings: CheckoutSettingsInterface = { ...currentCheckout.settings, languages: this.languagePanel };
      this.isLoading$.next(true);

      this.storageService.saveCheckoutSettings(currentCheckout._id, newSettings)
        .subscribe(() => {
          this.wrapperService.onSettingsUpdated();
          this.isLoading$.next(false);
          this.overlayData.close();
        }, (err) => {
          this.showError(err.message || 'Not possible to save languages! Unknown error!');
          this.isLoading$.next(false);
        });
    });
  }

  toggleClick(item) {
    const active = this.languagePanel.find(language => language.active === true);
    this.languagePanel.map((language) => {
      if (language.name === item) {
        language.active = !language.active;
        language.isDefault = !active;
      }
    });
    this.checkDefault();
  }

  private checkDefault(): void {
    this.hasDefault$.next(!!this.languagePanel?.find(l => l.isDefault));
  }

  private parseLanguages(): void {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      const languages = cloneDeep(currentCheckout.settings.languages);
      languages.forEach((language) => {
        language.isToggleButton = true;
        language.isHovered = false;
      });
      this.languagePanel = languages;
      this.checkDefault();
    }, (err) => {
      this.showError(err.message);
    });
  }
}
