import { ChangeDetectorRef, EventEmitter } from '@angular/core';

export abstract class PebEditorAbstractToolbar {

  // // output
  abstract execCommand: EventEmitter<any>;

  // // methods
  abstract cdr: ChangeDetectorRef;
}
