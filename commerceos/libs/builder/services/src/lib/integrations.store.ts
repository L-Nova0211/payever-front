import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import {
  PebEditorIntegrationsStore,
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationActionTag,
  PebIntegrationData,
  PebIntegrationInteraction,
  PebIntegrationTag,
} from '@pe/builder-core';

export type PebIntegrationsStoreType = {
  integrations: PebIntegration[],
  dict: {
    integrations: { [id: string]: PebIntegration },
    actions: { [id: string]: PebIntegrationAction },
    links: { [id: string]: PebIntegrationData },
    interactions: { [id: string]: PebIntegrationInteraction },
  },
};

@Injectable()
export class PebBaseEditorIntegrationsStore implements PebEditorIntegrationsStore {

  private readonly integrationsStoreSubject = new BehaviorSubject<PebIntegrationsStoreType>({
    integrations: [], dict: { integrations: {}, actions: {}, links: {}, interactions: {} },
  });

  private get integrationsStore() {
    return this.integrationsStoreSubject.getValue();
  }

  readonly integrations$ = this.integrationsStoreSubject.asObservable().pipe(map(data => data.integrations));
  get integrations() {
    return this.integrationsStoreSubject.getValue().integrations;
  }

  constructor(private contextApi: PebContextApi) {
    this.contextApi.fetchIntegrations().pipe(
      first(),
      map(integrations => integrations?.reduce(
        (acc: PebIntegrationsStoreType, integration: PebIntegration) => {
          acc.integrations.push(integration);
          acc.dict.integrations[integration.id] = integration;
          integration.actions.forEach(action => acc.dict.actions[action.id] = action);
          integration.data?.forEach(link => acc.dict.links[link.id] = link);
          integration.interactions?.forEach(interaction => acc.dict.interactions[interaction.id] = interaction);

          return acc;
        },
        { integrations: [], dict: { integrations: {}, actions: {}, links: {}, interactions: {} } },
      )),
      tap(this.integrationsStoreSubject),
    ).subscribe();
  }

  getIntegrationByTag(tag: string | PebIntegrationTag): PebIntegration {
    return this.integrationsStore.integrations.find(integration => integration.tag === tag) ?? null;
  }

  getIntegrationActionsByTags(
    integrationTag: PebIntegrationTag | string,
    actionTag: PebIntegrationActionTag | string,
  ): PebIntegrationAction[] {
    const integration = this.getIntegrationByTag(integrationTag);

    return integration ?
      integration.actions.filter(action => action.tags.includes(actionTag)) : [];
  }

  getFirstIntegrationActionByTags(integrationTag: string, actionTag: string): PebIntegrationAction {
    const actions = this.getIntegrationActionsByTags(integrationTag, actionTag);

    return actions.length ? actions[0] : null;
  }

  getActionIntegration(actionId: string): PebIntegration {
    const action = this.integrationsStore.dict.actions[actionId];

    return action ? this.integrationsStore.dict.integrations[action.integration.id] ?? null : null;
  }
}
