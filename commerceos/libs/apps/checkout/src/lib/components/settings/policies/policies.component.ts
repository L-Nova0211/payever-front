import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { StorePosListInterface } from '../../../interfaces';
import { StorageService } from '../../../services';
import { BaseSettingsComponent } from '../base-settings.component';

@Component({
  selector: 'checkout-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PoliciesComponent extends BaseSettingsComponent implements OnInit {

  channelSetsList: StorePosListInterface[] = null;
  checkoutUuid = this.overlayData.checkoutUuid;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));

  constructor(
    injector: Injector,
    private storageService: StorageService,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
    super(injector);
  }

  ngOnInit() {
    this.onSave$.subscribe(() => {
      if (this.channelSetsList) {
        this.overlayData.close();
      }
    });

    this.onClose$.subscribe(() => {
      if (this.channelSetsList) {
        this.overlayData.close();
      }
    });

    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      this.storageService.getChannelSetsForCheckoutOnce(this.checkoutUuid).subscribe((channelSets) => {
        this.channelSetsList = [];
        channelSets.map((channelSet) => {
          // if (['shop', 'pos'].indexOf(channelSet.type) >= 0) {
          this.channelSetsList.push({
            id: channelSet.id,
            name: channelSet.name || this.translateService.translate(`channelSetDefaultNames.${channelSet.type}`),
            isToggled: true,
            active: channelSet.policyEnabled,
          });

          // }
          return channelSet;
        });
      });
    });
  }

  onChangeToggle(element: StorePosListInterface) {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      element.active = !element.active;
      this.storageService.patchChannelSet(element.id, element.active).subscribe(
        () => {
        },
        (err) => {
          this.showError(err ? this.translateService.translate(err.message) :
          'Not possible to save policies! Unknown error!');
          element.active = !element.active;
        }
      );
    });
  }

  goBack() {
    this.router.navigate(['../../panel-settings'], { relativeTo: this.activatedRoute });
  }
}
