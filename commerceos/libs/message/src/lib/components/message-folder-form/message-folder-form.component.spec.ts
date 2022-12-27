import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageFolderFormComponent } from './message-folder-form.component';

interface FolderDataMock {
  _id: string;
  name: string;
  position: number[];
  parentFolderId: string;
}

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('PeMessageFolderFormComponent', () => {
  let fixture: ComponentFixture<PeMessageFolderFormComponent>;
  let component: PeMessageFolderFormComponent;
  let peOverlayData: {
    theme: string;
    folder: FolderDataMock;
    newFolder: FolderDataMock;
  };

  beforeEach(
    waitForAsync(() => {
      peOverlayData = {
        theme: 'light',
        folder: {
          _id: 'f-001',
          name: 'Folder 1',
          position: [1],
          parentFolderId: 'parent',
        },
        newFolder: null,
      };

      TestBed.configureTestingModule({
        declarations: [PeMessageFolderFormComponent, TranslatePipeMock],
        providers: [
          FormBuilder,
          { provide: PE_OVERLAY_DATA, useValue: peOverlayData },
          { provide: PE_OVERLAY_CONFIG, useValue: {} },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageFolderFormComponent);
          component = fixture.componentInstance;
        });
    }),
  );

  it('should be defined', () => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  it('should set form values', () => {
    expect(component.folderFormGroup.value).toEqual(peOverlayData.folder);

    component.folderFormGroup.patchValue({
      parentFolderId: 'parent.folder',
    });

    expect(component.folderFormGroup.value).toEqual({
      ...peOverlayData.folder,
      parentFolderId: 'parent.folder',
    });
    expect(peOverlayData.newFolder).toEqual(component.folderFormGroup.value);
  });
});
