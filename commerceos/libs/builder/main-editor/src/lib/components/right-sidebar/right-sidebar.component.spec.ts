import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorRightSidebarComponent } from './right-sidebar.component';

describe('PebEditorRightSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorRightSidebarComponent>;
  let component: PebEditorRightSidebarComponent;
  let tabs: any[];

  beforeEach(waitForAsync(() => {

    tabs = [
      { title: 'Tab 1', active: true },
      { title: 'Tab 2', active: false },
    ];

    TestBed.configureTestingModule({
      declarations: [PebEditorRightSidebarComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorRightSidebarComponent);
      component = fixture.componentInstance;
      component.tabs = tabs;
      component.isDetail = true;
      component.detail = { title: 'Title', back: 'Back' };

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should emit back to', () => {

    const emitSpy = spyOn(component.backToOn, 'emit');

    component.backTo('test');

    expect(emitSpy).toHaveBeenCalledWith('test');

  });

  it('should select tab', () => {

    const tab = tabs[1];

    component.selectTab(tab);

    expect(tab.active).toBe(true);

  });

  it('should get active tab', () => {

    expect(component.getActiveTab()).toEqual(tabs[0]);

  });

});
