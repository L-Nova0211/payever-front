import {
  Component,
  EventEmitter,
  HostBinding,
  Inject,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { StudioApiService } from '../../../core';

@Component({
  selector: 'lib-preview',
  templateUrl: './pe-preview.component.html',
  styleUrls: ['./pe-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PePreviewComponent implements OnInit {
  @HostBinding('class') previewModal = 'pe-preview-modal';

  @Output() detachOverlay = new EventEmitter<void>();

  formOpenByMeDate = Date.now();

  form: FormGroup;
  uploaded: false;
  theme: string;
  constructor(
    private fb: FormBuilder,
    private peMediaService: StudioApiService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public detailImageData: any,
  ) {}

  ngOnInit(): void {
    this.theme = this.detailImageData.theme;
    this.form = this.fb.group({
      name: [],
      createdAt: [],
      mediaType: [],
      updatedAt: [],
      url: [],
      _id: [],
      business: [],
      mediaInfo: this.fb.group({
        dimension: [],
        size: [],
        type: [],
      }),
      price: [],
      license: [],
      dimension: [],
      location: [],
      duration: [],
      owner: [],
    });
    this.form.patchValue(this.detailImageData);
    this.form.disable();
  }

  get formDate() {
    return this.form.get('createdAt').value;
  }

  get formUpdatedDate() {
    return this.form.get('updatedAt').value;
  }

  uploadMedia($event: Event) {}
  downloadImage() {
    this.peMediaService.downloadMedia(this.detailImageData.url);
  }

  closeDialog() {
    this.dialog.closeAll();
    this.detachOverlay.emit();
  }
}
