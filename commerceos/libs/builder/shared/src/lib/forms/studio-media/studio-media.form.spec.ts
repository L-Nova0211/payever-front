import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

import { MediaItemType, MediaType, PebEditorState } from '@pe/builder-core';
import { MediaDialogService } from '@pe/builder-media';

import { EditorStudioMediaForm } from './studio-media.form';

describe('EditorStudioMediaForm', () => {

  let fixture: ComponentFixture<EditorStudioMediaForm>;
  let component: EditorStudioMediaForm;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;

  beforeEach(waitForAsync(() => {

    const mediaDialogServiceSpy = jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['openMediaDialog']);

    TestBed.configureTestingModule({
      declarations: [EditorStudioMediaForm],
      providers: [
        { provide: PebEditorState, useValue: {} },
        { provide: MediaDialogService, useValue: mediaDialogServiceSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorStudioMediaForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        src: new FormControl(),
        source: new FormControl(),
        preview: new FormControl(),
      });

      mediaDialogService = TestBed.inject(MediaDialogService) as jasmine.SpyObj<MediaDialogService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open studio', () => {

    const dataMock = {
      thumbnail: 'thumb',
      sourceUrl: 'url/source',
    };
    const dialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(dataMock)),
    };

    mediaDialogService.openMediaDialog.and.returnValue(dialogRef as any);

    /**
     * component.type is MediaType.Image as default
     */
    component.openStudio();

    expect(mediaDialogService.openMediaDialog).toHaveBeenCalledWith({ types: [MediaItemType.Image] });
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(component.formGroup.value).toEqual({
      src: dataMock.thumbnail,
      source: null,
      preview: null,
    });

    /**
     * component.type is MediaType.Video
     */
    component.type = MediaType.Video;
    component.openStudio();

    expect(mediaDialogService.openMediaDialog).toHaveBeenCalledWith({ types: [MediaItemType.Video] });
    expect(component.formGroup.value).toEqual({
      src: dataMock.thumbnail,
      source: dataMock.sourceUrl,
      preview: dataMock.thumbnail,
    });

  });

  // it('should open studio', () => {

  //   const patchSpy = spyOn(component.formGroup, 'patchValue').and.callThrough();

  //   dialog.open.and.returnValues(
  //     {
  //       afterClosed() {
  //         return of(null);
  //       },
  //     } as any,
  //     {
  //       afterClosed() {
  //         return of({
  //           thumbnail: 'thumb.jpg',
  //         });
  //       },
  //     } as any,
  //     {
  //       afterClosed() {
  //         return of({
  //           sourceUrl: 'source',
  //           thumbnail: 'thumb.jpg',
  //         });
  //       },
  //     } as any,
  //     {
  //       afterClosed() {
  //         return of({
  //           sourceUrl: 'source',
  //           thumbnail: 'thumb.jpg',
  //         });
  //       },
  //     } as any,
  //   );

  //   // w/o data
  //   component.openStudio();

  //   // w/ data
  //   // type = images
  //   component.openStudio();

  //   expect(patchSpy).toHaveBeenCalledWith({ src: 'thumb.jpg' });

  //   // type = videos
  //   component.type = MediaType.Video;
  //   component.openStudio();

  //   expect(patchSpy).toHaveBeenCalledWith({
  //     source: 'source',
  //     preview: 'thumb.jpg',
  //   });

  //   patchSpy.calls.reset();

  //   // type = undefined
  //   component.type = undefined;
  //   component.openStudio();

  //   expect(patchSpy).not.toHaveBeenCalled();

  // });

});
