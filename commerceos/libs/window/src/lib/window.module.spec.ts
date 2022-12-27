import { TestBed } from '@angular/core/testing';

import { WindowService } from './services';
import { WindowModule } from './window.module';

describe('WindowModule', () => {
  it('should export all content', () => {
    TestBed.configureTestingModule({
      imports: [WindowModule],
    });

    const windowService: WindowSessionStorage = TestBed.get(WindowService);
    expect(windowService).toBeTruthy();
    expect(windowService instanceof WindowService).toBe(true);
  });
});
