import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { DomainProvider, PAYEVER_DOMAIN_REGX, PEB_SITE_HOST } from '../../constants';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-payever-domain',
  templateUrl: './payever-domain.component.html',
  styleUrls: ['./payever-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[DatePipe],
})
export class PeSettingsPayeverDomainComponent implements OnInit {
  domainConfig: FormGroup;
  errors = {
    domainName: {
      hasError: false,
      errorMessage: '',
    },
  };

  constructor(
    private apiSite: PebSitesApi,
    @Inject(PEB_SITE_HOST) public siteHost: string,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.domainConfig = this.formBuilder.group({
      domainName: ['', [Validators.required, Validators.pattern(PAYEVER_DOMAIN_REGX)]],
      provider: [null],
      creationDate: [null],
    });

    this.config.doneBtnCallback = () => {
      if (
        this.domainConfig.valid &&
        this.appData.accessConfig.internalDomain !== this.domainConfig.controls.domainName.value
      ) {
        this.apiSite
          .updateSiteAccessConfig(this.appData.id, { internalDomain: this.domainConfig.controls.domainName.value })
          .subscribe((data) => {
            this.appData.onSaved$.next({ updateSiteList: true });
            this.overlay.close();
          });
      } else {
        this.overlay.close();
      }
    };
  }

  ngOnInit() {
    this.domainConfig.patchValue({
      domainName: this.appData.accessConfig.internalDomain,
      creationDate: this.datePipe.transform(this.appData.accessConfig.createdAt),
      provider: DomainProvider.DEFAULT,
    });
  }

  checkErrors(field) {
    const form = this.domainConfig.get(field);
    if (form.invalid) {
      this.errors[field].hasError = true;
      if (form.errors.required) {
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.required');
      }

      this.changeDetectorRef.detectChanges();
    }
  }

  resetErrors(field) {
    this.errors[field].hasError = false;
  }
}
