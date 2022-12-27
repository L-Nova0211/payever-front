import { MediaService } from '../services';

import { IconsPngUrlPipe } from './icons-png-url.pipe';

describe('IconsPngUrlPipe', () => {

  let pipe: IconsPngUrlPipe;
  let mediaService: jasmine.SpyObj<MediaService>;

  beforeEach(() => {

    mediaService = jasmine.createSpyObj<MediaService>('MediaService', {
      getIconsPngUrl: 'icon.png.url',
    });

    pipe = new IconsPngUrlPipe(mediaService);

  });

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    const icon = 'icon.png';

    expect(pipe.transform(icon)).toEqual('icon.png.url');
    expect(mediaService.getIconsPngUrl).toHaveBeenCalledWith(icon);

  });

});
