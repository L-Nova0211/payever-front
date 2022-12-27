import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, TemplateRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { PreviewType } from '../../interfaces/folder.interface';

@Component({
  selector: 'pe-preview-container',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewContainerComponent implements AfterViewInit {
  preview: SafeHtml | string;
  counterPosition: { 'bottom.px': number, 'left.px': number } = null;
  scaleValue = 1;

  readonly PreviewType: typeof PreviewType = PreviewType;

  private type: PreviewType;

  @ViewChild(TemplateRef, { static: true }) previewTemplate: TemplateRef<HTMLElement>;
  @ViewChild('viewBox') viewBox: ElementRef;

  @HostBinding('class.cdk-drag-placeholder') isPlaceholder = true;

  constructor(
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {

    setTimeout(() => {
      if (this.type == PreviewType.HTMLElement && this.scaleValue !== 1) {
        this.counterPosition = {
          'bottom.px': this.viewBox?.nativeElement?.offsetHeight - this.viewBox?.nativeElement?.offsetHeight * this.scaleValue,
          'left.px': this.viewBox?.nativeElement?.offsetWidth - this.viewBox?.nativeElement?.offsetWidth * this.scaleValue,
        }
        this.cdr.detectChanges();
      }
    })



  }

  setPreview(data: HTMLElement | string, type: PreviewType): void {
    this.type = type;
    if (type === PreviewType.HTMLElement) {
      this.preview = this.domSanitizer.bypassSecurityTrustHtml((data as HTMLElement).innerHTML);

      return;
    }

    this.preview = this.domSanitizer.bypassSecurityTrustResourceUrl((data as string));
  }
}
