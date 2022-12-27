import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PeOverlayWidgetService, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { PeDomainsApiService } from '../../services';

@Component({
  selector: 'pe-personal-domain',
  templateUrl: './personal-domain.component.html',
  styleUrls: ['./personal-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeDomainsPersonalDomainComponent {
  
  public domainList: any[];
  public readonly theme = this.peOverlayConfig.theme;

  public readonly getAllPersonalDomains$ = this.peDomainsApiService
    .getAllDomains()
    .pipe(
      tap((domains) => {
        this.domainList = domains;
        this.cdr.markForCheck();
      }));

  constructor(
    private cdr: ChangeDetectorRef,

    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: OverlayHeaderConfig,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peDomainsApiService: PeDomainsApiService,
  ) {
    const closeEditor = () => {
      this.peOverlayWidgetService.close();
    }

    this.peOverlayConfig.backBtnCallback = closeEditor;
    this.peOverlayConfig.doneBtnCallback = closeEditor;
    this.peOverlayConfig.title = this.translateService.translate('domains-lib.personal_domain.title');
  }

  public addDomain(): void {
    this.peOverlayConfig.onSaveSubject$.next({ connectExisting: true });
  }

  public removeDomain(domain, i): void {
    const domainId = domain.id ?? domain._id;
    this.peDomainsApiService
      .deleteDomain(domainId)
      .pipe(
        tap(() => {
          this.domainList.splice(i, 1);
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }
}
