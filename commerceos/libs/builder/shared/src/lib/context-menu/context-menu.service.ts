import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, scan, tap, withLatestFrom } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder-controls';
import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebTemplateEffect,
  PebThemePageInterface,
} from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

import { getGroupId, PebContextMenuCommands, PebContextMenuState } from './context-menu';

@Injectable({ providedIn: 'any' })
export class PebEditorContextMenuService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebElementSelectionState.openGroup) openGroup!: Observable<string>;

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly controlsService: PebControlsService,
    private readonly editorStore: PebEditorStore,
  ) {
  }

  private selected$ = this.selectedElements$.pipe(
    map(elements => elements.map(elm => this.tree.find(elm.id))),
  );

  private readonly cmd$ = new Subject<PebContextMenuCommands>();

  private readonly commandsHandler$ = this.cmd$.pipe(
    withLatestFrom(this.selected$, this.openGroup, this.editorStore.page$),
  );

  group$ = this.commandsHandler$.pipe(
    filter(([cmd, elements, openGroup]) =>
      cmd === PebContextMenuCommands.Group && this.canGroup(elements, openGroup),
    ),
    tap(([, elements, openGroup, page]) => {
      const newGroupId = pebGenerateId();
      this.applyGroups(newGroupId, elements, openGroup, page);
    }),
    mapTo({ canGroup: false, canUngroup: true }),
  );

  ungroup$ = this.commandsHandler$.pipe(
    filter(([cmd, elements, openGroup]) =>
      cmd === PebContextMenuCommands.Ungroup && this.canUngroup(elements, openGroup),
    ),
    tap(([, elements, openGroup, page]) => {
      this.applyGroups(elements, openGroup, page);
    }),
    mapTo({ canGroup: true, canUngroup: false }),
  );

  private menuState: PebContextMenuState = {
    canGroup: false,
    canUngroup: false,
    canDelete: false,
    addSection: true,
    canSave: true,
  }

  selectionState$ = this.selected$.pipe(
    withLatestFrom(this.openGroup),
    map(([elements, openGroup]) => {

      return {
        ...this.menuState,
        canGroup: this.canGroup(elements, openGroup),
        canUngroup: this.canUngroup(elements, openGroup),
        canDelete: this.canDelete(elements),
        canSave: this.canSave(elements),
        addSection: true,
      };
    }),
  );

  menuState$ = merge(
    this.selectionState$,
    this.group$,
    this.ungroup$,
  ).pipe(
    scan<PebContextMenuState>((acc, value) => ({ ...acc, ...value }), this.menuState),
  );

  private applyGroups(id: string, elements: PebAbstractElement[], openGroup: string, page: PebThemePageInterface): void;
  private applyGroups(elements: PebAbstractElement[], openGroup: string, page: PebThemePageInterface): void;
  private applyGroups(...args) {
    let groupId: string;
    let elements: PebAbstractElement[];
    let openGroup: string;
    let page: PebThemePageInterface;
    if (typeof args[0] === 'string') {
      [groupId, elements, openGroup, page] = args;
    } else {
      [elements, openGroup, page] = args;
    }

    const effects = elements.reduce((acc, elm) => [
      ...acc,
      ...(groupId ? this.groupRecursive(groupId, elm, openGroup, page) : this.groupRecursive(elm, openGroup, page)),
    ], []);

    const action: PebAction = {
      effects,
      id: pebGenerateId('action'),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      createdAt: new Date(),
    };

    this.editorStore.commitAction(action);
    const controls = this.controlsService.createDefaultControlsSet(elements, openGroup);
    this.controlsService.renderControls(controls);
  }

  private groupRecursive(
    elm: PebAbstractElement,
    openGroup: string,
    page: PebThemePageInterface,
    effects?: PebEffect[]
  ): PebEffect[];

  private groupRecursive(
    id: string,
    elm: PebAbstractElement,
    openGroup: string,
    page: PebThemePageInterface,
    effects?: PebEffect[]
  ): PebEffect[];

  private groupRecursive(...args) {
    let newGroupId: string;
    let element: PebAbstractElement;
    let openGroup: string;
    let page: PebThemePageInterface;
    let effects: PebEffect[];
    if (typeof args[0] === 'string') {
      [newGroupId, element, openGroup, page, effects = []] = args;
    } else {
      [element, openGroup, page, effects = []] = args;
    }

    const groupId = element.data?.groupId ? [...element.data?.groupId] : [];
    const index = groupId.indexOf(openGroup) ?? -1;
    if (newGroupId) {
      if (index !== -1) {
        groupId.splice(index, 0, newGroupId);
      } else {
        groupId.push(newGroupId);
      }

      element.data = { ...element.data, groupId };
    } else {
      if (index !== -1) {
        groupId.splice(index, 1);
      } else {
        groupId.pop();
      }

      if (groupId.length) {
        element.data = { ...element.data, groupId };
      } else {
        delete element.data.groupId;
      }
    }

    effects = effects.concat(element.children.reduce((acc, elm) => {
      return [
        ...acc,
        ...(newGroupId
          ? this.groupRecursive(newGroupId, elm, openGroup, page, effects)
          : this.groupRecursive(elm, openGroup, page, effects)),
      ];
    }, []));

    effects.push({
      type: PebTemplateEffect.PatchElement,
      target: `${PebEffectTarget.Templates}:${page.templateId}`,
      payload: {
        id: element.element.id,
        data: { groupId: groupId.length ? groupId : null },
        type: element.element.type,
      },
    });

    return effects;
  }

  /**
   * All top level selected elements should be within same container,
   * should not be all in the same group (already grouped) and should not include Sections, Document and grid cells
   */
  private canGroup(elements: PebAbstractElement[], openGroup: string) {
    const topLevelElements = elements.filter(elm => !elements.some(e => e === elm.parent));
    const containers = topLevelElements.reduce((acc, elm) => {
      acc.add(elm.parent?.element.id);

      return acc;
    }, new Set<string>());

    const groups = [...new Set(elements.map(elm => getGroupId(elm, openGroup)))];
    const isAlreadyGrouped = groups.length === 1 && !groups.includes(undefined);

    return elements.length > 1
      && containers.size === 1
      && !isAlreadyGrouped
      && elements.every(element => ![PebElementType.Document, PebElementType.Section].includes(element.element.type));
  }

  private canUngroup(elements: PebAbstractElement[], openGroup: string) {
    const groups = new Set<string>();
    elements.forEach((elm) => {
      const groupId = getGroupId(elm, openGroup);
      if (groupId) {
        groups.add(groupId);
      }
    });

    return groups.size === 1;
  }

  canDelete(elements) {
    return elements.length > 0
      && elements.every(element => ![PebElementType.Document, PebElementType.Section].includes(element.type));
  }

  canSave(elements) {
    return elements.length > 0 && elements[0].element.type !== PebElementType.Section;
  }

  dispatch(value: PebContextMenuCommands) {
    this.cmd$.next(value);
  }
}
