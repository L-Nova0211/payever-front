import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable()
export class BackRoutingService {
  private routes: string[] = [];
  private handled = false;

  private get prevUrl(): string | null {
    return this.handled && this.routes[1] || null;
  }

  constructor(
    private router: Router,
    private location: Location,
  ) {}

  handle(): void {
    this.router.events
      .pipe(filter(evt => evt instanceof NavigationEnd))
      .subscribe(
        (evt: NavigationEnd) => this.routes.unshift(evt.url)
      );
    this.handled = true;
  }

  back(activatedRoute: ActivatedRoute): void {
    if (!this.handled) {
      // tslint:disable-next-line no-console
      console.warn('Please call BackRoutingService#handle() on app root module initialization');
    }

    if (this.prevUrl) {
      if (this.prevUrl.indexOf(';') >= 0) {
        // TODO This is durty hack, but have no time to understand idea of these redirects logic
        // /business/7ad407e4-b832-481a-a737-01166a81fb03/settings/wallpaper;activeView=myWallpapers
        //  -->
        // /business/7ad407e4-b832-481a-a737-01166a81fb03/settings
        const settingsRoute = this.prevUrl.split('/').slice(0, 4).join('/');
        this.router.navigate([settingsRoute]);
      } else {
        this.router.navigate([this.prevUrl]);
      }
    } else {
      // this.router.navigate(['..'], { relativeTo: activatedRoute });

      // Fallback via History API
      this.location.back();
    }
  }
}
