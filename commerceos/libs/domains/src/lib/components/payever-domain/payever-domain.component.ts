import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';

import { PeDomainsApiService } from '../../services';
import { PE_PRIMARY_HOST } from '../../tokens';

@Component({
  selector: 'pe-payever-domain',
  templateUrl: './payever-domain.component.html',
  styleUrls: ['./payever-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeDomainsPayeverDomainComponent implements OnInit {
  
  public errorMsg: string;
  public payeverDomainForm = this.formBuilder.group({
    createdAt: [],
    domainName: [],
    provider: [],
  });
  
  public readonly theme = this.peOverlayConfig.theme;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    private peOverlayWidgetService: PeOverlayWidgetService,
    @Inject(PE_PRIMARY_HOST) public primaryHost: string,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peDomainsApiService: PeDomainsApiService,
  ) {
    this.peOverlayConfig.title = this.translateService.translate('domains-lib.payever_domain.title');
  }

  public get domainNameError(): string {
    return this.payeverDomainForm.controls.domainName.errors?.minLengthDomainName
      ? 'domains-lib.errors.min_name_length'
      : 'domains-lib.errors.incorrect_name';
  }

  ngOnInit(): void {
    const { createdAt, internalDomain } = this.peOverlayData;
    const formData = {
      domainName: internalDomain,
      createdAt: createdAt,
      provider: 'payever',
    };
    
    const closeEditor = () => {
      this.peOverlayWidgetService.close();
    };
    
    this.payeverDomainForm.patchValue(formData);
    this.cdr.markForCheck();
    
    const controls = this.payeverDomainForm.controls;
    
    this.peOverlayConfig.backBtnCallback = closeEditor;
    this.peOverlayConfig.doneBtnCallback = () => {
      controls.domainName.setValidators([PeCustomValidators.DomainName()]);
      controls.domainName.updateValueAndValidity();

      if (controls.domainName.valid && !this.errorMsg) {
        if (internalDomain !== controls.domainName.value) {

          this.peOverlayConfig.onSaveSubject$.next({
            payeverDomain: true,
            internalDomain: controls.domainName.value,
          });
        } else {
          closeEditor();
        }
      }
    }
  }

  public validateDomain(domainName): void {
    this.peDomainsApiService
      .validDomain(domainName)
      .pipe(
        tap((data) => {
          this.errorMsg = data.message ? data.message : null;
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }
}
