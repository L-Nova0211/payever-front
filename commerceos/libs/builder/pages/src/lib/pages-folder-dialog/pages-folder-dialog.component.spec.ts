import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { PebPagesFolderDialogComponent } from './pages-folder-dialog.component';

describe('PebPagesFolderDialogComponent', () => {

  let fixture: ComponentFixture<PebPagesFolderDialogComponent>;
  let component: PebPagesFolderDialogComponent;
  let editorApi: jasmine.SpyObj<PebEditorApi>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  const envService = { shopId: 'shop-001' };
  const folders = [
    { id: 'folder-001', ancestors: [] },
    { id: 'folder-002', ancestors: [] },
  ];

  beforeEach(waitForAsync(() => {

    const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['close']);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', {
      getPageAlbumsFlatTree: of(folders),
    });

    TestBed.configureTestingModule({
      declarations: [PebPagesFolderDialogComponent],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { themeId: 't-001' } },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: PebEnvService, useValue: envService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPagesFolderDialogComponent);
      component = fixture.componentInstance;

      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    component.ngOnInit();

    expect(component.form.value).toEqual({
      location: null,
      name: null,
    });
    expect(editorApi.getPageAlbumsFlatTree).toHaveBeenCalledWith(
      envService.shopId,
      't-001',
    );
    expect(component.folders).toEqual(folders);

  });

  it('should close', () => {

    component.close();

    expect(dialogRef.close).toHaveBeenCalledWith(null);

  });

  it('should save', () => {

    /**
     * image is null
     */
    component.form = new FormGroup({
      location: new FormControl({
        id: 'folder-001',
        image: null,
      }),
      name: new FormControl('Folder 3'),
    });
    component.save();

    expect(dialogRef.close).toHaveBeenCalledWith({
      name: 'Folder 3',
      parentId: 'folder-001',
      image: 'assets/pages/album.svg',
      children: [],
    });

    /**
     * image is set
     */
    component.form.patchValue({
      location: {
        id: 'folder-002',
        image: 'images/test.svg',
      },
    });
    component.save();

    expect(dialogRef.close).toHaveBeenCalledWith({
      name: 'Folder 3',
      parentId: 'folder-002',
      image: 'images/test.svg',
      children: [],
    });

  });

});
