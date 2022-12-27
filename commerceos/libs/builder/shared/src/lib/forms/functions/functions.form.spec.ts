import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebFunctionType } from '@pe/builder-core';
// import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebFunctionsIntegrationForm } from '@pe/builder-shared';

import { PebFunctionsFormService } from './functions-form.service';
import { PebFunctionsForm } from './functions.form';

describe('EditorFunctionForm', () => {

  let fixture: ComponentFixture<PebFunctionsForm>;
  let component: PebFunctionsForm;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let functionsFormService: {
    elementFunctions$: Subject<any[]>;
    functions$: Subject<any[]>;
    getFilterActions: jasmine.Spy;
    setFunctions: jasmine.Spy;
  };

  beforeEach(waitForAsync(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['insertToSlot']);

    functionsFormService = {
      elementFunctions$: new Subject(),
      functions$: new Subject(),
      getFilterActions: jasmine.createSpy('getFilterActions'),
      setFunctions: jasmine.createSpy('setFunctions'),
    };

    TestBed.configureTestingModule({
      declarations: [PebFunctionsForm],
      providers: [
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebFunctionsFormService, useValue: functionsFormService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebFunctionsForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent);

  });

  it('should set integration title', () => {

    const nextSpy = spyOn(component.integrationTitleSubject$, 'next').and.callThrough();

    component.integrationTitle$.pipe(skip(1)).subscribe(title => expect(title).toEqual('test'));
    component.integrationTitle = 'test';

    expect(nextSpy).toHaveBeenCalledWith('test');

  });

  it('should set form group on construct', () => {

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });

  });

  it('should handle ng init', () => {

    const integrationTitleSetSpy = spyOnProperty(component, 'integrationTitle', 'set');
    const pristineSpy = spyOn(component.formGroup, 'markAsPristine');
    const untouchedSpy = spyOn(component.formGroup, 'markAsUntouched');
    const elementFunctions: any[] = [{ id: 'f-001' }];
    const func = {
      functionType: null,
      integration: null,
    };

    component.ngOnInit();

    expect(functionsFormService.getFilterActions).toHaveBeenCalled();
    expect(functionsFormService.setFunctions).not.toHaveBeenCalled();
    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(pristineSpy).not.toHaveBeenCalled();
    expect(untouchedSpy).not.toHaveBeenCalled();
    expect(integrationTitleSetSpy).not.toHaveBeenCalled();

    /**
     * emit functionsFormService.elementFunctions$
     */
    functionsFormService.elementFunctions$.next(elementFunctions);

    expect(component.functions).toEqual(elementFunctions);

    /**
     * emit functionsFormService.functions$ with multiple functions
     */
    functionsFormService.functions$.next(Array(2).fill(func));

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(integrationTitleSetSpy).toHaveBeenCalledWith('Multiple functions');
    expect(pristineSpy).not.toHaveBeenCalled();
    expect(untouchedSpy).not.toHaveBeenCalled();

    /**
     * emit functionsFormService.functions$ with single function
     * function.functionType is null
     * function.integration is null
     */
    functionsFormService.functions$.next([func]);

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: func,
    });
    expect(pristineSpy).toHaveBeenCalled();
    expect(untouchedSpy).toHaveBeenCalled();
    expect(integrationTitleSetSpy).toHaveBeenCalledWith(undefined);

    /**
     * function.functionType is PebFunctionType.Action
     * function.integration.title is null
     */
    func.functionType = PebFunctionType.Action;
    func.integration = { title: null };
    integrationTitleSetSpy.calls.reset();
    component.formGroup.reset({}, { emitEvent: false });
    functionsFormService.functions$.next([func]);

    expect(component.formGroup.value).toEqual({
      integration: func.integration,
      action: func,
      data: null,
      interaction: null,
    });
    expect(pristineSpy).toHaveBeenCalledTimes(2);
    expect(untouchedSpy).toHaveBeenCalledTimes(2);
    expect(integrationTitleSetSpy).toHaveBeenCalledWith(undefined);

    /**
     * function.functionType is PebFunctionType.SelectLink
     * function.integration.title is set
     */
    func.functionType = PebFunctionType.SelectLink;
    func.integration.title = 'payever Integration Title';
    component.formGroup.reset({}, { emitEvent: false });
    functionsFormService.functions$.next([func]);

    expect(component.formGroup.value).toEqual({
      integration: func.integration,
      action: null,
      data: func,
      interaction: null,
    });
    expect(pristineSpy).toHaveBeenCalledTimes(3);
    expect(untouchedSpy).toHaveBeenCalledTimes(3);
    expect(integrationTitleSetSpy).toHaveBeenCalledWith('Integration Title');

    /**
     * change component.formGroup.value
     * component.formGroup.value.integration is null
     */
    pristineSpy.calls.reset();
    untouchedSpy.calls.reset();
    functionsFormService.setFunctions.and.returnValue(of([of(null)]));
    integrationTitleSetSpy.calls.reset();

    component.formGroup.reset({}, { emitEvent: false });
    component.formGroup.patchValue({ integration: null });

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(pristineSpy).toHaveBeenCalled();
    expect(untouchedSpy).toHaveBeenCalled();
    expect(integrationTitleSetSpy).toHaveBeenCalledOnceWith(undefined);
    expect(functionsFormService.setFunctions).toHaveBeenCalledWith(component.formGroup.value);

    /**
     * component.formGroup.value.integration.title is null
     */
    component.formGroup.patchValue({
      integration: { title: null },
    });

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(integrationTitleSetSpy).toHaveBeenCalledWith(undefined);
    expect(functionsFormService.setFunctions).toHaveBeenCalledWith({
      integration: { title: null },
      action: null,
      data: null,
      interaction: null,
    });

    /**
     * component.formGroup.value.integration.title is set
     */
    component.formGroup.patchValue({
      integration: { title: 'Payever Integration Title' },
    });

    expect(component.formGroup.value).toEqual({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(integrationTitleSetSpy).toHaveBeenCalledWith('integration title');
    expect(functionsFormService.setFunctions).toHaveBeenCalledWith({
      integration: { title: 'Payever Integration Title' },
      action: null,
      data: null,
      interaction: null,
    });

  });

  it('should pick integration', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        functions: null,
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef as any);

    component.functions = [{ id: 'f-001' }];
    component.pick();

    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      PebFunctionsIntegrationForm,
      PebEditorSlot.sidebarDetail,
    );
    expect(editorComponent.detail).toEqual({ back: 'Back', title: 'Function' });
    expect(sidebarCmpRef.instance.formGroup).toEqual(component.formGroup);
    expect(sidebarCmpRef.instance.functions).toEqual(component.functions);

  });

});
