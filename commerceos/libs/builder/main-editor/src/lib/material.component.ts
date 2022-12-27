import { Component, ViewEncapsulation } from '@angular/core';

/**
 *  Sole purpose of this component is to make sure that material styles
 *  are defined in general scope.
 *
 *  In would be better to get rid of this if/when commerceOS reliably will
 *  include material styles in it's entry point.
 *
 *  Exposing styles in editor.component doesn't work well because it breaks style
 *  encapsulation for other builder styles.
 */
@Component({
  selector: 'peb-editor-material-style',
  template: '',
  styleUrls: ['./material.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebEditorMaterialComponent {}
