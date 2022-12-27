import { WindowEventsService } from './window-events.service';

describe('WindowEventsService', () => {

  let service: WindowEventsService;

  beforeEach(() => {

    service = new WindowEventsService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get posted message', (done) => {

    const getSpy = spyOn<any>(service, 'getDataMessageFlow').and.callThrough();

    service.message$().subscribe((message) => {
      expect(getSpy).toHaveBeenCalled();
      expect(message.type).toEqual('message');
      expect(message.origin).toEqual(window.location.origin);
      expect(message.data).toEqual('test');
      done();
    });

    window.postMessage('test', window.location.origin);

  });

});
