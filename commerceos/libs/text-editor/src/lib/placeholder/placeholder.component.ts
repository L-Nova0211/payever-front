import { NestedTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PLACEHOLDER_DATA } from '../constants/placeholder.constants';
import { TextEditorPlaceholderItem } from '../interfaces/placeholder';
import { TextEditorService } from '../services/text-editor.service';
import { ExecuteCommands } from '../text-editor.constants';

@Component({
  selector: 'pe-text-editor-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeTextEditorPlaceholderComponent {

  previousExpandedModel: TextEditorPlaceholderItem[] = [];
  treeControl = new NestedTreeControl<TextEditorPlaceholderItem>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TextEditorPlaceholderItem>();

  hasChild = (_: number, node: TextEditorPlaceholderItem) => !!node.children?.length;

  constructor(
    private textEditorService: TextEditorService,
    private destroy$: PeDestroyService,
  ) {
    this.dataSource.data = PLACEHOLDER_DATA;
    this.treeControl.expansionModel.changed.pipe(
      tap(() => this.previousExpandedModel = this.treeControl.expansionModel.selected),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public selectPlaceholder(node: TextEditorPlaceholderItem): void {
    this.textEditorService.triggerCommand$.next({
      key: ExecuteCommands.PLACEHOLDER,
      value: node.value,
    });
    this.textEditorService.placeholderSubject$.next(node.value);
  }

  public searchPlaceholders(search: string): void {
    const addedMap = new Map<string, boolean>();
    this.dataSource.data = search ? this.search(PLACEHOLDER_DATA, search, addedMap, undefined).children : PLACEHOLDER_DATA;
    this.expandNodes(this.dataSource.data);
  }

  private search(
    tree: TextEditorPlaceholderItem[],
    searchString: string,
    addedMap: Map<string, boolean>,
    node?: TextEditorPlaceholderItem,
  ): TextEditorPlaceholderItem {
    return tree.reduce((acc, node) => {
      if (node.name.toLowerCase().trim().includes(searchString.toLowerCase().trim())) {
        if (!addedMap.has(node.value)) {
          addedMap.set(node.value, true);
          acc.children.push(node);
        }
      }

      if (node.children) {
        const child = this.search(node.children, searchString, addedMap, node);
        if (child.children.length && !addedMap.has(child.value)) {
          addedMap.set(child.value, true);
          acc.children.push(child);
        };
      }

      return acc;
    }, {
      name: node?.name || 'tree',
      value: node?.value || node?.name.toLowerCase() || 'root',
      children: [],
    });
  }

  private expandNodes(tree: TextEditorPlaceholderItem[]): void {
    tree.forEach(node => {
      if (node.children) {
        this.expandNodes(node.children);
      }

      this.previousExpandedModel.forEach(prev => {
        if (node.value === prev.value) {
          this.treeControl.expand(node);
        }
      });
    });
  }
}
