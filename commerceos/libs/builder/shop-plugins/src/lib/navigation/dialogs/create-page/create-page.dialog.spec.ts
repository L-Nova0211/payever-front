import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OVERLAY_DATA } from '@pe/builder-base-plugins';
import { PebShopEditorCreatePageDialogComponent } from './create-page.dialog';

describe('PebShopEditorCreatePageDialogComponent', () => {

  let fixture: ComponentFixture<PebShopEditorCreatePageDialogComponent>;
  let component: PebShopEditorCreatePageDialogComponent;
  let data: any;

  beforeEach(waitForAsync(() => {

    data = {
      data: {
        label: 'label',
        pages: [
          { id: 'p-001' },
          { id: 'p-002' },
        ],
      },
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebShopEditorCreatePageDialogComponent],
      providers: [
        { provide: OVERLAY_DATA, useValue: data },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShopEditorCreatePageDialogComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.label).toEqual(data.data.label);
    expect(component.pages).toEqual(data.data.pages);

  });

  it('should set label and pages to undefined if they are not set', () => {

    component = new PebShopEditorCreatePageDialogComponent({ data: undefined } as any);

    expect(component.label).toBeUndefined();
    expect(component.pages).toBeUndefined();

  });

  it('should select page', () => {

    const page = component.pages[0];

    component.select(page);

    expect(data.emitter.next).toHaveBeenCalledWith(page);

  });

});
