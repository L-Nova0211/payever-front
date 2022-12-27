import { DebugElement, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PebButtonComponent } from './button';

describe('PebButtonComponent', () => {

  let fixture: ComponentFixture<PebButtonComponent>;
  let component: PebButtonComponent;
  let el: DebugElement;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        PebButtonComponent,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebButtonComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should add classes on construct', () => {

    const elem = el.nativeElement as HTMLElement;
    const elemMock = document.createElement('button');

    // w/o attributes
    expect(elem.classList).toContain('peb-base-button');

    // w/ attributes
    elemMock.setAttribute('peb-button', 'test');
    elemMock.setAttribute('peb-text-button', 'test');

    component = new PebButtonComponent(new ElementRef(elemMock));

    expect(elemMock.classList).toContain('peb-button');
    expect(elemMock.classList).toContain('peb-text-button');

  });

  it('should add classes on init', () => {

    const elem = el.nativeElement as HTMLElement;
    const elemMock = document.createElement('button');

    // w/o color & disabled
    component.ngOnInit();

    expect(component.hostAttrDisabled).toBeNull();
    expect(component.hostClassDisabled).toBeUndefined();

    // w/ color & disabled
    // w/o peb-text-button attr
    component.color = 'red';
    component.disabled = true;

    component.ngOnInit();

    expect(elem.classList).toContain('red');
    expect(elem.classList).not.toContain('text-red');
    expect(component.hostAttrDisabled).toBe(true);
    expect(component.hostClassDisabled).toBe(true);

    // w/ peb-text-button attr
    elemMock.setAttribute('peb-text-button', 'test');

    component = new PebButtonComponent(new ElementRef(elemMock));
    component.color = 'red';
    component.ngOnInit();

    expect(elemMock.classList).toContain('text-red');

  });

});
