import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { EMPTY } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppSetUpStatusEnum, MicroAppInterface } from '@pe/common';
import { StudioMedia } from '@pe/dashboard-widgets';
import { TranslateService } from '@pe/i18n';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'studio-widget',
  templateUrl: './studio-widget.component.html',
  styleUrls: ['./studio-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudioWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Input() widget: Widget;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  readonly studioAppUrl: string = 'widgets.studio.url';
  readonly appName: string = 'studio';
  iconUrl: string;
  installIconUrl: string;
  lastUserMedia = [
    {
      image: 'https://media.graphcms.com/resize=w:1355,h:563,fit:crop/output=format:webp/compress/KUgZm8MXTDS8A1fgIz9u',
    },
    {
      image: 'https://media.graphcms.com/resize=w:1355,h:563,fit:crop/output=format:webp/compress/KUgZm8MXTDS8A1fgIz9u',
    },
    {
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSCXABpWh-p3uzmrKOA-l_XgfIG7lU4aaVpFg&usqp=CAU',
    },
    {
      image:
        'https://www.stevens.edu/sites/stevens_edu/files/styles/news_detail/public/shutterstock_1165123768.jpg?itok=haoBDwhQ',
    },
  ];

  constructor(
    injector: Injector,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private editWidgetsService: EditWidgetsService,
    protected envService: CosEnvService,
  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_STUDIO_APP_LAST);
  }

  ngOnInit(): void {
    this.showSpinner$.next(false);
    this.editWidgetsService.mediaSubject$
      .pipe(
        filter((items: any) => !!items.length),
        tap((items: any) => {
          this.widget.data = items.map((media: StudioMedia) => ({
            title: media.name,
            subtitle: '',
            imgSrc: this.sanitizer.bypassSecurityTrustStyle(`url('${media.url}')`),
            onSelect: () => {
              this.onOpenButtonClick();

              return EMPTY;
            },
            onSelectData: media,
          }));
          this.cdr.detectChanges();
          this.widget.openButtonFn = () => {
            this.onOpenButtonClick();

            return EMPTY;
          };
        }),
      )
      .subscribe();

    // first check when the application is on the list
    // this.widget.onInstallAppClick = () => {
    //   this.router.navigate([`business/${this.businessData._id}/studio`]);
    //   return EMPTY;
    // };
  }

  onOpenStudioClick(): void {
    window.open(this.translateService.translate(this.studioAppUrl), '_blank');
  }

  onOpenClick() {
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig('studio') as MicroAppInterface;
    if (micro && micro.setupStatus === AppSetUpStatusEnum.Completed) {
      this.appLauncherService.launchApp('studio').subscribe();
    } else {
      const url = `business/${this.businessData._id}/welcome/studio`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }
}
