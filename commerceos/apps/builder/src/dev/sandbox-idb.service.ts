import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { PebShop } from '@pe/builder-core';

import { DatabaseEntity } from './editor.idb-config';
import { ImitateHttp } from './imitate-http.decorator';

export interface RawTheme {
  id: string;
  info: PebShop;
  pages: {
    [name: string]: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SandboxDBService {

  constructor(private idb: NgxIndexedDBService) {}

  async getAllRawThemes(): Promise<RawTheme[]> {
    return this.idb.getAll(DatabaseEntity.RawTheme);
  }

  @ImitateHttp()
  async getRawThemeById(id: string): Promise<RawTheme> {
    return this.idb.getByID<RawTheme>(DatabaseEntity.RawTheme, id);
  }

  @ImitateHttp()
  async saveRawTheme(rawTheme: RawTheme) {
    return this.idb.add(DatabaseEntity.RawTheme, rawTheme).then(() => rawTheme);
  }

}
