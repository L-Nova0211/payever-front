import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { PebEnvService } from '@pe/builder-core';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-publish-tool',
  templateUrl: './publish.tool.html',
  styleUrls: ['./publish.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPublishTool extends AbstractPebEditorTool {

  private envService = this.injector.get(PebEnvService);

  constructor(injector: Injector) {
    super(injector);
  }

  openPublish(element: HTMLElement) {
    /** @deprecated openOverlay is not being used */
    // this.openOverlay(
    //   PebEditorPublishToolDialogComponent,
    //   element,
    //   this.editorStore,
    //   'dialog-publish-versions-panel',
    // ).pipe(
    //   tap(command => this.execCommand.emit(command as PebEditorCommand)),
    //   takeUntil(this.destroy$),
    // ).subscribe();
    /** new way to publish by command */
    this.execCommand.emit({
      type: 'openPublishDialogUnderElement',
      params: { element, appId: this.envService.shopId },
    });
  }
}
