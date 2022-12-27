import { MediaService, MediaUrlTypeEnum } from '../services';

import { MediaUrlPipe } from './media-url.pipe';

describe('MediaUrlPipe', () => {

  let pipe: MediaUrlPipe;
  let mediaService: jasmine.SpyObj<MediaService>;

  beforeEach(() => {

    mediaService = jasmine.createSpyObj<MediaService>('MediaService', ['getMediaUrl']);

    pipe = new MediaUrlPipe(mediaService);

  });

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    const blob = 'image.jpg';
    const container = 'container';
    const type = MediaUrlTypeEnum.Blurred;
    const size = '1920x1080';
    let result: string;

    mediaService.getMediaUrl.and.callFake((b, c, t, s) => {
      return `${c}/${b}?type=${t || ''}&size=${s || ''}`;
    });

    /**
     * arguments type & size for transform function are both null as default
     */
    result = pipe.transform(blob, container);

    expect(result).toEqual(`${container}/${blob}?type=&size=`);
    expect(mediaService.getMediaUrl).toHaveBeenCalledWith(blob, container, null, null);

    /**
     * arguments type & size for transform function are both set
     */
    result = pipe.transform(blob, container, type, size);

    expect(result).toEqual(`${container}/${blob}?type=${type}&size=${size}`);
    expect(mediaService.getMediaUrl).toHaveBeenCalledWith(blob, container, type, size);

  });

});
