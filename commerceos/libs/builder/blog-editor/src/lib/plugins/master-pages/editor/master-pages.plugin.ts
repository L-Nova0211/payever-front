import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { pebCreateLogger, PebEditorState } from '@pe/builder-core';
import { AfterGlobalInit, AfterPageInit } from '@pe/builder-old';
import { PebEditorStore } from '@pe/builder-services';

import { PebBlogEditorState } from '../../../blog-editor.state';

const log = pebCreateLogger('editor:plugins:master-pages');

@Injectable()
export class PebEditorBlogMasterPagesPlugin implements AfterPageInit, AfterGlobalInit {

  logger = { log };

  constructor(
    private store: PebEditorStore,
    @Inject(PebEditorState) private state: PebBlogEditorState,
  ) {
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
