import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PE_ENV } from '@pe/common';

import { ImportMenuComponent } from './import-menu.component';

@Pipe({ name: 'translate' })
class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('ImportMenuComponent', () => {
  let component: ImportMenuComponent;
  let fixture: ComponentFixture<ImportMenuComponent>;
  let loader: HarnessLoader;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ImportMenuComponent, TranslatePipe],
        imports: [MatMenuModule, NoopAnimationsModule],
        providers: [
          ImportMenuComponent,
          { provide: HttpClient, useValue: {} },
          { provide: HttpBackend, useValue: {} },
          { provide: PE_ENV, useValue: {} }],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents().then(() => {
        fixture = TestBed.createComponent(ImportMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
    }),
  );

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should open and close menu', async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    expect(await menu.isOpen()).toBe(false);
    await menu.open();
    expect(await menu.isOpen()).toBe(true);
    await menu.close();
    expect(await menu.isOpen()).toBe(false);
  });

  it('should download file on link click', async () => {
    let selectFileSpy = spyOn(component, 'selectImportFile');
    let downloadFileSpy = spyOn(component, 'downloadFile');
    fixture.debugElement.nativeElement.querySelector('button').click();

    fixture.whenStable().then(() => {
      fixture.debugElement.nativeElement.querySelector('a').click();
      expect(selectFileSpy).toHaveBeenCalled();
      expect(downloadFileSpy).toHaveBeenCalled();
    });
  });
});
