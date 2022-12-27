import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { EnvService } from '@pe/common';

import { ConnectAppEditComponent } from './connect-app-edit.component';

describe('ConnectAppEditComponent', () => {

  let fixture: ComponentFixture<ConnectAppEditComponent>;
  let component: ConnectAppEditComponent;

  beforeEach(waitForAsync(() => {

    const routeMock = {
      snapshot: {
        params: {
          category: 'test',
          integrationName: 'Integration 1',
        },
      },
    };

    const envServiceMock = {
      posId: 'pos-001',
      businessId: 'b-001',
    };

    TestBed.configureTestingModule({
      declarations: [ConnectAppEditComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: EnvService, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ConnectAppEditComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get category', () => {

    expect(component.category).toEqual('test');

  });

  it('should get integration name', () => {

    expect(component.integrationName).toEqual('Integration 1');

  });

  it('should get back path', () => {

    expect(component.backPath).toEqual('/business/b-001/pos/pos-001/connect');

  });

});
