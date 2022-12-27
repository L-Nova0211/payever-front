import { Component, Injector, OnInit } from '@angular/core';

import { testingPanel } from '../../../panels-info-data';
import { StorageService } from '../../../services/storage.service';
import { BaseSettingsComponent } from '../base-settings.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'testing-mode',
  templateUrl: './testing-mode.component.html',
  styleUrls: ['./testing-mode.component.scss'],
})
export class TestingModeComponent extends BaseSettingsComponent implements OnInit {

  testingPanel;

  constructor(injector: Injector,
              private storageService: StorageService) {
    super(injector);
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] ||
      this.activatedRoute.parent.snapshot.params['checkoutUuid'] ||
      this.activatedRoute.parent.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit() {
    super.ngOnInit();
    // this.storageService.fetchAllCheckoutsData().subscribe();
    this.testingPanel = testingPanel;
  }

  goBack() {
    const businessUuid: string = this.storageService.businessUuid;
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((checkout) => {
      if (this.isModal) {
        this.backToModal();
      } else {
        this.router.navigate([`business/${businessUuid}/checkout/${checkout._id}/panel-settings`]);
      }
    }, (err) => {
      this.showError(err.message);
    });
  }
}
