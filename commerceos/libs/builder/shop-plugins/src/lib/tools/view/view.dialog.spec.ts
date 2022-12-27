import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-shared';

import { OVERLAY_SHOP_DATA } from '../../misc/overlay.data';
import { ShopEditorSidebarTypes } from '../../misc/types';

import { PebEditorViewToolDialogComponent } from './view.dialog';

describe('PebEditorViewToolDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorViewToolDialogComponent>;
  let component: PebEditorViewToolDialogComponent;
  let data: any;

  beforeEach(waitForAsync(() => {

    const dataMock = {
      data: {
        sidebarsActivity: {
          [EditorSidebarTypes.Navigator]: false,
          [EditorSidebarTypes.Inspector]: false,
          [EditorSidebarTypes.Layers]: false,
        },
        pagesView: PebPageType.Master,
      },
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorViewToolDialogComponent],
      providers: [
        { provide: OVERLAY_SHOP_DATA, useValue: dataMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorViewToolDialogComponent);
      component = fixture.componentInstance;

      data = TestBed.inject(OVERLAY_SHOP_DATA);

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should activate/deactivate options on init', () => {

    // pagesView = master
    expect(component.options[ShopEditorSidebarTypes.EditMasterPages].active).toBe(true);
    expect(component.options[EditorSidebarTypes.Navigator].active).toBe(false);
    expect(component.options[EditorSidebarTypes.Inspector].active).toBe(false);
    expect(component.options[EditorSidebarTypes.Layers].active).toBe(false);

    // pagesView = replica
    component[`state`].pagesView = PebPageType.Replica;
    component[`state`].sidebarsActivity = {
      [EditorSidebarTypes.Navigator]: true,
      [EditorSidebarTypes.Inspector]: true,
      [EditorSidebarTypes.Layers]: false,
    };

    component.ngOnInit();

    expect(component.options[EditorSidebarTypes.Navigator].active).toBe(true);
    expect(component.options[EditorSidebarTypes.Inspector].active).toBe(true);
    expect(component.options[EditorSidebarTypes.Layers].active).toBe(false);

  });

  it('should set value', () => {

    // option IS disabled
    component.options.layers.disabled = true;
    component.setValue(EditorSidebarTypes.Layers);

    expect(data.emitter.next).not.toHaveBeenCalled();

    // option IS NOT disabled
    component.setValue(EditorSidebarTypes.Inspector);

    expect(data.emitter.next).toHaveBeenCalledWith(EditorSidebarTypes.Inspector);

  });

});
