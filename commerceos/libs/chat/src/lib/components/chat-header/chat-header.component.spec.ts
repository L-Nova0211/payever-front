import { Overlay } from '@angular/cdk/overlay';
import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { PeGridSidenavService } from '@pe/grid';
import { PeChatHeaderComponent } from './chat-header.component';

describe('PeChatHeaderComponent', () => {
  let fixture: ComponentFixture<PeChatHeaderComponent>;
  let component: PeChatHeaderComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [],
        declarations: [PeChatHeaderComponent],
        providers: [Overlay, ViewContainerRef, DomSanitizer, PeGridSidenavService, ChangeDetectorRef],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeChatHeaderComponent);
          component = fixture.componentInstance;
          component.title = 'Dusan test';
          component.pinnedMessages = [];
          component.typingMembers = [];
          fixture.detectChanges();
        });
    }),
  );
  it('CallAvatar shouldn`t be called', async () => {
    spyOn(component, 'callAvatar');
    spyOn(component, 'callHandleArrow');

    let arrowButton = fixture.debugElement.nativeElement.querySelector('svg');

    arrowButton.dispatchEvent(new Event('mousedown'));

    fixture.whenStable().then(() => {
      expect(component.callHandleArrow).toHaveBeenCalled();
      expect(component.callAvatar).not.toHaveBeenCalled();
    });
  });
});
