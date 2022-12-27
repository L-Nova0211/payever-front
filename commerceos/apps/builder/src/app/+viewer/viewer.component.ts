import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, pluck } from 'rxjs/operators';

import { PebShop, PebThemeDetailInterface } from '@pe/builder-core';
import { FontLoaderService } from '@pe/builder-font-loader';
import { ContextBuilder } from '@pe/builder-services';


@Injectable()
export class ViewerLocationStrategy extends HashLocationStrategy {
  prepareExternalUrl(internal: string): string {
    return `${(this as any)._platformLocation.location.pathname}#${internal}`;
  }
}

@Component({
  selector: 'sandbox-viewer-root',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: ViewerLocationStrategy,
    },
  ],
})
export class SandboxViewerComponent {
  readonly type$ = this.route.params.pipe(
    pluck('type'),
  );

  readonly themeCompiled$ = this.route.data.pipe(
    pluck('data'),
    map(v => v as PebShop),
  );

  readonly themeSnapshot$ = this.route.data.pipe(
    pluck('data'),
    map(v => v as PebThemeDetailInterface),
  );

  constructor(
    public route: ActivatedRoute,
    public contextService: ContextBuilder,
    private fontLoaderService: FontLoaderService,
  ) {
    (window as any).viewer = this;
    this.fontLoaderService.renderFontLoader();
  }
}
