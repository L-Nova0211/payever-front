import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'store-info',
  templateUrl: './store-info.component.html',
  styleUrls: ['./store-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreInfoComponent {
  @Input() title: string;

  @Input() set logo(url: string) {
    if (url) {
      this.logoUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      this.isShowLogo = true;
    } else {
      this.isShowLogo = false;
    }
  }

  @Input() showEditButtonSpinner: boolean;
  @Input() isShowEditButton = true;
  @Output() onEdit: EventEmitter<any> = new EventEmitter();

  @ViewChild('logo') logoEl: ElementRef;
  @ViewChild('logoWrapper') logoWrapperEl: ElementRef;

  logoUrl: SafeUrl;
  isShowLogo: boolean;
  isLargeThenParent = false;

  constructor(private sanitizer: DomSanitizer) {}

  onLoad() {
    const logo: HTMLImageElement = this.logoEl.nativeElement;
    const logoWrapper: HTMLImageElement = this.logoWrapperEl.nativeElement;
    if (logo.width >= logoWrapper.clientWidth || logo.height >= logoWrapper.clientHeight) {
      this.isLargeThenParent = true;
    }
  }
}
