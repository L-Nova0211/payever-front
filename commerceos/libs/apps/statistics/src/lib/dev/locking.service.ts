import { BehaviorSubject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

export class MockLockingService {

  locks = [];

  changes$ = new BehaviorSubject<void>(null);

  acquireLock(resource): Promise<{ release: () => void }> {
    return this.changes$.pipe(
      filter(() => this.lockAvailable(resource)),
      first(),
      map(() => ({
        release: () => {
          this.locks.splice(this.locks.findIndex(v => v === resource), 1);
          this.changes$.next();
        },
      })),
    ).toPromise();
  }

  private lockAvailable = (resource) => {
    if (!this.locks.includes(resource)) {
      this.locks.push(resource);

      return true;
    }

    return false;
  };
}

