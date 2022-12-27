import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { PebContextMenuComponent } from './context-menu';
import { PeContextMenuService } from './context-menu.service';


describe('PeContextMenuService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PebContextMenuComponent],
      imports: [
        OverlayModule,
      ],
      providers: [
        PeContextMenuService,
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [PebContextMenuComponent],
      },
    });
  })

  it('should be defined', () => {
    const service = TestBed.inject(PeContextMenuService);

    expect(service).toBeDefined();
  });

  it('should open context menu', () => {
    const service = TestBed.inject(PeContextMenuService);
    const overlay = TestBed.inject(Overlay);
    const overlayCreateSpy = spyOn(overlay, 'create');
    const event = new MouseEvent('click');

    const dialogRef = service.open(event);

    expect(overlayCreateSpy).toHaveBeenCalled();
    expect(dialogRef).toEqual((service as any).dialogRef);

    const overlayRef: OverlayRef = (dialogRef as any).overlayRef;
    expect(overlayRef).toBeDefined();
  });

});
