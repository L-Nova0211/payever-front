import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router';

import { InvoiceEditorComponent } from './invoice-editor.component';

const routes = [
  {
    path: '',
    component: InvoiceEditorComponent,    
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebInvoiceEditorRouting {}
