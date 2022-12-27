import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';

import { PagesDialogDataInterface } from '../pages.interface';

@Component({
  selector: 'pages-folder-dialog',
  templateUrl: './pages-folder-dialog.component.html',
  styleUrls: ['./pages-folder-dialog.component.scss'],
})
export class PebPagesFolderDialogComponent implements OnInit {
  form: FormGroup;
  folders: any;

  constructor(
    private dialogRef: MatDialogRef<PebPagesFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogData: PagesDialogDataInterface,
    private editorApi: PebEditorApi,
    private envService: PebEnvService,
    private formBuilder: FormBuilder,
  ) {}

  rootFolder = {
    ancestors: [],
    id: null,
    name: 'My Pages',
  };

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      location: new FormControl(null),
      name: new FormControl(null),
    });

    this.editorApi.getPageAlbumsFlatTree(this.envService.shopId, this.dialogData.themeId).pipe(
      tap((tree) => {
        this.folders = tree;
      }),
      take(1),
    ).subscribe();
  }

  close() {
    this.dialogRef.close(null);
  }

  save() {
    const { name, location: { id: parentId, image } } = this.form.value;
    const album = {
      name,
      parentId,
      image: image ?? 'assets/pages/album.svg',
      children: [],
    };

    this.dialogRef.close(album);
  }

}
