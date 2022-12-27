import { Router } from '@angular/router';

export function createApplicationUrl(router: Router, applicationId: string, path: string): string {
  const urlTree = router.parseUrl(router.url);
  const { segments } = urlTree.root.children.primary;
  segments[segments.length - 2].path = applicationId;
  segments[segments.length - 1].path = path;
  
  return router.serializeUrl(urlTree);
}
