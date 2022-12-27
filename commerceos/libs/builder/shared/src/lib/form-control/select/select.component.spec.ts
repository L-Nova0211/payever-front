import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

// import { PebEditor } from '@pe/builder-editor';

// import { PebEditorAccessorService } from '@pe/builder-services';

import { PebSelectComponent } from './select.component';

describe('SelectComponent', () => {

  let fixture: ComponentFixture<PebSelectComponent>;
  let component: PebSelectComponent;
  let editor: jasmine.SpyObj<PebEditor>;

  beforeEach(waitForAsync(() => {

    const editorSpy = jasmine.createSpyObj<PebEditor>('PebEditor', [
      'insertToSlot',
      'backTo',
    ]);

    const editorAccessorServiceMock = {
      editorComponent: editorSpy,
    };

    TestBed.configureTestingModule({
      declarations: [PebSelectComponent],
      providers: [
        { provide: PebEditor, useValue: editorSpy },
        { provide: PebEditorAccessorService, useValue: editorAccessorServiceMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSelectComponent);
      component = fixture.componentInstance;
      component.options = [
        { name: 'Opt 1', value: 'o-1' },
        { name: 'Opt 2', value: 'o-2' },
      ];

      editor = TestBed.inject(PebEditor) as jasmine.SpyObj<PebEditor>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should register on change', () => {

    const fn = () => { };

    component.registerOnChange(fn);

    expect(component.onChange).toEqual(fn);

  });

  it('should get editor', () => {

    expect(component.editor).toEqual(editor);

  });

  it('should register on touched', () => {

    const fn = () => { };

    component.registerOnTouched(fn);

    expect(component.onTouched).toEqual(fn);

  });

  it('should write value', () => {

    const nextSpy = spyOn(component.value$, 'next');

    /**
     * t option with value '0-3' does not exist
     */
    component.writeValue('0-3');

    expect(nextSpy).toHaveBeenCalledWith('');

    /**
     * option with value 'o-2' exists
     */
    component.writeValue('o-2');

    expect(nextSpy).toHaveBeenCalledWith('Opt 2');

  });

  it('should open options list', () => {

    const sidebarRef = {
      instance: {
        active: undefined,
        options: [],
        selected: of('o-1'),
        destroy$: new Subject(),
      },
    };
    const writeSpy = spyOn(component, 'writeValue');
    const changeSpy = jasmine.createSpy('onChange');
    const touchedSpy = jasmine.createSpy('onTouched');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchedSpy);

    editor.insertToSlot.and.returnValue(sidebarRef as any);

    // w/o ngControl
    component.openOptionList();

    expect(editor.optionList).toEqual({ back: 'Back', title: undefined });
    expect(sidebarRef.instance.active).toBeUndefined();
    expect(sidebarRef.instance.options).toEqual(component.options);
    expect(changeSpy).toHaveBeenCalledWith('o-1');
    expect(touchedSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
    expect(editor.backTo).toHaveBeenCalledWith('detail');

    // w/ ngControl
    component.ngControl = { value: 'o-1' } as any;
    component.openOptionList();

    expect(sidebarRef.instance.active).toEqual('o-1');

  });

});
