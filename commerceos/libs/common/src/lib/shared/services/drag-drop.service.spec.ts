import { PeDragDropService } from './drag-drop.service';

describe('PeDragDropService', () => {

  let service: PeDragDropService;

  beforeEach(() => {

    service = new PeDragDropService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set drag item', () => {

    const item = { test: true };

    service.setDragItem(item);

    expect(service.dragItem).toEqual(item);

  });

  it('should set drop item', () => {

    const item = { test: true };
    const nextSpy = spyOn(service.dragDropChange$, 'next');

    /**
     * setting drop item to undefined
     */
    service.setDropItem(undefined);

    expect(service.dropItem).toBeUndefined();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * setting drop item to mocked item
     */
    service.setDropItem(item);

    expect(service.dropItem).toEqual(item);
    expect(nextSpy).toHaveBeenCalledWith({
      dragItem: null,
      dropItem: item,
    });

  });

});
