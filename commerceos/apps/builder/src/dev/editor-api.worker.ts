/// <reference lib="webworker" />

import { NgxIndexedDBService } from 'ngx-indexed-db';

import {
  hashString,
  PebAction,
  pebActionHandler,
  pebCompileActions,
  PebShopId,
  PebShopThemeEntity,
  PebThemeDetailInterface,
  PebThemePageInterface,
} from '@pe/builder-core';

import { DatabaseEntity, MockEditorDatabaseConfig } from './editor.idb-config';
import { MockLockingService } from './locking.service';
import { WorkerMessage, WorkerMessageType } from './worker-messages';

(self as any).window = self;

export class SandboxMockApiWorker {

  private locking = new MockLockingService();
  private idb: NgxIndexedDBService;

  constructor() {

    this.idb = new NgxIndexedDBService(MockEditorDatabaseConfig, 'browser');

    addEventListener('message', (event) => {
      const { messageType, messageId, data } = event.data as WorkerMessage;
      switch (messageType) {
        case WorkerMessageType.DeleteAction: {
          const { themeId, actionId } = data;
          this.undoAction(themeId, actionId).then((result) => {
            postMessage({ messageType, messageId, data: result });
          });
          break;
        }
        case WorkerMessageType.AddAction: {
          const { themeId, action } = data;
          this.addAction(themeId, action).then((result) => {
            postMessage({ messageType, messageId, data: result });
          });
          break;
        }
      }
    });
  }

  async addAction(themeId: PebShopId, action: PebAction): Promise<{ sourceHash: string; snapshotHash: string }> {
    const lock = await this.locking.acquireLock(themeId);

    let { source, snapshot, pages } = await this.getThemeWithRelations(themeId);

    source = {
      ...source,
      hash: hashString(source.hash + action.id),
      actions: [...source.actions, action],
    };

    const handled = pebActionHandler({ snapshot, pages }, action);
    snapshot = handled.snapshot;
    pages = handled.pages;

    await Promise.all([
      this.idb.update(DatabaseEntity.ShopThemeSource, source),
      this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
      ...Object.values(pages).map(page => this.idb.update(DatabaseEntity.ShopThemePages, page)),
    ]);
    await lock.release();

    return {
      sourceHash: source.hash,
      snapshotHash: snapshot.hash,
    };
  }

  async undoAction(themeId: PebShopId, actionId: string): Promise<{ snapshot: PebThemeDetailInterface }> {
    const lock = await this.locking.acquireLock(themeId);

    let { source, snapshot } = await this.getThemeWithRelations(themeId);

    source = {
      ...source,
      actions: source.actions.filter(a => a.id !== actionId),
    };
    const handled = pebCompileActions(source.actions);
    snapshot = { ...handled.snapshot, id: snapshot.id };

    await Promise.all([
      this.idb.update(DatabaseEntity.ShopThemeSource, source),
      this.idb.update(DatabaseEntity.ShopThemeSnapshot, snapshot),
      ...Object.values(handled.pages).map(page => this.idb.update(DatabaseEntity.ShopThemePages, page)),
    ]);
    await lock.release();

    return { snapshot };
  }

  private async getThemeWithRelations(themeId: string) {
    const theme = await this.idb.getByID<PebShopThemeEntity>(
      DatabaseEntity.ShopTheme, themeId,
    );
    const source = await this.idb.getByID<any>(
      DatabaseEntity.ShopThemeSource, theme.sourceId,
    );
    const snapshot = await this.idb.getByID<PebThemeDetailInterface>(
      DatabaseEntity.ShopThemeSnapshot, source.snapshotId,
    );
    const pagesEntities = await this.idb.getAll<PebThemePageInterface>(DatabaseEntity.ShopThemePages);
    const pages = pagesEntities.reduce(
      (acc: any, page) => {
        if (snapshot.pages.find(p => p.id === page.id)) {
          acc[page.id] = page;
        }
        return acc;
      },
      {},
    );

    return { theme, source, snapshot, pages };
  }
}

const worker = new SandboxMockApiWorker();
