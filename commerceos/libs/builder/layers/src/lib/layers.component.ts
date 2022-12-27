import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMapTo, take, takeUntil, tap } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder-controls';
import { PebElementDef, PebScreen } from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

import { sortByIndex, transformer } from './layers.functions';
import { FlatNode, LayerNode } from './layers.interfaces';


@Component({
  selector: 'pe-layers',
  templateUrl: './layers.component.html',
  styleUrls: [
    '../../../styles/src/lib/styles/_sidebars.scss',
    './layers.component.scss',
  ],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebLayersComponent {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  private page$ = combineLatest([
    this.editorStore.page$.pipe(filter(Boolean)),
    this.screen$,
  ]).pipe(
    filter(([page]) => !!page),
    map(([page, screen]: any) =>  Object.create({ template: page.template, stylesheet: page.stylesheets[screen] })),
  );

  private activeElement$: Observable<string> = this.selectedElements$.pipe(
    filter(elements => !!elements.length),
    map(elements => elements[0].id),
  );

  private loadDataPage$ = this.page$.pipe(tap(page => this.loadDataSource(page)));
  private expandToElement$ = this.activeElement$.pipe(tap((id: string) => this.expandToElement(id)));

  constructor(
    private readonly destroy$: PeDestroyService,
    private store: Store,
    private tree: PebRTree<PebAbstractElement>,
    private readonly controlsService: PebControlsService,
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly editorStore: PebEditorStore,
  ) {
    this.loadDataPage$.pipe(
      switchMapTo(this.expandToElement$),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onSelectElement(id) {
    this.page$.pipe(
      take(1),
      map(page => {
        const styles = page.stylesheet?.[id];
        const isVisible = styles ? styles?.display !== 'none' : false;

        return isVisible;
      }),
      filter(isVisible => !!isVisible),
      tap(() => {
        this.store.dispatch(new PebSelectAction(id));

        const elementSelected = this.tree.find(id);
        const controls = this.controlsService.createDefaultControlsSet([elementSelected]);
        this.controlsService.renderControls(controls);
      }),
    ).subscribe();
  }

  toggleVisible(node: LayerNode) {
    this.store.dispatch(new PebDeselectAllAction());
    this.controlsService.renderControls([]);

    this.page$.pipe(
      take(1),
      tap(page => {
        const styles = page.stylesheet[node.id];
        const isVisible = styles ? styles?.display !== 'none' : false;
        const element = page.template.children.find(el => el.id === node.id);

        this.editorAccessorService.editorComponent.commands$.next({
          type: 'changeElementVisible',
          params: {
            element,
            stylesheet: page.stylesheet,
            visible: !isVisible,
          },
        });
      }),
    ).subscribe();
  }

  private loadDataSource(page) {
    const sortedElements = sortByIndex(page.template.children);

    const data = sortedElements.map((el: any) => {
      const styles = page.stylesheet?.[el.id];
      el.isVisible = styles ? styles?.display !== 'none' : false;

      return el;
    }) as LayerNode[];

    this.dataSource.data = data;
  }

  private expandToElement(id: string) {
    this.treeControl.dataNodes.forEach(node => {
      this.treeControl.collapse(node);
    });

    const index = this.treeControl.dataNodes.findIndex(node => node.id === id);
    if (index === -1) { return; }

    for (let nodeIndex = index; this.treeControl.dataNodes[nodeIndex]; nodeIndex--) {
      this.treeControl.expand(this.treeControl.dataNodes[nodeIndex]);
      if (this.treeControl.dataNodes[nodeIndex].level === 0) {
        break;
      }
    }
  }

}


