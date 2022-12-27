import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_POS_HOST } from '../../constants/constants';
import { PosApi } from '../../services/pos/abstract.pos.api';


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
  };

  constructor(
    private apiPos: PosApi,
    @Inject(PEB_POS_HOST) public posHost: string,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,

    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      if (!this.errorMsg) {
        if (this.appData?.accessConfig?.internalDomain !== this.domainConfig.domainName) {
          this.apiPos.updatePosAccessConfig(
            this.appData._id,
            { internalDomain: this.domainConfig.domainName },
          ).subscribe(() => {
            this.appData.onSved$.next({ updatePosList: true });
            this.overlay.close();
          });
        } else {
          this.overlay.close();
        }
      }
    };
  }

  ngOnInit() {
    this.domainConfig.domainName = this.appData.accessConfig?.internalDomain;
    this.domainConfig.creationDate = this.appData.accessConfig?.createdAt;
  }

  validateDomain(value: string) {
    this.domainConfig.domainName = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Domain name should have at least 3 characters' : 'Domain name is not correct';
      this.cdr.markForCheck();

      return;

    }
    this.apiPos.validatePosName(value).subscribe((data: any) => {
      this.errorMsg = data.message ? data.message : null;
      this.cdr.markForCheck();
    });

    if (!value) {this.errorMsg = 'Domain can not be empty';}
    this.cdr.markForCheck();
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

}
