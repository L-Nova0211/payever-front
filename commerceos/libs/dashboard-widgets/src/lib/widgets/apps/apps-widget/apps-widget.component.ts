import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { EMPTY, Observable } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { DockerItemInterface, DockerState } from '@pe/docker';
import { AppSetUpStatusEnum, Widget } from '@pe/widgets';

import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'apps-widget',
  templateUrl: './apps-widget.component.html',
  styleUrls: ['./apps-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsWidgetComponent extends AbstractWidgetComponent implements OnInit {
  @Select(DockerState.dockerItems) dockerItems$: Observable<DockerItemInterface[]>;

  @Input() widget: Widget;

  protected appName = '';

  constructor(injector: Injector, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit() {
    this.dockerItems$
      .pipe(
        filter(a => !!a),
        map(a => a.filter((micro: any) => micro.installed && micro.code !== 'dashboard')),
        tap((visibleApps: any) => {
          this.widget.data = [
            ...visibleApps.map(app => ({
              code: app.code,
              icon: app.icon,
              title: app.title,
              loading: false,
              notProcessLoading: true,
              onSelect: (data) => {
                if (data.setupStatus !== AppSetUpStatusEnum.Completed) {
                  this.route.snapshot.data = { isWelcome: true };
                }
                app.onSelect(data);

                return EMPTY;
              },
            })),
          ];
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.loaderService.appLoading$
      .pipe(
        tap((appLoading) => {
          this.widget.data.forEach((app) => {
            app.loading = app.code === appLoading;
          });
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
