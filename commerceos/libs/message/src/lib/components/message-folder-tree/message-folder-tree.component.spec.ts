import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageFolderTreeComponent } from './message-folder-tree.component';

describe('PeMessageFolderTreeComponent', () => {

  let fixture: ComponentFixture<PeMessageFolderTreeComponent>;
  let component: PeMessageFolderTreeComponent;
  let peOverlayConfig: any;

  beforeEach(waitForAsync(() => {

    const peOverlayDataMock = {
      theme: 'light',
      folderTree: [{ _id: 'f-001' }],
    };

    const peOverlayConfigMock = {
      onSaveSubject$: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageFolderTreeComponent],
      providers: [
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: peOverlayConfigMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageFolderTreeComponent);
      component = fixture.componentInstance;

      peOverlayConfig = TestBed.inject(PE_OVERLAY_CONFIG);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set props on construct', () => {

    expect(component.class).toEqual('light');
    expect(component.folderTree).toEqual([{ _id: 'f-001' }]);

  });

  it('should handle folders control value change', () => {

    component.foldersControl.patchValue([]);

    expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalledWith(undefined);
    component.foldersControl.patchValue([{ _id: 'f-001' }]);

    expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalledWith('f-001');

  });

});
