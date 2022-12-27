import { AfterContentInit, Component, ContentChild, HostBinding, Inject, Input, OnDestroy } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';

import { PeGridService } from './grid.service';
import { PeGridIcons, PeGridItem } from './misc/interfaces';
import { IconsHelperService } from './misc/services/icons-helper.service';
import { PeListImagesService } from './misc/services/list-images.service';
import { PeGridSidenavComponent, PeGridSidenavService } from './sidenav';
import { PeGridViewportService } from './viewport';

@Component({
  selector: 'pe-grid',
  template: `
  <pe-grid-material-styles></pe-grid-material-styles>
  <ng-content></ng-content>`,
  styles: [`
    :host {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
      height: 100%;
    }
  `],
  providers: [
    PeDestroyService,
  ],
})
export class PeGridComponent implements AfterContentInit, OnDestroy {

  @Input() set items(value: PeGridItem[]) {
    this.peGridService.items = value;
  }

  @Input() set theme(value: string) {
    this.peGridService.theme = value;
  }

  @Input() set embedMod(value: boolean) {
    this.peGridService.embedMod = value;
  }


  @ContentChild(PeGridSidenavComponent) peGridSidenav: PeGridSidenavComponent;

  @HostBinding('style.overflow') get embedModOverflow() {
    return this.peGridService.embedMod ? 'inherit' : 'hidden';
  }

  constructor(
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private iconsHelperService: IconsHelperService,
    private destroy$: PeDestroyService,
    private peGridViewportService: PeGridViewportService,
    private peListImagesService: PeListImagesService
  ) {
    this.registerIcons();

    this.peGridViewportService.viewChange$.pipe(
      tap((view) => {
        this.peListImagesService.view = view;
        this.peListImagesService.initListener(this.destroy$);
      }),
      takeUntil(this.destroy$)
    ).subscribe();


  }

  ngAfterContentInit(): void {
    if (!this.peGridSidenav) {
      this.peGridSidenavService.toggleOpenStatus$.next(false);
    } else {
      this.peGridSidenavService.toggleOpenStatus$.next(true);
    }
  }

  ngOnDestroy(): void {
    this.peListImagesService.imagesLoad = [];
    this.peListImagesService.allImagesLoad$.next(true);
  }

  // cdn need for message embed widget
  private registerIcons(): void {
    const icons: PeGridIcons[] = [
      {
        path: `${this.env.custom.cdn}/icons-filter/sidebar-white-icon.svg`,
        name: 'sidebar-white-icon',
      },
      {
        path: `${this.env.custom.cdn}/icons/app-icon-folder.svg`,
        name: 'folder-icon',
      },
    ];
    this.iconsHelperService.registerIcons(icons);
    this.iconsHelperService.registerIconsSet(`${this.env.custom.cdn}/icons-grid/pe-grid-icons-set.svg`);
  }
}
