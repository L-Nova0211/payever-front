import { DeviceType } from './interfaces/device-type.enum';
import { WindowEventsService } from './services/window-events.service';
import { WindowService } from './services/window/window.service';

export function createWindowServiceFactory(
  platformId: string,
  windowEventsService: WindowEventsService,
  deviceType: DeviceType,
): WindowService {
  return new WindowService(windowEventsService, platformId, deviceType);
}
