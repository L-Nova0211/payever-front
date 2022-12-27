import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PeStudioAlbum } from '../interfaces/studio-album.interface';
import { PeAttribute } from '../interfaces/studio-attributes.interface';
import { PeStudioCategory } from '../interfaces/studio-category.interface';

import { StudioAppModel, StudioAppState } from './studio.app.state';

@Injectable()
export class StudioStoreSelectors {
  @Select(state => state.studio.albums) albums$: Observable<PeStudioAlbum[]>;

  @Select(state => state.studio.attributes) attributes$: Observable<PeAttribute[]>;

  @Select() studio$: Observable<StudioAppModel>;

  @Select(StudioAppState.studioCategories) categories$: Observable<PeStudioCategory[]>;
}
