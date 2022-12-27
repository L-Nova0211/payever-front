import { PebShop } from './models/client';
import { PebThemeDetailInterface, PebThemePageInterface } from './models/database';

export function snapshotToSourceConverter(
  { snapshot, pages }: {
    snapshot: PebThemeDetailInterface,
    pages: PebThemePageInterface[],
  },
): PebShop {

  return {
    pages,
    data: snapshot.application.data,
    routing: snapshot.application.routing,
    context: snapshot.application.context,
  } as any;
}
