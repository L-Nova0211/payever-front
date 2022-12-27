import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ICONS } from '../../constants';
import { PeCouponsApiService } from '../../services';

@Component({
  selector: 'pe-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeCouponsComponent implements OnInit {
  
  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private router: Router,

    private peCouponsApiService: PeCouponsApiService,
  ) { }

  ngOnInit(): void {
    this.getBusinessId();
    this.initIcons();
  }
  
  private getBusinessId(): void {
    const url = this.router.url.split('/');
    const index = url.indexOf('business');
    this.peCouponsApiService.businessId = url[index + 1];
  }
  
  private initIcons(): void {
    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }
}
