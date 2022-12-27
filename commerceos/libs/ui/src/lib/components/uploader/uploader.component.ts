import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent {
  @Input() files: File[];

  value: string;
  progressBar: number;
  startProgress: any;
  @Input() set progress(val) {
    this.progressBar = val;
  }

  @Input() get theme() {
    return this.value;
  }

  set theme(value: string) {
    this.value = value;
  }

  @Output() cancelUploadEmitter = new EventEmitter();
  itemsUpload: number;

  dragEnd($event: CdkDragEnd) {}

  cancelUpload() {
    this.cancelUploadEmitter.emit(true);
  }
}
