import {
  Component,
  ChangeDetectionStrategy,

  Input,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WallpaperService } from '@pe/wallpaper';


import { entryLogo } from '@pe/base';
import { take, tap } from 'rxjs/operators';
@Component({
  selector: 'entry-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class LayoutComponent implements OnInit {

  @Input() hideLogo: boolean;
  @Input() hideLanguageSwitcher: boolean = false;

  logo: any;

  @Input('entryLogo')
  set Color(logo) {
    this.logo = logo || entryLogo;
  };

  readonly allowedLocales = ['en', 'de', 'no', 'da', 'sv'];

  isEntryLayoutRegisterClass: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private wallpaperService:WallpaperService
  ) { }

  ngOnInit(): void {
    // this.wallpaperService.showDashboardBackground(true)
  }

  onLocaleChanged(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([this.router.url]).then(() => {
      this.wallpaperService.animation = false;
      this.router.onSameUrlNavigation = 'ignore';
    });
  }


}
