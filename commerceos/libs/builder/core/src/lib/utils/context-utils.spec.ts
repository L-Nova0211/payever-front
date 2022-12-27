import { getLinkedValue, getPebInteraction, getPebInteractionPayload } from './context-utils';
import { PebInteractionType } from './interactions';

describe('Utils:Context', () => {

  it('should get linked value', () => {

    const obj = {
      id: 'obj',
      type: 'justObject',
      test: {
        value: 'testValue',
      },
    };
    const property = 'test.value';

    /**
     * argument object is null
     */
    expect(getLinkedValue(null, property)).toBeNull();

    /**
     * argument object is set
     * argument property is '' 
     */
    expect(getLinkedValue(obj, '')).toEqual(obj);

    /**
     * argument property is set
     */
    expect(getLinkedValue(obj, property)).toEqual(obj.test.value);

  });

  it('should get interaction payload', () => {

    const interaction = {
      interactionPayload: undefined,
    };
    const element = {
      id: 'obj',
      type: 'justObject',
      test: {
        value: 'testValue',
      },
    };

    // w/o interactionPayload
    expect(getPebInteractionPayload(interaction as any, element)).toBeNull();

    // w/ interactionPayload
    // w/o element
    interaction.interactionPayload = 'test.';
    expect(getPebInteractionPayload(interaction as any, null)).toBeNull();

    // interactionPayload = test.value
    // w/ element
    interaction.interactionPayload = 'test.value';
    expect(getPebInteractionPayload(interaction as any, element)).toEqual(element.test.value);

    // interactionPayload = test.[value]
    interaction.interactionPayload = 'test.[value]';
    expect(getPebInteractionPayload(interaction as any, element)).toBeNull();

  });

  it('should get interaction', () => {

    const interaction = {
      id: 'i-001',
      interactionType: PebInteractionType.CartClick,
      interactionPayload: 'test.value'
    };
    const element = {
      id: 'obj',
      type: 'justObject',
      test: {
        value: 'testValue',
      },
    };

    // type != null
    expect(getPebInteraction(interaction as any, element)).toEqual({
      type: interaction.interactionType,
      payload: element.test.value,
    });

    // type = null
    interaction.interactionType = null;

    expect(getPebInteraction(interaction as any, element)).toEqual({
      type: interaction.interactionType,
    });

  });

});
