import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { DragulaModule } from 'ng2-dragula';
import { ColorPickerModule } from 'ngx-color-picker';

import { AuthModule } from '@pe/auth';
import { FormComponentsColorPickerModule, FormModule } from '@pe/forms';
import { I18nModule, LANG } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebExpandablePanelModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
} from '@pe/ui';

import { ApolloConfigModule } from '../app.apollo.module';
import { CurrencyService } from '../shared/services/currency.service';
import { SharedModule } from '../shared/shared.module';

import { AssetsDragAndDropComponent } from './assets-drag-and-drop/assets-drag-and-drop.component';
import { CollectionEditorRoutingModule } from './collection-editor-routing.module';
import { CollectionEditorDescriptionComponent } from './components/editor-description/editor-description.component';
import { EditorImagesPaneComponent } from './components/editor-images-pane/editor-images-pane.component';
import { CollectionEditorMainSectionComponent, EditorContentSectionComponent } from './components/editor-sections';
import {
  EditorProductsSectionComponent,
} from './components/editor-sections/editor-products-section/editor-products-section.component';
import { CollectionEditorComponent } from './containers/editor/editor.component';
import { CollectionProductsResolver } from './resolvers/collection-products.resolver';
import { CollectionResolver } from './resolvers/collection.resolver';
import { CollectionSectionsService } from './services';





export const NewCollectionsEditorAuthModuleForRoot = AuthModule.forRoot();

export const NewCollectionsEditorDragulaModuleForRoot = DragulaModule;
const EXP: any[] = [
  AssetsDragAndDropComponent,
  CollectionEditorComponent,
  EditorImagesPaneComponent,
  CollectionEditorMainSectionComponent,
  EditorContentSectionComponent,
  CollectionEditorDescriptionComponent,
  EditorProductsSectionComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    MatProgressSpinnerModule,
    ApolloConfigModule,
    ApolloModule,
    HttpLinkModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    DragDropModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    NewCollectionsEditorDragulaModuleForRoot,
    MediaModule, // .forRoot()
    PETextEditorModule,
    ColorPickerModule,
    FormComponentsColorPickerModule,
    NewCollectionsEditorAuthModuleForRoot,
    I18nModule,
    SharedModule,
    CollectionEditorRoutingModule,

    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    PebSelectModule,
  ],
  declarations: [...EXP],
  exports: [],
  providers: [
    CollectionResolver,
    CollectionProductsResolver,
    CollectionSectionsService,
    CurrencyService,
    { provide: LANG, useValue: 'en' },
  ],
})
export class CollectionsEditorModule {}
