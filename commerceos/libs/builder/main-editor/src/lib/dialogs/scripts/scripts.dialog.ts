import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { pick } from 'lodash';
import { Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import {
  DEFAULT_TRIGGER_POINT,
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebEnvService,
  pebGenerateId,
  PebPageEffect,
  PebScript,
  PebShopEffect,
} from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-services';
import { AppThemeEnum } from '@pe/common';

import { EditorIcons } from '../../editor-icons';

import { PebEditorScriptFormDialog, PebEditorScriptFormValue } from './script-form.dialog';

@Component({
  selector: 'peb-scripts',
  templateUrl: './scripts.dialog.html',
  styleUrls: ['./scripts.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorScriptsDialog implements AfterViewInit {

  readonly theming = this.pebEnvService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  readonly pagesScripts$: Observable<Array<{ id: string, name: string, scripts: PebScript[] }>> =
    this.editorStore.snapshot$.pipe(
      filter(snapshot => !!snapshot),
      map((snapshot) => {
        const globalScripts = snapshot.application.data?.scripts ?? [];
        const result = snapshot.pages.reduce(
          (acc, page) => {
            const scripts = page.data?.scripts ?? [];
            if (scripts.length) {
              acc.push({
                id: page.id,
                name: page.name,
                scripts: page.data.scripts,
              });
            }

            return acc;
          },
          [],
        );
        if (globalScripts.length) {
          result.unshift({
            id: '',
            name: 'Global',
            scripts: globalScripts,
          });
        }

        return result;
      }),
    );

  disableAnimation = true;

  constructor(
    private dialogRef: MatDialogRef<PebEditorScriptsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private pebEnvService: PebEnvService,
    private editorStore: PebEditorStore,
    private dialog: MatDialog,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    Object.entries(EditorIcons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(
        name,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });
  }

  ngAfterViewInit(): void {
    // https://stackoverflow.com/questions/53518380/angular-7-material-expansion-panel-flicker/53691689
    setTimeout(() => this.disableAnimation = false);
  }

  openScript({ script = null, pageId = '' }: {
    script?: PebScript,
    pageId?: string,
  } = {}): void {
    const scriptDialog = this.openScriptFormDialog({ script, pageId });
    scriptDialog.afterClosed().pipe(
      filter(s => !!s),
      mergeMap((formValue: PebEditorScriptFormValue) => {
        const formScript: PebScript = {
          ...pick(formValue, 'id', 'name', 'content' , 'triggerPoint'),
          enabled: formValue?.enabled ?? true,
        };
        const page = this.editorStore.snapshot.pages.find(p => p.id === formValue.page);
        const action: PebAction = {
          id: pebGenerateId(),
          createdAt: new Date(),
          targetPageId: null,
          affectedPageIds: [],
          effects: [],
        };
        const moveScript = !!script && pageId !== (page?.id ?? '');

        if (moveScript) {
          action.effects.push(this.removePreviousScriptEffect(script.id, pageId));
          if (pageId) {
            action.affectedPageIds.push(pageId);
          }
        }

        if (!page) {
          const appData = this.editorStore.snapshot.application.data;
          action.effects.push({
            type: PebShopEffect.UpdateData,
            target: PebEffectTarget.Shop,
            payload: {
              ...appData,
              scripts: script?.id && !moveScript ?
                (appData.scripts ?? []).map(s => s.id === script.id ? formScript : s) :
                [...(appData.scripts ?? []), formScript],
            },
          });
        } else {
          action.effects.push({
            type: PebPageEffect.Update,
            target: `${PebEffectTarget.Pages}:${page.id}`,
            payload: {
              data: {
                ...page.data,
                scripts: script?.id && !moveScript ?
                  (page.data.scripts ?? []).map(s => s.id === script.id ? formScript : s) :
                  [...(page.data.scripts ?? []), formScript],
              },
            },
          });
          action.affectedPageIds.push(page.id);
        }

        return this.editorStore.commitAction(action);
      }),
    ).subscribe();
  }

  private removePreviousScriptEffect(scriptId: string, pageId: string): PebEffect {
    const page = this.editorStore.snapshot.pages.find(p => p.id === pageId);
    if (page) {
      return {
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:${page.id}`,
        payload: {
          data: {
            ...page.data,
            scripts: (page.data?.scripts || []).filter(s => s.id !== scriptId),
          },
        },
      };
    }
    const appData = this.editorStore.snapshot.application.data;

    return {
      type: PebShopEffect.UpdateData,
      target: PebEffectTarget.Shop,
      payload: {
        ...appData,
        scripts: (appData.scripts || []).filter(s => s.id !== scriptId),
      },
    };
  }

  openScriptFormDialog({ script = null, pageId = '' }: {
    script?: PebScript,
    pageId?: string,
  } = {}): MatDialogRef<PebEditorScriptFormDialog> {
    return this.dialog.open(PebEditorScriptFormDialog, {
      data: { script, page: pageId },
      panelClass: ['script-dialog__panel', this.theming],
      width: '436px',
      disableClose: true,
    });
  }

  toggleScript(script: PebScript, pageId: string): void {
    const page = this.editorStore.snapshot.pages.find(p => p.id === pageId);
    if (!page) {
      const appData = this.editorStore.snapshot.application.data;

      this.editorStore.updateShop({
        ...appData,
        scripts: (appData.scripts ?? [])
          .map(s => s.id === script.id ? { ...script, enabled: !script.enabled } : s),
      });
    } else {
      this.editorStore.updatePage(page, {
        data: {
          ...page.data,
          scripts: (page.data?.scripts ?? [])
            .map(s => s.id === script.id ? { ...script, enabled: !script.enabled } : s),
        },
      });
    }
  }

  close() {
    this.dialogRef.close(true);
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}
