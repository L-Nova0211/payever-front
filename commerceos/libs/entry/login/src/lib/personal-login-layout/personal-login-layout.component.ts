import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, first, switchMap } from 'rxjs/operators';

import { PartnerService } from '@pe/api';
import { entryLogo } from '@pe/base';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'pe-personal-login-layout',
  templateUrl: './personal-login-layout.component.html',
  styleUrls: ['./personal-login-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePersonalLoginLayoutComponent implements OnInit {

  @Input() withoutForgot: boolean;
  @Input() withoutRegister: boolean;

  @Output() successLoginOn = new EventEmitter<void>();
  @Output() secondFactorCodeOn = new EventEmitter<void>();
  @Output() registerOn = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private partnerService: PartnerService,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('redirect_uri', '');

    this.route.queryParams.subscribe((params) => {
      if (params.redirect_uri !== undefined) {
        localStorage.setItem('redirect_uri', JSON.stringify(params.redirect_uri));
      }
    });

    this.route.data.pipe(
      first(),
      filter(response => !!response.partner),
      switchMap(({ partner }) => {
        this.partnerService.partnerData = partner;

        return this.partnerService.partnerAfterActions.pipe(
          switchMap(data => this.partnerService.runAfterActions(
            partner.afterLogin,
            data.id,
            partner.name,
            data.re
          )),
        );
      }),
    ).subscribe();
  }

  onSuccessLogin(): void {
    //@TODO remove when new settings app will be ready
    localStorage.removeItem('pe_opened_business');
    localStorage.removeItem('pe_active_business');
    localStorage.removeItem('pe_user_email');

    this.successLoginOn.emit();
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.route.snapshot?.params.industry;
    const icon = `#icon-industries-${industry}`;

    if (industry) {
      (window as any).PayeverStatic.IconLoader.loadIcons(['industries']);
    }

    return industry ? { icon, height: 30 } : entryLogo;
  }
}
