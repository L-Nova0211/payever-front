import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-personal-domain',
  templateUrl: './personal-domain.component.html',
  styleUrls: ['./personal-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPersonalDomainComponent implements OnInit {
  isloading;
  domainList: any[];

  constructor(
    private apiSite: PebSitesApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    }
  }

  ngOnInit() {
    this.isloading = true;
    this.apiSite.getAllDomains(this.appData.id).subscribe((domains) => {
      this.domainList = domains;
      this.isloading = false;
      this.cdr.markForCheck();
    })
  }

  removeDomain(domain, i) {
    this.apiSite.deleteDomain(this.appData.id, domain._id).subscribe((data) => {
      this.domainList.splice(i, 1);
      this.cdr.markForCheck();
    })
  }

  addDomain() {
    this.overlay.close();
    this.appData.onSaved$.next({ connectExisting: true });
  }
}
