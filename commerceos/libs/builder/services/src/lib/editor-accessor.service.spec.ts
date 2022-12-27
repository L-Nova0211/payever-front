import { PebEditorAccessorService } from './editor-accessor.service';

describe('PebEditorAccessorService', () => {

  let service: PebEditorAccessorService;

  beforeEach(() => {

    service = new PebEditorAccessorService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get editor component', () => {

    const nextSpy = spyOn(service[`editorSubject$`], 'next').and.callThrough();

    service.editorComponent = { test: true } as any;

    expect(nextSpy).toHaveBeenCalledWith({ test: true } as any);
    expect(service.editorComponent).toEqual({ test: true } as any);

  });

  it('should set/get renderer', () => {

    const nextSpy = spyOn(service[`rendererSubject$`], 'next').and.callThrough();

    service.renderer = { test: true } as any;

    expect(nextSpy).toHaveBeenCalledWith({ test: true } as any);
    expect(service.renderer).toEqual({ test: true } as any);

  });

  it('should update destoroyed subject on destroy', () => {

    const nextSpy = spyOn(service[`destroyedSubject$`], 'next').and.callThrough();

    service.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();

  });

});
