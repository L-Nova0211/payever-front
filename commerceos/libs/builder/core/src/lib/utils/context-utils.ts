import { PebIntegrationInteraction } from '../models/api';

import { PebInteraction, PebInteractionType, PebInteractionWithPayload } from './interactions';

export function getLinkedValue(obj: any, property: string): any {
  return property.length ? property.split('.').reduce(
    (acc, prop) => prop ? (acc?.[prop] ?? null) : acc,
    obj,
  ) : obj;
}

export function getPebInteractionPayload<P>(
  interaction: PebIntegrationInteraction,
  element: any,
): P {
  return interaction.interactionPayload?.split('.').reduce(
    (acc: P, prop, i) => {
      const matches = prop.match(/^\[(\w+)]$/);
      let propName = '';
      if (matches && matches[1]) {
        propName = element?.[matches[1]] ?? prop;
      } else {
        propName = prop;
      }

      return (i === 0 ? element?.[propName] : acc?.[propName]) ?? null;
    },
    element,
  ) ?? null;
}

export function getPebInteraction<P>(
  interaction: PebIntegrationInteraction,
  element: any,
): PebInteraction | PebInteractionWithPayload<P> {
  return {
    type: interaction.interactionType as PebInteractionType,
    ...(interaction.interactionType != null ? { payload: getPebInteractionPayload(interaction, element) } : null),
  };
}
