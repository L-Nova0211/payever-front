import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { AppThemeEnum, EnvService } from '@pe/common';
import { FolderItem, MoveIntoFolderEvent, PeFoldersModule } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeGridService } from '../../grid.service';
import { PeGridMoveOverviewComponent } from '../components/move-overview/move-overview';

@Injectable()
export class PeMoveOverviewService {
  selectFolder$ = new Subject<MoveIntoFolderEvent>();

  private save$ = new BehaviorSubject<FolderItem>(null);

  constructor(
    private overlay: PeOverlayWidgetService,
    public injector: Injector,
    private translateService: TranslateService,
    private envService: EnvService,
    private gridService: PeGridService
  ) {}

  openOverview(): void {
    const theme = this.envService?.businessData?.themeSettings?.theme || AppThemeEnum.default;
    const overlayData = {
      selectedItems: this.gridService.selectedItems,
      theme,
      selectFolder$: this.selectFolder$,
      save$: this.save$,
    };
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: PeGridMoveOverviewComponent,
      data: { ...overlayData },
      backdropClass: 'move_overlay-backdrop',
      panelClass: `move_overlay-panel-${theme === 'default' ? AppThemeEnum.default : theme}`,

      headerConfig: {
        title: 'Move',
        backBtnTitle: this.translateService.translate('grid.actions.cancel'),
        theme,
        backBtnCallback: () => {
          this.overlay.close();
        },
        doneBtnTitle: this.translateService.translate('grid.actions.done'),
        doneBtnCallback: () => {
          this.doneAction();
        },
        removeContentPadding: true,
      },
      lazyLoadedModule: PeFoldersModule,
    };

    this.overlay.open(config);
  }

  private doneAction(): void {
    this.selectFolder$.next({
      folder: this.save$.value,
      moveItems: this.gridService.selectedItems,
    });
    this.overlay.close();

  }
}
