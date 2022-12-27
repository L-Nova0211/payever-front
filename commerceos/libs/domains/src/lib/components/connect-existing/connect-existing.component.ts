import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';

import { PeDomainsApiService } from '../../services';

@Component({
  selector: 'pe-connect-existing-domain',
  templateUrl: './connect-existing.component.html',
  styleUrls: ['./connect-existing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeDomainsConnectExistingDomainComponent {
  private domainId: string;

  public errorMsg$ = new BehaviorSubject<string>(null);
  public step = 1;
  public existingDomainForm: FormGroup = this.formBuilder.group({
    currentIp: [],
    currentCname: [],
    domainName: [''],
    isConnected: [true],
    requiredIp: [],
    requiredCname: [],
  });

  public readonly theme = this.peOverlayConfig.theme;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,

    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: OverlayHeaderConfig,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peDomainsApiService: PeDomainsApiService,
  ) {
    const closeEditor = () => {
      this.peOverlayWidgetService.close();
    };
    this.peOverlayConfig.backBtnTitle = this.translateService.translate('domains-lib.actions.cancel'),
    this.peOverlayConfig.doneBtnTitle = this.translateService.translate('domains-lib.actions.done'),
    this.peOverlayConfig.backBtnCallback = closeEditor;
    this.peOverlayConfig.doneBtnCallback = this.domainId
      ? this.connect
      : closeEditor;
    this.peOverlayConfig.title = this.translateService.translate('domains-lib.existing_domain.title');
  }

  public get domainNameError(): string {
    return this.existingDomainForm.controls.domainName.errors?.minLengthDomainName
      ? 'domains-lib.errors.min_name_length'
      : 'domains-lib.errors.incorrect_name';
  }

  public connect = () => {
    this.peOverlayConfig.onSaveSubject$.next({ personalDomain: true });
  }

  public getFields(info): string {
    const { currentIp, requiredIp, currentCname, requiredCname } = info;
    const isRecordA = currentIp === requiredIp;
    const isCname = currentCname === requiredCname;

    const ampersand = !isRecordA && !isCname ? '& ' : '';
    const record_a = !isRecordA ? 'A ' : '';
    const cname = !isCname ? 'CNAME ' : '';

    return record_a + ampersand + cname;
  }

  public verifyDomain(): void {
    const controls = this.existingDomainForm.controls;
    controls.domainName.setValidators([PeCustomValidators.DomainName(true)]);
    controls.domainName.updateValueAndValidity();

    if (controls.domainName.valid) {
      this.peDomainsApiService
        .addDomain(controls.domainName.value)
        .pipe(
          switchMap((domain) => {
            const domainId = domain.id ?? domain._id;
            this.domainId = domainId;

            return this.peDomainsApiService
              .checkDomain(domainId);
          }),
          tap((domain) => {
            this.step = 2;
            this.existingDomainForm.patchValue(domain);
            this.cdr.markForCheck();
          }),
          catchError((error) => {
            this.errorMsg$.next(error?.message);

            return of(true);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }    
  }
}
