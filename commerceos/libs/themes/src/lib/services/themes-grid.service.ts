import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { retry, share, take, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebPageId, PebScreen } from '@pe/builder-core';
import { MessageBus } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { FolderItem } from '@pe/folders';
import { PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';

import { PeThemeTypesEnum } from '../enums';

@Injectable({ providedIn: 'any' })
export class PeThemesGridService {
  public readonly confirmation$ = this.messageBus.listen<boolean>('confirm').pipe(share());
  public lastGridView: PeGridView;
  public selectedFolder: FolderItem;

  constructor(
    private confirmScreenService: ConfirmScreenService,
    private messageBus: MessageBus,
    private pebEditorApi: PebEditorApi,
    private translateService: TranslateService,
  ) { }
  
  public backdropClick = () => { };

  public openConfirmDialog(headings: Headings): void {
    this.confirmScreenService.show(headings, false);
  }

  public openPage(pageId: PebPageId, themeId: string, screen?: PebScreen) {
    return this.pebEditorApi
      .getPage(themeId, pageId, screen)
      .pipe(
        retry(3),
        tap(page => {
          if (screen) {
            const reqs$ = Object.values(PebScreen)
              .reduce((acc, s) => {
                  if (s !== screen) {
                    const req$ = this.pebEditorApi
                      .getPageStylesheet(themeId, pageId, s)
                      .pipe(
                        retry(3),
                        take(1),
                        tap(res => page.stylesheets[s] = res.stylesheet[s]));
                    acc.push(req$);
                  }

                  return acc;
                },
                [],
              );
            forkJoin(reqs$).pipe(take(1)).subscribe();
          }
        }));
  }

  public themesToGridItemMapper(themes: any[]): PeGridItem[] {
    return themes.map(theme => {
      const isActive = theme.isActive;
      const isInstalled = theme.type !== PeThemeTypesEnum.Template;
      const condition = isActive
        ? 'builder-themes.messages.active'
        : isInstalled
          ? 'builder-themes.messages.installed'
          : 'builder-themes.messages.not_installed';

      return {
        action: {
          label: isInstalled
            ? 'builder-themes.actions.open'
            : 'builder-themes.actions.install',
          more: isInstalled,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: condition,
        },
        columns: [
          {
            name: 'name',
            value: theme.name,
          },
          {
            name: 'condition',
            value: this.translateService.translate(condition),
          },
          {
            name: 'preview',
            value: 'preview',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        data: {
          isActive: isActive,
          isInstalled: isInstalled,
        },
        id: theme?.applicationScopeElasticId ?? theme._id,
        image: theme.picture ?? 'assets/icons/folder-grid.png',
        isDraggable: theme.type !== PeThemeTypesEnum.Template,
        itemLoader$: new BehaviorSubject<boolean>(false),
        serviceEntityId: theme.serviceEntityId ?? theme._id,
        title: theme.name,
        type: PeGridItemType.Item,
      };
    });
  }
}
