import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TranslateService } from '@pe/i18n';
// import { PlatformService } from '../../../../common';

@Component({
  selector: 'pe-info-box-confirm',
  templateUrl: 'info-box-confirm.component.html',
  styleUrls: ['info-box-confirm.component.scss'],
})
export class InfoBoxConfirmComponent {

  @Input() blurBackdrop = true;
  @Input() cancelButtonTitle: string = this.translateService.translate('ng_kit.dialog.action_buttons.no');
  @Input() confirmButtonTitle: string = this.translateService.translate('ng_kit.dialog.action_buttons.yes');
  @Input() icon = 'icon-alert-24';
  @Input() title: string;
  @Input() subtitle: string;

  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onConfirm: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    // private platformService: PlatformService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.toggleBlurryBackdrop(true);
  }

  onCancelClick(): void {
    this.toggleBlurryBackdrop(false);
    this.onCancel.emit();
  }

  onConfirmClick(): void {
    this.toggleBlurryBackdrop(false);
    this.onConfirm.emit();
  }

  private toggleBlurryBackdrop(value: boolean): void {
    if (this.blurBackdrop) {
      // this.platformService.blurryBackdrop = value;
    }
  }
}
