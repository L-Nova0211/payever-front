import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { I18nModule } from '@pe/i18n';

import { PeGridService } from '..';

import { PeGridMenuComponent } from './';
 
describe('PeGridMenuComponent', () => {
    let component: PeGridMenuComponent;
    let fixture: ComponentFixture<PeGridMenuComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [I18nModule.forChild(), MatIconModule, CommonModule],
            declarations: [PeGridMenuComponent],
            providers: [
                { provide: PeGridService, useValue: {} },
            ],
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(PeGridMenuComponent);
            component = fixture.componentInstance;
        });
    })
    );

    it('should create component', async () => {
        expect(component).toBeDefined();
    });

    it('should click on items', async () => {
        const selectSpy = spyOn(component, 'selected');
        const items = [
                { 
                    label: 'grid.toolbar.sort_menu.a_z',
                    value: {
                        direction: 'asc',
                        orderBy: 'content',
                    } ,
                },
                { 
                    label: 'grid.toolbar.sort_menu.z_a',
                    value: {
                        direction: 'desc',
                        orderBy: 'content',
                    } ,
                },
                { 
                    label: 'grid.toolbar.sort_menu.newest',
                    value: {
                        direction: 'desc',
                        orderBy: 'updatedAt',
                    } ,
                },
                { 
                    label: 'grid.toolbar.sort_menu.oldest',
                    value: {
                        direction: 'asc',
                        orderBy: 'updatedAt',
                    } ,
                },
            ];

        component.setMenu({
            items,
            title: 'grid.toolbar.sort_menu.title',
        });

        fixture.detectChanges();
        const menuItems  = fixture.debugElement.queryAll(By.css('.pe-grid-menu__item'));

        menuItems.forEach((item, index) => {
            item.nativeElement.dispatchEvent(new Event('click'));
            expect(selectSpy).toHaveBeenCalledWith(items[index]);
        });

        fixture.detectChanges();
        expect(selectSpy).toHaveBeenCalledTimes(4);
    });
});