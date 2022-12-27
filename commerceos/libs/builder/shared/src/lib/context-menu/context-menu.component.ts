import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebElementKitDeep, PebEnvService, PebScreen } from '@pe/builder-core';
import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebShapesComponent } from '@pe/builder-shapes';
import { PebElementSelectionState } from '@pe/builder-state';
import { AppThemeEnum, PeDestroyService } from '@pe/common';

import { PebContextMenuCommands, PebContextMenuState } from './context-menu';
import { PebEditorContextMenuService } from './context-menu.service';


@Component({
  selector: 'peb-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class EditorContextMenuComponent {

  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;
  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebElementSelectionState.openGroup) openGroup!: Observable<string>;

  screen: PebScreen;
  elements: PebEditorElement[];

  readonly theming = this.pebEnvService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  menu$: Observable<PebContextMenuState> = this.contextMenuService.menuState$;
  commands = PebContextMenuCommands;

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  @Output() event = new EventEmitter<string>();

  constructor(
    private readonly dialog: MatDialog,
    private readonly editorStore: PebEditorStore,
    private readonly renderer: PebEditorRenderer,
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly destroy$: PeDestroyService,
    private readonly pebEnvService: PebEnvService,
    private readonly contextMenuService: PebEditorContextMenuService,
  ) {
    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.selectedElements$.pipe(
      tap((elements) => {
        this.elements = elements.map(el => this.renderer.getElementComponent(el.id));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openShapes(): void {
    this.event.emit('close');
    const elements = this.elements;
    if (elements.length > 0) {
      const element = elements.length === 1 ? this.getElementKit(elements[0]) : this.createGroupElementKit(elements);
      this.openShapesElement(element);
    }
  }

  private getElementKit(element: PebEditorElement): PebElementKitDeep {
    const page = this.editorStore.page;
    const getElementKitWithChildren = (elm: PebEditorElement): PebElementKitDeep => {
      const elmId = elm.definition.id;

      return {
        element: { ...elm.definition, children: [] },
        styles: Object.entries(page.stylesheets).reduce(
          (acc, [screen, stylesheet]) => {
            acc[screen] = stylesheet[elmId];

            return acc;
          },
          {},
        ),
        context: elm.context,
        contextSchema: page.context[elmId],
        children: elm.children.map(child => getElementKitWithChildren(child)),
      };
    };

    return getElementKitWithChildren(element);
  }

  private createGroupElementKit(elements: PebEditorElement[]): PebElementKitDeep {
    elements.map(elm => this.getElementKit(elm));
    // const groupId = pebGenerateId();
    // TODO: allow to have array of elements stored in shape

    return this.getElementKit(elements[0]);
  }

  openShapesElement(elementKit: PebElementKitDeep): void {
    const dialog = this.dialog.open(
      PebShapesComponent,
      {
        height: '82.3vh',
        maxWidth: '78.77vw',
        width: '78.77vw',
        panelClass: 'shapes-dialog',
        data: {
          elementKit,
          screen: this.screen,
          contextBuilder: this.editor.contextBuilder,
        },
      },
    );
    dialog.afterClosed().subscribe((command) => {
      if (command) {
        this.editor.commands$.next({ type: command.type, params: command.payload });
      }
    });
  }

  execCommand(value: PebContextMenuCommands) {
    this.contextMenuService.dispatch(value);
    this.event.emit('close');
  }

  delete(): void {
    this.event.emit('delete');
  }

  addSection(): void {
    this.event.emit('addSection');
  }
}
