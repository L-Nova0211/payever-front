import { Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { SandboxSettingsDialog } from './settings.dialog';

const HOTKEYS = {
  DELETE_DB: (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '1',
};

@Injectable({ providedIn: 'root' })
export class SandboxSettingsService implements OnDestroy {
  private renderer: Renderer2;
  private removeEventListener: () => void;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.removeEventListener = this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      if (HOTKEYS.DELETE_DB(e)) {
        e.preventDefault();
        this.resetLocalDB();
      }
    });
  }

  open(): MatDialogRef<SandboxSettingsDialog> {
    return this.dialog.open(SandboxSettingsDialog, { data: { deleteLocalDB: this.resetLocalDB.bind(this) } });
  }

  async resetLocalDB() {
    const dbs = await (window.indexedDB as any).databases();
    dbs.forEach(db => window.indexedDB.deleteDatabase(db.name));
    this.router.navigate(['/']).then(() => location.reload());
  }

  ngOnDestroy() {
    this.removeEventListener();
  }
}
