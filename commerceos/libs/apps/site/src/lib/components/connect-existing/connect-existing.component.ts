import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractComponent } from '@pe/base';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { DOMAIN_REGX } from '../../constants';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-connect-existing',
  templateUrl: './connect-existing.component.html',
  styleUrls: ['./connect-existing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsConnectExistingComponent extends AbstractComponent {
  isConnected: boolean;
  errorMsg: string;
  step = 1;

  domainInfo: FormGroup;

  errors = {
    domainName: {
      hasError: false,
      errorMessage: null,
    },
    domainId: {
      hasError: false,
      errorMessage: null,
    },
    currentIp: {
      hasError: false,
      errorMessage: null,
    },
    requiredIp: {
      hasError: false,
      errorMessage: null,
    },
    currentValue: {
      hasError: false,
      errorMessage: null,
    },
    requiredValue: {
      hasError: false,
      errorMessage: null,
    },
  };

  get messageColor() {
    return this.isConnected ? 'confirm' : 'warning';
  }

  get message() {
    if (this.isConnected) {
      return this.translateService.translate('site-app.messages.domain_connected');
    }

    return this.getfields(this.domainInfo) + this.translateService.translate('site-app.messages.incorrect_domain');
  }

  constructor(
    private apiSite: PebSitesApi,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
  ) {

    super();

    this.domainInfo = this.formBuilder.group({
      domainName: [null, [Validators.required, Validators.pattern(DOMAIN_REGX)]],
      domainId: [null],
      currentIp: [null],
      requiredIp: [null],
      currentValue: [null],
      requiredValue: [null],
    });

    this.config.doneBtnCallback = () => {
      this.resetDomain();
    };

    appData.closeEvent.pipe(
      filter((v: boolean) => !!v),
      tap(_ => this.resetDomain()),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private resetDomain() {
    if (this.domainInfo.controls.domainId.invalid || this.isConnected) {
      this.overlay.close();

      return;
    }
    this.apiSite
      .deleteDomain(this.appData.id, this.domainInfo.controls.domainId.value)
      .pipe(
        tap(_ => this.overlay.close()),
        takeUntil(this.destroyed$)
      ).subscribe();
  }

  verify() {
    if (this.domainInfo.controls.domainId.invalid) {
      return;
    }
    this.apiSite
      .addDomain(this.appData.id, this.domainInfo.controls.domainName.value)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((data) => {
          this.domainInfo.controls.domainId.patchValue(data._id);

          return this.apiSite.checkDomain(this.appData.id, data._id);
        }),
      )
      .subscribe(
        (info) => {
          this.step = 2;
          this.domainInfo.patchValue({
            currentIp: info.currentIp,
            requiredIp: info.requiredIp,
            currentValue: info.currentCname,
            requiredValue: info.requiredCname,
          });

          this.isConnected = info.isConnected;
          this.cdr.detectChanges();
        },
        (error) => {
          this.errorMsg = error.error.message;
          this.cdr.detectChanges();
        },
      );
  }

  connect() {
    this.overlay.close();
  }

  getfields(info) {
    let fields = '';
    if (info.currentIp !== info.requiredIp) {
      fields = fields + 'A ';
    }
    info.currentValue !== info.requiredValue
      ? fields.length
        ? (fields = fields + '& CNAME')
        : (fields = fields + 'CNAME')
      : null;

    return fields;
  }

  checkErrors(field) {
    const form = this.domainInfo.get(field);
    if (form.invalid) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      this.cdr.detectChanges();
    }
  }

  resetErrors(field) {
    this.errors[field].hasError = false;
  }
}
