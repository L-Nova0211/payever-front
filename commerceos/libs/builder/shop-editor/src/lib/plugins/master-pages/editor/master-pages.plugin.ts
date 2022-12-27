import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { pebCreateLogger, PebEditorState } from '@pe/builder-core';
import { AfterGlobalInit, AfterPageInit } from '@pe/builder-old';
import { PebEditorStore } from '@pe/builder-services';

import { PebShopEditorState } from '../../../shop-editor.state';

const log = pebCreateLogger('editor:plugins:master-pages');


@Injectable()
export class PebEditorShopMasterPagesPlugin implements AfterPageInit, AfterGlobalInit {

  logger = { log };

  constructor(private editorStore: PebEditorStore,
              @Inject(PebEditorState) private state: PebShopEditorState) {
  }

  afterGlobalInit(): Observable<any> {
    this.logger.log('global: init');

    return EMPTY.pipe(
      finalize(() => log('global: shutdown')),
    );
  }

  afterPageInit(): Observable<any> {
    this.logger.log('page: init');

    return EMPTY.pipe(
      finalize(() => log('page: shutdown')),
    );
  }
}
