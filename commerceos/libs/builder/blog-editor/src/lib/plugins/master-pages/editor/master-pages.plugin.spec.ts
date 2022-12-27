import { TestBed } from '@angular/core/testing';
import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-editor';
import { PebEditorBlogMasterPagesPlugin } from './master-pages.plugin';

describe('PebEditorBlogMasterPagesPlugin', () => {

  let plugin: PebEditorBlogMasterPagesPlugin;
  let logger: { log: jasmine.Spy; };

  beforeEach(() => {

    logger = { log: jasmine.createSpy('log') };

    TestBed.configureTestingModule({
      providers: [
        PebEditorBlogMasterPagesPlugin,
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
      ],
    });

    plugin = TestBed.inject(PebEditorBlogMasterPagesPlugin);
    plugin.logger = logger;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should handle after global init', () => {

    plugin.afterGlobalInit().subscribe().unsubscribe();

    expect(logger.log).toHaveBeenCalledOnceWith('global: init');

  });

  it('should handle after page init', () => {

    plugin.afterPageInit().subscribe().unsubscribe();

    expect(logger.log).toHaveBeenCalledOnceWith('page: init');

  });

});
