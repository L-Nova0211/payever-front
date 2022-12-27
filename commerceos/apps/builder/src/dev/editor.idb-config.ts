import { DBConfig } from 'ngx-indexed-db';

import { pebGenerateId } from '@pe/builder-core';

import { initialShapeAlbums, initialShapes } from './editor.idb-contants';

export enum DatabaseEntity {
  ShopTheme = 'shop-theme',
  ShopThemeVersion = 'shop-theme-version',
  ShopThemeSource = 'shop-theme-source',
  ShopThemeSnapshot = 'shop-theme-snapshot',
  ShopThemePages = 'shop-theme-pages',
  RawTheme = 'raw-theme',
  Shapes = 'shapes',
  ShapeAlbums = 'shape-albums',
}

export function migrationFactory() {
  return {
    11: (db: IDBDatabase, transaction: IDBTransaction) => {
      const shapeAlbumsStore = transaction.objectStore(DatabaseEntity.ShapeAlbums);
      initialShapeAlbums.forEach(shapeAlbum => shapeAlbumsStore.add(shapeAlbum));
      const shapesStore = transaction.objectStore(DatabaseEntity.Shapes);
      initialShapes.forEach(shape => shapesStore.add({
        ...shape,
        id: pebGenerateId(),
        album: initialShapeAlbums[0].id,
      }));
    },
  };
}

export const MockEditorDatabaseConfig: DBConfig = {
  migrationFactory,
  name: 'Sandbox Editor',
  version: 11,
  objectStoresMeta: [
    //
    //  Editor entities
    //
    {
      store: DatabaseEntity.ShopTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        // { name: 'name', keypath: 'name', options: { unique: false } },
        // { name: 'sourceId', keypath: 'sourceId', options: { unique: false } },
      ],
    },
    {
      store: DatabaseEntity.ShopThemeVersion,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.ShopThemeSource,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [
        // { name: 'snapshotId', keypath: 'snapshotId', options: { unique: true } },
      ],
    },
    {
      store: DatabaseEntity.ShopThemeSnapshot,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.ShopThemePages,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.RawTheme,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.Shapes,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
    {
      store: DatabaseEntity.ShapeAlbums,
      storeConfig: { keyPath: 'id', autoIncrement: false },
      storeSchema: [],
    },
  ],
};
