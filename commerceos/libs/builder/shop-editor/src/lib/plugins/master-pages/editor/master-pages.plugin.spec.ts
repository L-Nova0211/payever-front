import { TestBed } from '@angular/core/testing';
import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-editor';
import { PebEditorShopMasterPagesPlugin } from './master-pages.plugin';

describe('PebEditorShopMasterPagesPlugin', () => {

  let plugin: PebEditorShopMasterPagesPlugin;
  let logger: { log: jasmine.Spy; };

  beforeEach(() => {

    logger = {
      log: jasmine.createSpy('log'),
    };

    TestBed.configureTestingModule({
      providers: [
        PebEditorShopMasterPagesPlugin,
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
      ],
    });

    plugin = TestBed.inject(PebEditorShopMasterPagesPlugin);
    plugin.logger = logger;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should log after global init', () => {

    plugin.afterGlobalInit().subscribe().unsubscribe();

    expect(logger.log).toHaveBeenCalledWith('global: init');

  });

  it('should log after page init', () => {

    plugin.afterPageInit().subscribe().unsubscribe();

    expect(logger.log).toHaveBeenCalledWith('page: init');

  });

});
