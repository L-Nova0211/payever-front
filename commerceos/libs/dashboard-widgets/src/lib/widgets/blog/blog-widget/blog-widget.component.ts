import { Component, Injector, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BlogInterface } from '@pe/dashboard-widgets';
import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'blog-widget',
  templateUrl: './blog-widget.component.html',
  styleUrls: ['./blog-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'blog';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService:EditWidgetsService,
    protected wallpaperService: WallpaperService,
  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_BLOGS);
  }

  ngOnInit(): void {

    this.editWidgetsService.blogSubject$.pipe(
      takeUntil(this.destroyed$),
      tap((data : BlogInterface[]) => {
        this.widget = {
          ...this.widget,
          data: data,
          openButtonFn: () => {
            this.router.navigate(['business',this.businessData._id,'blog',data[0]._id]).then(() => {
              this.wallpaperService.showDashboardBackground(false);
            });

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }
}
