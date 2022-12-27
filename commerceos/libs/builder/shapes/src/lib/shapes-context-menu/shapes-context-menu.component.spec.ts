import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SHAPES_CONTEXT_DATA } from '../shapes.common';
import { PebShapesContextMenuComponent } from './shapes-context-menu.component';

describe('PebShapesContextMenuComponent', () => {

  let fixture: ComponentFixture<PebShapesContextMenuComponent>;
  let component: PebShapesContextMenuComponent;

  const data = { options: null };

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebShapesContextMenuComponent],
      providers: [
        { provide: SHAPES_CONTEXT_DATA, useValue: data },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShapesContextMenuComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set options from data on construct', () => {

    const option = {
      title: 'Test',
      onClick: jasmine.createSpy('onClick'),
    };

    /**
     * data.options is null
     */
    expect(component.options).toEqual([]);

    /**
     * data.options is set
     */
    data.options = [option];

    fixture = TestBed.createComponent(PebShapesContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.options).toEqual([option]);

    const renderedOption: HTMLElement = fixture.debugElement.query(By.css('ul > li')).nativeElement;
    renderedOption.dispatchEvent(new MouseEvent('click'));
    expect(option.onClick).toHaveBeenCalled();

  });

});
