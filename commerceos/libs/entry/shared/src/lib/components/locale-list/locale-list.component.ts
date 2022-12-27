import { Component, Inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { PE_OVERLAY_DATA, PE_OVERLAY_SAVE } from "@pe/overlay-widget";


@Component({
  selector: 'cos-locale-list',
  templateUrl: './locale-list.component.html',
  styleUrls: ['./locale-list.component.scss']
})
export class CosLocaleListComponent {

  constructor(
    @Inject(PE_OVERLAY_DATA) public data: any,
    @Inject(PE_OVERLAY_SAVE) public onSaveSubject$: BehaviorSubject<any>,
  ) {

  }

  cancel() {
    this.onSaveSubject$.next(null);
  }

  done(locale?) {
    this.onSaveSubject$.next(locale ?? this.data.currentLocale);
  }
}