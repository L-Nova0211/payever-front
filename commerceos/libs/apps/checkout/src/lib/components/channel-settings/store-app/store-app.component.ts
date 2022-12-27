import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { StorePosListInterface } from '../../../interfaces';
import { StorageService } from '../../../services';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'shop-app',
  templateUrl: './store-app.component.html',
  styleUrls: ['./store-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StoreAppComponent implements OnInit, OnDestroy { // TODO Rename to ShopAppComponent

  storeList: StorePosListInterface[];
  checkoutUuid = this.overlayData.checkoutUuid;

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
  }

  ngOnInit() {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      this.storageService.getChannelSetsOnce().subscribe((channelSets) => {
        this.storeList = [];
        channelSets.map((channelSet) => {
          if (channelSet.type === 'shop') {
            this.storeList.push({
              id: channelSet.id,
              name: channelSet.name || '---',
              isToggled: true,
              active: channelSet.checkout === currentCheckout._id,
            });
          }

          return channelSet;
        });
      });
    });
  }

  onChangeToggle(element: StorePosListInterface) {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      element.active = !element.active;
      this.storageService.attachChannelSetToCheckout(
        element.id, element.active ? currentCheckout._id : null
      ).subscribe();
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}
