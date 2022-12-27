import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PEB_SHOP_HOST } from '../../constants';
import { PebShopsApi } from '../../services/abstract.shops.api';


@Component({
  selector: 'peb-payever-domain',
  templateUrl: './payever-domain.component.html',
  styleUrls: ['./payever-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPayeverDomainComponent implements OnInit {

  errorMsg: string;

  domainConfig = {
    domainName: '',
    provider: 'payever',
    creationDate: '10/01/2020',
  }

  constructor(
    private apiShop: PebShopsApi,
    @Inject(PEB_SHOP_HOST) public shopHost: string,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,

    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      if (!this.errorMsg) {
        if (this.appData.accessConfig.internalDomain !== this.domainConfig.domainName) {
          this.apiShop.updateShopAccessConfig(this.appData.id, { internalDomain: this.domainConfig.domainName })
            .subscribe((data) => {
              this.appData.onSaved$.next({ updateShopList: true });
              this.overlay.close();
            });
        }
        else {
          this.overlay.close();
        }
      }
    }
  }

  ngOnInit() {
    this.domainConfig.domainName = this.appData.accessConfig.internalDomain;
    this.domainConfig.creationDate = this.appData.accessConfig.createdAt;
  }

  validateDomain(event) {
    const value = event.target.value;
    this.domainConfig.domainName = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Domain should have at least 3 characters' : 'Domain name is not correct';
      this.cdr.markForCheck();

      return;

    }
    this.apiShop.validateShopName(value).subscribe((data) => {
      this.errorMsg = data.message ? data.message : null;
      this.cdr.markForCheck();
    })
    if (!value) {this.errorMsg = 'Domain can not be empty';}
    this.cdr.markForCheck();
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

}
