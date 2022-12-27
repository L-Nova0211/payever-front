
import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';

import { EnvService, PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { SimpleLocaleConstantsService, TranslatePipe, TranslateService } from '@pe/i18n-core';
import { PeMediaEditorModule, PeMediaService, PE_MEDIA_CONTAINER } from '@pe/media';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PebButtonModule,
    PebButtonToggleModule,
    PebCheckboxModule,
    PebDateTimePickerModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PebMessagesComponent,
    PebSelectModule,
    PebTimePickerService,
    PeListModule,
    PeSearchModule,
} from '@pe/ui';

import { PeSocialApiService, PeSocialEnvService, PeSocialGridService } from '../../services';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { PeSocialPostEditorComponent } from './index';
import { NgxsModule } from '@ngxs/store';
import { PeGridModule, PeGridState } from '@pe/grid';
import { PeFoldersModule } from '@pe/folders';
import { HttpClientModule } from '@angular/common/http';

describe('PeSocialPostEditorComponent', () => {
    let fixture: ComponentFixture<PeSocialPostEditorComponent>;
    let component: PeSocialPostEditorComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                PebButtonModule,
                PebButtonToggleModule,
                PebCheckboxModule,
                PebDateTimePickerModule,
                PebExpandablePanelModule,
                PebFormBackgroundModule,
                PebFormFieldInputModule,
                PebFormFieldTextareaModule,
                PebSelectModule,
                PeGridModule,
                PeFoldersModule,
                PeListModule,
                PeMediaEditorModule,
                PeSearchModule,
                NgxsModule.forRoot([PeGridState]),
                HttpClientModule,
            ],
            declarations: [
                PeSocialPostEditorComponent,
                TranslatePipe,
                PebMessagesComponent,
            ],
            providers: [
                FormBuilder,
                { provide: MatDialog, useValue: {} },
                { provide: ConfirmScreenService, useValue: {} },
                { provide: EnvService, useValue: {} },
                { provide: PE_OVERLAY_CONFIG, useValue: {} },
                { provide: PE_OVERLAY_DATA, useValue: { id: 1 } },
                { provide: PebTimePickerService, useValue: { 
                    open() {
                        return { afterClosed: of(new Date('2022-03-17T03:24:00')) };
                    },
                 } },
                { provide: PeOverlayWidgetService, useValue: {} },
                { provide: PeMediaService, useValue: {} },
                SimpleLocaleConstantsService,
                TranslateService,
                PeDestroyService,
                { provide: PE_MEDIA_CONTAINER, useValue: {} },
                { provide: PeSocialApiService, useValue:
                    {
                        getSocialPost (id: any) { return of(); },
                    },
                },
                { provide:PeSocialEnvService , useValue:
                    {
                        businessIntegrations$: of(),
                    },
                },
                { provide:PeSocialGridService, useValue: {} },
                Overlay,
            ],
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(PeSocialPostEditorComponent);            
            component = fixture.componentInstance;
        });
    }));

    it('should be defined', () => {
        expect(component).toBeDefined();
    });

    it('should fromat the date correctly', () => {
        const timeControlFormControl = new FormControl(null);
        spyOn(timeControlFormControl, 'patchValue');
        component.openTimepicker({} as MouseEvent, timeControlFormControl);
        expect(timeControlFormControl.patchValue).toHaveBeenCalledWith('03:24 AM');
    });
});