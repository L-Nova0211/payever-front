import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PebEditorMasterChangesBannerComponent } from './master-changes-banner.component';

describe('PebEditorMasterChangesBannerComponent', () => {

  let fixture: ComponentFixture<PebEditorMasterChangesBannerComponent>;
  let component: PebEditorMasterChangesBannerComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorMasterChangesBannerComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorMasterChangesBannerComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle apply', () => {

    const emitSpy = spyOn(component.apply, 'emit');

    component.onApply();

    expect(emitSpy).toHaveBeenCalled();

  });

  it('should handle deny', () => {

    const emitSpy = spyOn(component.deny, 'emit');

    component.onDeny();

    expect(emitSpy).toHaveBeenCalled();

  });

});
