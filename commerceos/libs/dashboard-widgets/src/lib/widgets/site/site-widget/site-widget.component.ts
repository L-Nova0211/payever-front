import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { EMPTY, Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { SiteInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'site-widget',
  templateUrl: './site-widget.component.html',
  styleUrls: ['./site-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  readonly appName: string = 'site';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,
    protected wallpaperService: WallpaperService,

  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SITE_DATA);
  }

  ngOnInit(): void {
    this.editWidgetsService.defaultSiteSubject$.pipe(
      tap((site: SiteInterface) => {
        this.widget = {
          ...this.widget,
          data: [
            {
              title: site?.siteName,
              isButton: false,
              imgSrc: site?.siteLogo,
            },
            {
              title: 'widgets.site.actions.edit-site',
              isButton: true,
              onSelect: () => this.openSite(site?.siteId),
            },
          ],
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.appUrlPath = `${this.appName}/${site?.siteId}/dashboard`;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe()
  }

  openSite(siteId?: string): Observable<any> {
    this.router.navigate(['business', this.businessData._id, 'site', siteId, 'edit']);

    return EMPTY;
  }
}
