import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PageContextMenuComponent } from './page-context-menu.component';

describe('PageContextMenuComponent', () => {

  let fixture: ComponentFixture<PageContextMenuComponent>;
  let component: PageContextMenuComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PageContextMenuComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PageContextMenuComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should do nothing on close context menu', () => {

    component.closeContextMenu();

    expect().nothing();

  });

});
