import { QueryList } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorTabsComponent } from './tabs.component';

describe('PebEditorTabsComponent', () => {

  let fixture: ComponentFixture<PebEditorTabsComponent>;
  let component: PebEditorTabsComponent;

  beforeEach(waitForAsync(() => {

    const tabsList = [
      {
        title: 'Tab 1',
        active: false,
        hidden: false,
      },
      {
        title: 'Tab 2',
        active: false,
        hidden: false,
      },
    ];

    TestBed.configureTestingModule({
      declarations: [PebEditorTabsComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorTabsComponent);
      component = fixture.componentInstance;
      component.tabs = new QueryList();
      component.tabs.reset(tabsList);

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should select active tab after content init', () => {

    const selectTabSpy = spyOn(component, 'selectTab').and.callThrough();

    // w/o active index
    component.ngAfterContentInit();

    expect(component.tabs.first.active).toBe(true);
    expect(selectTabSpy).toHaveBeenCalledWith(component.tabs.first);
    selectTabSpy.calls.reset();

    // w/ active index
    component.tabs.first.active = false;
    component.tabs.last.active = true;

    component.ngAfterContentInit();

    expect(selectTabSpy).not.toHaveBeenCalled();

  });


  it('should select tab on changes', () => {

    const selectTabSpy = spyOn(component, 'selectTab').and.callThrough();
    const changes = {
      activeTabIndex: {
        currentValue: 1,
      },
    };

    // w/o changes
    component.ngOnChanges(null);

    expect(selectTabSpy).not.toHaveBeenCalled();

    // w/o active tab index
    component.ngOnChanges({});

    expect(selectTabSpy).not.toHaveBeenCalled();

    // w/ changes
    component.ngOnChanges(changes as any);

    expect(selectTabSpy).toHaveBeenCalledWith(component.tabs.last);
    expect(component.tabs.last.active).toBe(true);

  });

});
