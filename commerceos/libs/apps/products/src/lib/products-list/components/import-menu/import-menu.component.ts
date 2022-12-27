import { HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { take, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

export interface ImportEventPayload {
  overwrite: boolean;
}

enum FileType {
  CSV,
  XML,
}

@Component({
  selector: 'pf-import-menu',
  templateUrl: 'import-menu.component.html',
  styleUrls: ['./import-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportMenuComponent {
  @Input() theme: AppThemeEnum;
  @Output() importCSV = new EventEmitter<ImportEventPayload>();
  @Output() importXML = new EventEmitter<ImportEventPayload>();
  @Output() selected = new EventEmitter<void>();

  overwrite = false;
  showCSVTooltip = false;
  showXMLTooltip = false;
  FileType: typeof FileType = FileType;

  constructor(
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    private httpClient: HttpClient,
    private handler: HttpBackend,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.loadCDNIcons([
      'import-csv',
      'import-xml',
      'overwrite',
    ]);
    this.httpClient = new HttpClient(handler);
  }

  downloadFile(event: Event, name: string) {
    event.preventDefault();
    this.httpClient
      .get(`${this.env.custom.cdn}/${name}`, {
        responseType: 'blob',
      })
      .pipe(
        take(1),
        tap((resp) => {
          saveAs(resp, name);
        }),
      )
      .subscribe();
  }

  selectImportFile(type: FileType, payload: ImportEventPayload) {
    if (type === FileType.CSV) {
      this.importCSV.emit(payload);
    } else if (type === FileType.XML) {
      this.importXML.emit(payload);
    }
    this.selected.emit();
  }

  closeMenuTooltip(e: Event, menuTriggerRef: MatMenuTrigger) {
    e.preventDefault();
    menuTriggerRef.closeMenu();
  }

  private loadCDNIcons(icons: string[]): void {
    icons.forEach((icon) => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    });
  }
}
