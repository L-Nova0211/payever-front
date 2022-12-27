import { BackgroundActivityService } from './background-activity.service';

describe('BackgroundActivityService', () => {

  let service: BackgroundActivityService;

  beforeEach(() => {

    service = new BackgroundActivityService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should add/remove task', () => {

    const nextSpy = spyOn(service[`activeRequestCount$`], 'next').and.callThrough();

    service.hasActiveTasks$.subscribe((result) => {
      expect(result).toBe(false);
    }).unsubscribe();

    /**
     * add task
     */
    service.addTask();

    expect(nextSpy).toHaveBeenCalledWith(1);
    service.hasActiveTasks$.subscribe((result) => {
      expect(result).toBe(true);
    }).unsubscribe();

    /**
     * remove task
     */
    service.removeTask();

    expect(nextSpy).toHaveBeenCalledWith(0);
    service.hasActiveTasks$.subscribe((result) => {
      expect(result).toBe(false);
    }).unsubscribe();

    /**
     * should throw error on removeTask if tasks count is already 0
     */
    expect(() => {
      service.removeTask();
    }).toThrowError('Background activity task counter is negative');

  });

});
