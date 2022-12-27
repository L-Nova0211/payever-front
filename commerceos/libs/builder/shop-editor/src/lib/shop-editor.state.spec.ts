import { TestBed } from '@angular/core/testing';

import { PebShopEditorState } from './shop-editor.state';

describe('PebShopEditorState', () => {

  let state: PebShopEditorState;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [PebShopEditorState],
    });

    state = TestBed.inject(PebShopEditorState);

  });

  it('should be defined', () => {

    expect(state).toBeDefined();

  });

  it('should set/get seo sidebar opened', () => {

    state.seoSidebarOpened = true;

    expect(state[`seoSidebarOpenedSubject$`].value).toBe(true);
    expect(state.seoSidebarOpened).toBe(true);

  });

});
