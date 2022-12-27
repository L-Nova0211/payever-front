import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { DockerService } from './docker.service';
import { DockerState } from './state/docker.state';

@NgModule({
  imports: [CommonModule, NgxsModule.forFeature([DockerState])],
  providers: [DockerService],
})
export class DockerModule {}
