import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { WallpaperService } from '@pe/wallpaper';

@Component({
  selector: 'search-box-container',
  templateUrl: './search-box-container.component.html',
  styleUrls: ['./search-box-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxContainerComponent implements OnInit {
  isAdmin$: Observable<boolean> = this.authService.onChange$.pipe(
    startWith(null),
    map(() => this.authService.isAdmin()),
  );

  outInProgress = false;
  searchString: string;

  constructor(
    private el: ElementRef,
    private authService: PeAuthService,
    protected wallpaperService: WallpaperService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.searchString = this.route.snapshot.params.searchText;
    this.wallpaperService.showDashboardBackground(false);
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    if (this.el.nativeElement === event.target) {
      this.navigateToDashboard();
    }
  }

  navigateToDashboard(): void {
    this.outInProgress = true;
    history.back();
  }
}
