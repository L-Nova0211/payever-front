import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { MessageBus } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_BLOG_HOST } from '../../constants';

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
    private apiBlog: PebBlogsApi,
    @Inject(PEB_BLOG_HOST) public blogHost: string,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private messageBus: MessageBus,

    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      if (!this.errorMsg) {
        if (this.appData?.accessConfig?.internalDomain !== this.domainConfig.domainName) {
          this.apiBlog.updateBlogAccessConfig(
            this.appData.id,
            { internalDomain: this.domainConfig.domainName }
          ).subscribe((data) => {
            this.appData.onSved$.next({ updateBlogList: true });
            this.overlay.close();
          });
        }
        else {
          this.overlay.close();
        }
      }
    };
  }

  ngOnInit() {
    this.domainConfig.domainName = this.appData.accessConfig?.internalDomain;
    this.domainConfig.creationDate = this.appData.accessConfig?.createdAt;
    this.messageBus.listen('confirm').pipe(take(1))
    .subscribe((confirm) => {
      if (confirm) {
        this.overlay.close();
      }
    });

  }

  validateDomain(evnt) {
    const domainValue=evnt.target.value;
    this.domainConfig.domainName = domainValue;
    if (!this.validateName(domainValue)) {
      if (!domainValue) {
        this.errorMsg = 'Domain can not be empty';
      } else if (domainValue.length < 3) {
        this.errorMsg = 'Domain name should have at least 3 characters';
      } else {
        this.errorMsg = 'Domain name is not correct';
      }

      this.cdr.markForCheck();

      return;

    }

    this.errorMsg = null;
    this.apiBlog.validateBlogName(domainValue).subscribe((data) => {
      if (this.domainConfig.domainName === domainValue) {
        this.errorMsg = data.message ? data.message : null;
        this.cdr.markForCheck();
      }
    });

    this.cdr.markForCheck();
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

}
