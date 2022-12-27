import { PebBlogEditorState } from './blog-editor.state';

describe('PebBlogEditorState', () => {

  const state = new PebBlogEditorState();

  it('should be defined', () => {

    expect(state).toBeDefined();

  });

  it('should set/get seo sidebar opened', () => {

    const nextSpy = spyOn(state[`seoSidebarOpenedSubject$`], 'next').and.callThrough();
    const getSpy = spyOnProperty(state, 'seoSidebarOpened').and.callThrough();

    state.seoSidebarOpened = true;

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(state.seoSidebarOpened).toBe(true);
    expect(getSpy).toHaveBeenCalled();

  });

});
