import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PebAutoHideScrollbarDirective } from './autohide-scrollbar.directive';

@Component({
  selector: 'test-cmp',
  template: '<div id="parent" pebAutoHideScrollBar><div id="child"></div></div>',
  styles: [`
    #parent {
      width: 300px;
      height: 300px;
      background-color: #333333;
      overflow-y: scroll;
    }
    #child {
      height: 1000px;
    }
  `],
})
class TestComponent { }

describe('PebAutoHideScrollbarDirective', () => {

  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let elem: HTMLElement;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [
        TestComponent,
        PebAutoHideScrollbarDirective,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
      elem = fixture.debugElement.query(By.css('#parent')).nativeElement;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle scroll', async () => {

    await new Promise((resolve) => {
      let count = 0;
      const mutationObserver = new MutationObserver((mutations, observer) => {
        const mutation = mutations.find(m => m.attributeName === 'class');
        if (mutation) {
          switch (count) {
            case 0:
              expect(mutation.target).toHaveClass('scrolling');
              count++;
              break;
            case 1:
              expect(mutation.target).not.toHaveClass('scrolling');
              observer.disconnect();
              resolve();
              break;
            default: break;
          }
        }
      });
      mutationObserver.observe(elem, { attributes: true });
      elem.scrollTo({ top: 120 });
    });

  });

});
