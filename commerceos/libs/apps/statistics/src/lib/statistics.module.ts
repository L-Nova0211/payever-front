import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebDateTimePickerExtendedModule,
  PebDateTimePickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebRadioModule,
  PebSelectModule, PeMenuModule,
} from '@pe/ui';

import { StatisticsHeaderService } from './infrastructure';
import { PeStatisticsMaterialComponent } from './material/material.component';
import { PeHeaderMenuModule } from './misc/components/header-menu/header-menu.module';
import { StatisticsFieldComponent } from './misc/components/statistics-field/statistics-field.component';
import { SelectedOptionsPipe } from './misc/pipes/selected-options.pipe';
import { PeStatisticsEditFormComponent } from './overlay/edit-form/edit-statistics-form.component';
import { PeFieldFormComponent } from './overlay/field-form/field-form.component';
import { PeStatisticsFormComponent } from './overlay/form/statistics-form.component';
import { StatisticsAppComponent } from './overlay/statistics-app/statistics-app.component';
import { PeStatisticsOverlayComponent } from './overlay/statistics-overlay.component';
import { PeStatisticsWidgetSizeComponent } from './overlay/widget-size/widget-size.component';
import { WidgetStyleComponent } from './overlay/widget-style/widget-style.component';
import { PeStatisticsComponent } from './routes/_root/statistics-root.component';
import { AddWidgetComponent } from './routes/add-widget/add-widget.component';
import { EditActionComponent } from './routes/edit-action/edit-action.component';
import { PeStatisticsGridComponent } from './routes/grid/statistics-grid.component';
import { PeConfirmDialog } from './shared/confirm-dialog/confirm-dialog.component';
import { PeStatisticsRouteModule } from './statistics.routing';
import { PeStatisticsSharedModule } from './statistics.shared';
import { DetailedNumbersComponent } from './widgets/detailed-numbers/detailed-numbers.component';
import { LineGraphComponent } from './widgets/line-graph/line-graph.component';
import { PePercentageComponent } from './widgets/percentage/percentage.component';
import { SimpleNumbersComponent } from './widgets/simple-numbers/simple-numbers.component';
import { TwoColumnsComponent } from './widgets/two-columns/two-columns.component';
import { WidgetWrapperComponent } from './widgets/widget-wrapper/widget-wrapper.component';


const components = [
  PeStatisticsWidgetSizeComponent,
  PeStatisticsComponent,
  PeStatisticsGridComponent,
  PeStatisticsFormComponent,
  PeStatisticsOverlayComponent,
  PeStatisticsEditFormComponent,
];

export const i18nModuleForRoot: ModuleWithProviders<I18nModule> = I18nModule.forRoot();


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    PeStatisticsRouteModule,
    PeStatisticsSharedModule,
    PeDataGridModule,
    PeSidebarModule,
    PeFiltersModule,
    NgScrollbarModule,
    PePlatformHeaderModule,
    NgxChartsModule,
    OverlayWidgetModule,
    MatGridListModule,
    MatSnackBarModule,

    PebButtonModule,
    PebCheckboxModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PebSelectModule,
    PebRadioModule,
    PebFormBackgroundModule,
    PebExpandablePanelModule,
    PebButtonToggleModule,
    PebChipsModule,
    PebMessagesModule,
    PebDateTimePickerExtendedModule,
    PebDateTimePickerModule,
    PeMenuModule,
    PeHeaderMenuModule,

    MatAutocompleteModule,
    MatDatepickerModule,
    MatDialogModule,
    MatMenuModule,
    MatTabsModule,
    MatTableModule,
    ChartsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,

    i18nModuleForRoot,
  ],
  declarations: [
    ...components,

    PeStatisticsMaterialComponent,
    DetailedNumbersComponent,
    LineGraphComponent,
    SimpleNumbersComponent,
    TwoColumnsComponent,
    AddWidgetComponent,
    StatisticsAppComponent,
    EditActionComponent,
    PeFieldFormComponent,
    PePercentageComponent,
    WidgetStyleComponent,
    StatisticsFieldComponent,
    WidgetWrapperComponent,
    SelectedOptionsPipe,
    PeConfirmDialog,
  ],
  providers: [
    StatisticsHeaderService,
    PeOverlayWidgetService,
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } },
  ],
})
export class PeStatisticsModule {}
