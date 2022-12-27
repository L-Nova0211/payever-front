import { Observable } from 'rxjs';

import {
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationActionTag,
  PebIntegrationTag,
} from './models/api';

export abstract class PebEditorIntegrationsStore {
  abstract integrations$: Observable<PebIntegration[]>;
  abstract integrations: PebIntegration[];
  abstract getIntegrationByTag(tag: string | PebIntegrationTag): PebIntegration;
  abstract getIntegrationActionsByTags(
    integrationTag: PebIntegrationTag | string,
    actionTag: PebIntegrationActionTag | string,
  ): PebIntegrationAction[];
  abstract getFirstIntegrationActionByTags(integrationTag: string, actionTag: string): PebIntegrationAction;
  abstract getActionIntegration(actionId: string): PebIntegration;
}
