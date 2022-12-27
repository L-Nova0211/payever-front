import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep, orderBy } from 'lodash-es';
import { combineLatest, Subscription } from 'rxjs';

import { TranslateService } from '@pe/i18n';

import { SectionInterface } from '../../interfaces';
import { RootCheckoutWrapperService, StorageService } from '../../services';


@Component({
  selector: 'checkout-sections-modal',
  templateUrl: 'sections.component.html',
  styleUrls: ['sections.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SectionsModalComponent implements OnInit { // TODO Cleanup

  @Input() withHeader = true;

  sectionsAccordionOpened = true;
  disabledSectionsStep: number;

  stepsFirst: SectionInterface[] = [];
  stepsFirstDisabled: SectionInterface[] = [];
  stepsSecond: SectionInterface[] = [];
  stepsSecondDisabled: SectionInterface[] = [];

  enabledSections: SectionInterface[];
  disabledSections: SectionInterface[];

  theme: string;
  isSubmitting = false;

  private lastSaveSub: Subscription = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private wrapperService: RootCheckoutWrapperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storageService: StorageService,
    private translateService: TranslateService,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
      || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.initSections();
    this.storageService.getBusiness()
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
          ? business.themeSettings.theme : 'dark';
      });
  }

  onClose(): void { // TODO Not needed anymore
    // this.router.navigate(['../../../current'], { relativeTo: this.activatedRoute });
  }

  onDisableSection(section: any, step: number) {
    section.enabled = false;
    if (step === 1) {
      this.stepsFirst = this.stepsFirst.filter((itemSection: SectionInterface) => {
        return section.code !== itemSection.code;
      });
      this.stepsFirstDisabled.push(section);
    } else {
      this.stepsSecond = this.stepsSecond.filter((itemSection: SectionInterface) => {
        return section.code !== itemSection.code;
      });
      this.stepsSecondDisabled.push(section);
    }

    this.updateSections();
  }

  onEnableSection(section: any, step: number) {
    section.enabled = false;
    if (step === 1) {
      this.stepsFirstDisabled = this.stepsFirstDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsFirst.push(section);
    } else {
      this.stepsSecondDisabled = this.stepsSecondDisabled.filter((itemSection: any) => {
        return section.code !== itemSection.code;
      });
      this.stepsSecond.push(section);
    }

    this.onShowDisabledSections(this.disabledSectionsStep);
    this.updateSections();
  }

  onShowDisabledSections(step: number): void {
    this.disabledSectionsStep = this.disabledSectionsStep === step ? null : step;
    this.sectionsAccordionOpened = false;
  }

  updateSections(): void {
    this.isSubmitting = true;
    // this.storageService.getCurrentCheckoutOnce().subscribe(defaultCheckout => {
    const sections = this.sections;
    for (let i = 0; i < sections.length; i++) {
      sections[i].order = i;
    }

    this.lastSaveSub?.unsubscribe();
    this.lastSaveSub = this.storageService.saveCheckoutSections(this.checkoutUuid, sections)
      .subscribe(() => {
        this.wrapperService.onSettingsUpdated();
        this.onClose();
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }, (err) => {
        this.storageService.showError(err);
        // this.showError(this.translateService.translate('sections.errors.update'));
        this.isSubmitting = false;
        this.cdr.detectChanges();
      });
  }

  dropSection(event: CdkDragDrop<any[]>, sectionsParam: SectionInterface[]) {
    const prev = Number(event.previousIndex);
    const curr = Number(event.currentIndex);
    const sections = sectionsParam.map(s => cloneDeep(s));
    moveItemInArray(sections, prev, curr);
    sections.forEach((section, idx) => section.order = idx + 1);
    sections.sort((a, b) => a.order - b.order);

    const checkPaymentsStep = this.checkPaymentsStep(sections);
    if (checkPaymentsStep !== true) {
      this.showError(checkPaymentsStep);
      this.cdr.detectChanges();
    } else {
      sectionsParam.length = 0;
      sections.forEach(s => sectionsParam.push(s));
      this.updateSections();
    }
  }

  private checkPaymentsStep(sections: SectionInterface[]): true | string {
    const coupons = sections.find(s => s.code === 'coupons');
    const choosePayment = sections.find(s => s.code === 'choosePayment');
    const payment = sections.find(s => s.code === 'payment');

    if (coupons?.order > choosePayment?.order) {
      return this.translateService.translate('sections.errors.couponsMustBeBeforePayments');
    } else if (choosePayment?.order > payment?.order) {
      return this.translateService.translate('sections.errors.choosePaymentBeforePayments');
    }

    return true;
  }

  private get sections(): any[] {
    const enabledSections: any[] = this.stepsFirst
      .concat(this.stepsSecond)
      .map((section: any) => {
        section = cloneDeep(section);
        section.enabled = true;

        return section;
      });
    const disabledSections: any[] = this.stepsFirstDisabled
      .concat(this.stepsSecondDisabled)
      .map((section: any) => {
        section = cloneDeep(section);
        section.enabled = false;

        return section;
      });

    return enabledSections.concat(disabledSections);
  }

  private initSections(): void {
    combineLatest([
      this.storageService.getCheckoutByIdOnce(this.checkoutUuid),
      this.storageService.getCheckoutSectionsAvailable(this.checkoutUuid),
    ])
      .subscribe(([currentCheckout, sectionsAvailable]) => {
        let sections: SectionInterface[] = sectionsAvailable.map((x) => {
          const checkoutSection = currentCheckout.sections.find(cs => x.code === cs.code);

          return {
            ...x,
            enabled: checkoutSection ? checkoutSection.enabled : x.defaultEnabled,
            order: checkoutSection ? checkoutSection.order : x.order,
            excluded_channels: [],
          };
        });

        sections = orderBy(sections, ['order']);

        this.stepsFirst = sections
          .filter((section: SectionInterface) => section.enabled)
          .filter((section: SectionInterface) => section.code === 'order' || section.code === 'send_to_device');
        this.stepsFirstDisabled = sections
          .filter((section: SectionInterface) => !section.enabled)
          .filter((section: SectionInterface) => section.code === 'send_to_device');
        this.stepsSecond = sections
          .filter((section: SectionInterface) => section.enabled)
          .filter((section: SectionInterface) => {
            return section.code === 'user'
                || section.code === 'address'
                || section.code === 'shipping'
                || section.code === 'choosePayment'
                || section.code === 'payment'
                || section.code === 'coupons';
          });
        this.stepsSecondDisabled = sections
          .filter((section: SectionInterface) => !section.enabled)
          .filter((section: SectionInterface) => {
            return section.code === 'user'
                || section.code === 'address'
                || section.code === 'shipping'
                || section.code === 'coupons';
          });
        this.cdr.detectChanges();
      }, () => {
        this.showError(this.translateService.translate('sections.errors.get'));
      });
  }

  private showError(error: string): void {
    this.storageService.showError(error);
  }

}
