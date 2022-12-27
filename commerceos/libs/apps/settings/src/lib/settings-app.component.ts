import { Component, ElementRef, OnDestroy, TestabilityRegistry } from '@angular/core';

@Component({
  selector: 'settings-root',
  templateUrl: './settings-app.component.html',
})
export class SettingsAppComponent implements OnDestroy {
  showPlatformHeader = false;
  constructor(
    private registry: TestabilityRegistry,
    private element: ElementRef,
  ) {
  }

  ngOnDestroy(): void {
    this.registry.unregisterApplication(this.element.nativeElement);
  }
}
