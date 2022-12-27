import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { MessageBus } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';


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
    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private messageBus: MessageBus,
  ) {
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    }

  }

  ngOnInit() {
    this.isloading = true;
    this.apiBlog.getAllDomains(this.appData.id).subscribe((domains) => {
      this.domainList = domains;
      this.isloading = false;
      this.cdr.markForCheck();

    })
    this.messageBus.listen('confirm').pipe(take(1))
    .subscribe((confirm) => {
      if (confirm) {
        this.overlay.close();
      }
    });
  }

  removeDomain(domain, i) {
    this.apiBlog.deleteDomain(this.appData.id, domain.id ?? domain._id).subscribe((data) => {
      this.domainList.splice(i, 1);
      this.cdr.markForCheck();
    })
  }

  addDomain() {
    this.overlay.close();
    this.appData.onSved$.next({ connectExisting: true });
  }
}
