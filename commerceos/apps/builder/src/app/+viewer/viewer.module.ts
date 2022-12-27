import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { PebContextService } from '@pe/builder-context';
import { PebRendererModule } from '@pe/builder-renderer';
import { PebViewerModule } from '@pe/builder-viewer';

import { SandboxViewerComponent } from './viewer.component';
import { SandboxViewerDataResolver } from './viewer.resolver';

const routes: Routes = [
  {
    path: ':type/:identifier',
    component: SandboxViewerComponent,
    resolve: { data: SandboxViewerDataResolver },
  },
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forChild(routes),
    PebRendererModule,
    PebViewerModule.forRoot(),
  ],
  providers: [
    SandboxViewerDataResolver,
    PebContextService,
  ],
  declarations: [
    SandboxViewerComponent,
  ],
})
export class SandboxViewerModule {
}
