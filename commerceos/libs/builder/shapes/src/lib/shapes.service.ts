import { Injectable } from '@angular/core';

import { PebShapesShape } from '@pe/builder-core';
import { TreeFilterNode } from '@pe/common';


@Injectable({
  providedIn: 'root',
})
export class PebShapesService {
  baseShape = {
    data: {
      text: null,
      variant: 'square',
    },
    type: 'shape',
    style: { borderRadius: 0, fontFamily: 'Roboto', fontSize: 13 },
  };

  SHAPES: PebShapesShape[] = [];

  ALBUMS: TreeFilterNode[] = [];
}
