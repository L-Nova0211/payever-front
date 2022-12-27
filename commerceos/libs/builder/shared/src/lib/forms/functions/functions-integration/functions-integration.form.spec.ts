import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

// import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebFunctionsIntegrationForm } from './functions-integration.form';

describe('PebFunctionsIntegrationForm', () => {

  let fixture: ComponentFixture<PebFunctionsIntegrationForm>;
  let component: PebFunctionsIntegrationForm;
  let editorComponent: jasmine.SpyObj<PebEditor>;

  beforeEach(waitForAsync(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['backTo']);

    TestBed.configureTestingModule({
      declarations: [PebFunctionsIntegrationForm],
      providers: [
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebFunctionsIntegrationForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component.editor).toEqual(editorComponent);

  });

  it('should handle ng init', () => {

    const functions = [{ id: 'f-001' }];

    component.functions = functions;
    component.ngOnInit();

    expect(component.dataSource.data).toEqual(functions);

  });

  it('should check has child', () => {

    const node = { children: null };
    const children = [{ id: 'child-001' }];

    expect(component.hasChild(null, node)).toBe(false);

    node.children = children;
    expect(component.hasChild(null, node)).toBe(true);

  });

  it('should remove links', () => {

    const backToSpy = spyOn(component, 'backTo');
    const formMock = {
      patchValue: jasmine.createSpy('patchValue'),
    };

    component.formGroup = formMock as any;
    component.removeLinks();

    expect(formMock.patchValue).toHaveBeenCalledWith({
      integration: null,
      action: null,
      data: null,
      interaction: null,
    });
    expect(backToSpy).toHaveBeenCalledWith('main');

  });

  it('should go back to', () => {

    component.backTo('main');

    expect(editorComponent.backTo).toHaveBeenCalledWith('main');

  });

  it('should pick integration', () => {

    const backToSpy = spyOn(component, 'backTo');
    const integration = { test: 'integration' };
    const action = { test: 'action' };
    const interaction = { test: 'interaction' };
    const data = { test: 'data' };
    const formMock = {
      patchValue: jasmine.createSpy('patchValue'),
    };

    component.formGroup = formMock as any;
    component.pickIntegration({ integration, action, interaction, data });

    expect(formMock.patchValue).toHaveBeenCalledWith({
      integration,
      action,
      interaction,
      data,
    });
    expect(backToSpy).toHaveBeenCalledWith('main');

  });

});
