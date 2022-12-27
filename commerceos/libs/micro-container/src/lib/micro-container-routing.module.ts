import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MicroContainerComponent } from './components/micro-container/micro-container.component';

const routes: Routes = [
  {
    path: '**',
    component: MicroContainerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MicroContainerRoutingModule {}
