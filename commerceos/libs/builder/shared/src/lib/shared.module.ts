import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';

import { PebRendererModule, PebRendererSharedModule } from '@pe/builder-renderer';
import { PeDestroyService } from '@pe/common';


import { EditorContextMenuComponent } from './context-menu/context-menu.component';
import { PebDirectivesModule } from './directives';
import { PebFormControlModule } from './form-control';
import { PebTextareaComponent } from './form-control/textarea';
import {
  EditorAlignmentForm,
  EditorBorderStyleForm,
  EditorBuildOrderForm,
  EditorCopyChangesDetailForm,
  EditorDescriptionForm,
  EditorImageAdjustmentForm,
  EditorImageSizeDetailForm,
  EditorImageSizeForm,
  EditorMotionForm,
  EditorOpacityForm,
  EditorStudioMediaForm,
  PebBackgroundForm,
  PebBorderRadiusFormModule,
  PebColorForm,
  PebCopyChangesForm,
  PebDimensionsFormModule,
  PebFunctionsForm,
  PebFunctionsIntegrationForm,
  PebGridBorderForm,
  PebGridLayoutFormModule,
  PebLinkFormModule,
  PebMotionDetailForm,
  PebMotionEventDetailForm,
  PebMotionEventForm,
  PebPositionFormModule,
  PebSectionForm,
  PebShapeBorderForm,
  PebShapeOpacityForm,
  PebTextFormModule,
  PebVideoForm,
} from './forms';
import { PebFunctionsFormService } from './forms/functions/functions-form.service';
import { PebRestrictAccessFormModule } from './forms/restrict-access/restrict-access-form.module';
import { PebSeoForm, PebSeoFormService } from './forms/seo';
import { PebLanguagesFormComponent, PebLanguagesFormService } from './forms/languages';
import { LanguagesListComponent } from './forms/languages/languages-list/languages-list.component';
import { PebEditorIconsModule } from './icons';
import { SidebarCheckboxInput, SidebarFileInput, SidebarTextInput } from './inputs';
import { PebPreviewRendererComponent } from './preview-renderer';
import {
  PebEditorDynamicFieldComponent,
  PebEditorDynamicFieldsComponent,
  PebEditorExpandablePanelComponent,
  PebEditorTabComponent,
  PebEditorTabsComponent,
} from './ui';

const components = [
  PebEditorExpandablePanelComponent,
  PebEditorDynamicFieldsComponent,
  PebEditorDynamicFieldComponent,
  EditorContextMenuComponent,
  PebPreviewRendererComponent,
  LanguagesListComponent,
];

const inputs = [
  SidebarFileInput,
  SidebarTextInput,
  SidebarCheckboxInput,
];


const newForms = [
  PebColorForm,
];

const newFormsInputComponents = [
  PebTextareaComponent,
];

const forms = [
  EditorAlignmentForm,
  EditorBorderStyleForm,
  EditorBuildOrderForm,
  EditorCopyChangesDetailForm,
  EditorDescriptionForm,
  EditorImageAdjustmentForm,
  EditorImageSizeDetailForm,
  EditorImageSizeForm,
  EditorMotionForm,
  EditorOpacityForm,
  EditorStudioMediaForm,
  PebBackgroundForm,
  PebCopyChangesForm,
  PebFunctionsForm,
  PebFunctionsIntegrationForm,
  PebGridBorderForm,
  PebMotionDetailForm,
  PebMotionEventDetailForm,
  PebMotionEventForm,
  PebVideoForm,
  PebLanguagesFormComponent,
  PebSeoForm,
  PebShapeBorderForm,
  PebShapeOpacityForm,
  PebSectionForm,
];

const old = [
  PebEditorTabsComponent,
  PebEditorTabComponent,
];

@NgModule({
  declarations: [
    components,
    ...inputs,
    ...forms,
    ...old,
    ...newForms,
    ...newFormsInputComponents,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PebFormControlModule,
    PebEditorIconsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    CdkOverlayModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    PebRendererModule,
    PebLinkFormModule,
    PebPositionFormModule,
    PebTextFormModule,
    PebRestrictAccessFormModule,
    PebDirectivesModule,
    MatTreeModule,
    PebRendererSharedModule,
  ],
  exports: [
    components,
    ...inputs,
    ...forms,
    ...old,
    ...newForms,
    ...newFormsInputComponents,
    PebBorderRadiusFormModule,
    PebDimensionsFormModule,
    PebFormControlModule,
    PebGridLayoutFormModule,
    PebPositionFormModule,
    PebTextFormModule,
    PebLinkFormModule,
    PebRestrictAccessFormModule,
  ],
  providers: [
    PebFunctionsFormService,
    PebLanguagesFormService,
    PebSeoFormService,
    PeDestroyService,
  ],
})
export class PebEditorSharedModule {
}
