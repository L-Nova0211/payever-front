import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { BackgroundActivityService } from './background-activity.service';
import { UploadInterceptorService } from './upload-interceptor.service';

describe('UploadInterceptorService', () => {

  let service: UploadInterceptorService;
  let bgActivity: jasmine.SpyObj<BackgroundActivityService>;

  beforeEach(() => {

    const bgActivitySpy = jasmine.createSpyObj<BackgroundActivityService>('BackgroundActivityService', [
      'addTask',
      'removeTask',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UploadInterceptorService,
        { provide: BackgroundActivityService, useValue: bgActivitySpy },
        { provide: PEB_EDITOR_API_PATH, useValue: 'editor-api' },
      ],
    });

    service = TestBed.inject(UploadInterceptorService);
    bgActivity = TestBed.inject(BackgroundActivityService) as jasmine.SpyObj<BackgroundActivityService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should intercept request', () => {

    const reqMock = {
      method: 'POST',
      url: 'test',
      body: {},
    };
    const nextMock = {
      handle: jasmine.createSpy('handle').and.returnValue(of({ handled: true })),
    };

    // isApiRequest = FALSE
    service.intercept(reqMock as any, nextMock).subscribe((result: any) => {
      expect(result.handled).toBe(true);
      expect(bgActivity.addTask).not.toHaveBeenCalled();
      expect(bgActivity.removeTask).not.toHaveBeenCalled();
      expect(nextMock.handle).toHaveBeenCalledWith(reqMock);
    });

    // isApiRequest = TRUE
    reqMock.url = 'editor-api/test';
    reqMock.body = new FormData();

    service.intercept(reqMock as any, nextMock).subscribe((result: any) => {
      expect(result.handled).toBe(true);
      expect(bgActivity.addTask).toHaveBeenCalled();
      expect(nextMock.handle).toHaveBeenCalledWith(reqMock);
    }).unsubscribe();

    expect(bgActivity.removeTask).toHaveBeenCalled();

  });

});
