import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PAGES_CONTEXT_DATA, PebPagesContextMenuComponent } from './pages-context-menu.component';

describe('PebPagesContextMenuComponent', () => {

  let fixture: ComponentFixture<PebPagesContextMenuComponent>;
  let component: PebPagesContextMenuComponent;
  let data: { options: any[]; };

  beforeEach(waitForAsync(() => {

    data = { options: null };

    TestBed.configureTestingModule({
      declarations: [PebPagesContextMenuComponent],
      providers: [
        { provide: PAGES_CONTEXT_DATA, useValue: data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPagesContextMenuComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set options on construct', () => {

    const options = [{
      title: 'Test',
      onClick: () => null,
    }];

    /**
     * data.options is null
     */
    expect(component.options).toEqual([]);

    /**
     * data.options is set
     */
    data.options = options;

    fixture = TestBed.createComponent(PebPagesContextMenuComponent);
    component = fixture.componentInstance;

    expect(component.options).toEqual(options);

  });

});
