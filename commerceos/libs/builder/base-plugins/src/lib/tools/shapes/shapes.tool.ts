import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebAbstractElement, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-shapes-tool',
  templateUrl: './shapes.tool.html',
  styleUrls: ['./shapes.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorShapesTool extends AbstractPebEditorTool {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  private dialog = this.injector.get(MatDialog);
  private readonly editorAccessorService = this.injector.get(PebEditorAccessorService);
  isMobile = this.deviceService.isMobile;
  tree: PebRTree<PebAbstractElement>;
  store: Store;

  constructor(
    injector: Injector,
  ) {
    super(injector);
    this.tree = this.injector.get(PebRTree);
    this.store = this.injector.get(Store);
  }

  openShapes(): void {
    this.execCommand.emit({ type: 'openShapesDialog' });
  }
}
