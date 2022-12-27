import { PebAddToSelectionAction, PebDeselectAllAction, PebSelectAction } from './element-selection.actions';

describe('Actions:Element Selection', () => {

  it('should test peb select action', () => {

    const payload = 'test';

    expect(PebSelectAction.type).toEqual('[Peb/Selection] Select');
    const action = new PebSelectAction(payload);
    expect(action.payload).toEqual(payload);

  });

  it('should test peb add to selection action', () => {

    const payload = ['test', 'test2'];

    expect(PebAddToSelectionAction.type).toEqual('[Peb/Selection] Add to Selection');
    const action = new PebAddToSelectionAction(payload);
    expect(action.payload).toEqual(payload);

  });

  it('should test peb deselect all action', () => {

    expect(PebDeselectAllAction.type).toEqual('[Peb/Selection] Deselect All');

  });

});
