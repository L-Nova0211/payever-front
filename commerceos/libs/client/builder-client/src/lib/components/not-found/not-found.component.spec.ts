import { Location } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebClientNotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {

  let fixture: ComponentFixture<PebClientNotFoundComponent>;
  let component: PebClientNotFoundComponent;
  let location: any;

  beforeEach(waitForAsync(() => {

    const locationMock = {
      back: jasmine.createSpy('back'),
    };

    TestBed.configureTestingModule({
      declarations: [
        PebClientNotFoundComponent,
      ],
      providers: [
        { provide: Location, useValue: locationMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebClientNotFoundComponent);
      component = fixture.componentInstance;

      location = TestBed.inject(Location);

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should go back', () => {

    component.goBack();

    expect(location.back).toHaveBeenCalled();

  });

});
