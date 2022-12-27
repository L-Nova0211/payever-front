import { PebShapesService } from './shapes.service';

describe('PebShapesService', () => {

  let service: PebShapesService;

  beforeEach(() => {

    service = new PebShapesService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();
    expect(service.baseShape).toEqual({
      data: {
        text: null,
        variant: 'square',
      },
      type: 'shape',
      style: { borderRadius: 0, fontFamily: 'Roboto', fontSize: 13 },
    });
    expect(service.SHAPES).toEqual([]);
    expect(service.ALBUMS).toEqual([]);

  });

});
