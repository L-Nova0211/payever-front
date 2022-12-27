import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MicroLoaderService } from '../../services';

import { LoadMicroComponent } from './load-micro.component';

describe('LoadMicroComponent', () => {

  let fixture: ComponentFixture<LoadMicroComponent>;
  let component: LoadMicroComponent;
  let microLoader: jasmine.SpyObj<MicroLoaderService>;

  beforeEach(async(() => {

    const microLoaderSpy = jasmine.createSpyObj<MicroLoaderService>('MicroLoaderService', {
      loadBuild: of(true),
      loadInnerMicroBuildEx: of(true),
    });

    TestBed.configureTestingModule({
      declarations: [
        LoadMicroComponent,
      ],
      providers: [
        { provide: MicroLoaderService, useValue: microLoaderSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(LoadMicroComponent);
      component = fixture.componentInstance;

      microLoader = TestBed.inject(MicroLoaderService) as jasmine.SpyObj<MicroLoaderService>;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set micro', () => {

    const micro = 'test.micro';
    const nextSpy = spyOn(component.isLoadingSubject, 'next');

    component.setMicro = micro;

    expect(nextSpy).toHaveBeenCalledTimes(2);
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(microLoader.loadBuild).toHaveBeenCalledWith(micro);

  });

  it('should set inner micro', () => {

    const micro = 'test.micro';
    const innerMicro = 'test.inner.micro';
    const subPath = 'test.subpath';
    const nextSpy = spyOn(component.isLoadingSubject, 'next');

    component.setInnerMicro = { micro, innerMicro, subPath };

    expect(nextSpy).toHaveBeenCalledTimes(2);
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(nextSpy).toHaveBeenCalledWith(false);
    expect(microLoader.loadInnerMicroBuildEx).toHaveBeenCalledWith(micro, innerMicro, subPath);

  });

  it('should emit loading status changes after init', () => {

    const nextSpy = spyOn(component.isLoadingEmitter, 'next');

    /**
     * setting isLoadingSubject to TRUE
     */
    component.isLoadingSubject.next(true);

    expect(nextSpy).toHaveBeenCalledWith(true);

    /**
     * setting isLoadingSubject to FALSE
     */
    component.isLoadingSubject.next(false);

    expect(nextSpy).toHaveBeenCalledWith(false);

  });

});
