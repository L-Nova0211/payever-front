import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GuidelinePosition } from './guidelines'
import { MarkerPosition, PebGuidelinesControl } from './guidelines.control';


describe('PebEditorGuidelinesControl', () => {

  let fixture: ComponentFixture<PebGuidelinesControl>;
  let component: PebGuidelinesControl;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebGuidelinesControl],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebGuidelinesControl);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get marker', () => {

    const markerScale = .75;

    component.scale = 2;
    expect(component.markerScale).toBe(markerScale);
    expect(component.marker).toEqual({
      markerWidth: 12 * markerScale,
      markerHeight: 10 * markerScale,
      refX: 7 * markerScale,
      refY: 5 * markerScale,
      points: `0 0, ${6 * markerScale} ${5 * markerScale}, 0 ${10 * markerScale}`,
    });

  });

  it('should set guidelines', () => {

    const nextSpy = spyOn(component[`guidelinesSubject$`], 'next').and.callThrough();
    const guidelines = [{
      minX: 10,
      minY: 10,
      maxX: 150,
      maxY: 150,
    }];

    component.guidelines = guidelines;

    expect(nextSpy).toHaveBeenCalledWith(guidelines);
    component.guidelines$.subscribe(res => expect(res).toEqual(guidelines));

  });

  it('should set space width', () => {

    const nextSpy = spyOn(component[`spaceWidthSubject$`], 'next').and.callThrough();

    component.spaceWidth = 13;

    expect(nextSpy).toHaveBeenCalledWith(13);
    component.spaceWidth$.subscribe(res => expect(res).toBe(13));

  });

  it('should get guideline width', () => {

    const guideline = {
      minX: 100,
      minY: 120,
      maxX: 300,
      maxY: 120,
    };

    /**
     * guideline.minY is equal to maxY
     */
    expect(component.getGuidelineWidth(guideline)).toBe(guideline.maxX - guideline.minX);

    /**
     * guideline.minY is NOT equal to maxY
     */
    guideline.maxY = guideline.minY + 100;
    expect(component.getGuidelineWidth(guideline)).toBe(guideline.maxY - guideline.minY);

  });

  it('should get marker url', () => {

    /**
     * argument position is MarkerPosition.Start
     */
    expect(component.getMarkerUrl(13, MarkerPosition.Start)).toEqual('url(#start-13)');

    /**
     * argument position is MarkerPosition.End
     */
    expect(component.getMarkerUrl(7, MarkerPosition.End)).toEqual('url(#end-7)');

  });

  it('should get marker orient', () => {

    const guideline = {
      minX: 120,
      minY: 100,
      maxX: 320,
      maxY: 500,
    };

    /**
     * argument position is MarkerPosition.Start
     * guideline.minY is NOT equal to guideline.maxY
     */
    expect(component.getMarkerOrient(guideline, MarkerPosition.Start)).toBe(-90);

    /**
     * guideline.minY is equal to guideline.maxY
     */
    guideline.maxY = guideline.minY;
    expect(component.getMarkerOrient(guideline, MarkerPosition.Start)).toBe(180);

    /**
     * argument position is MarkerPosition.End
     */
    expect(component.getMarkerOrient(guideline, MarkerPosition.End)).toBe(0);

    /**
     * guideline.minY is NOT equal to guideline.maxY
     */
    guideline.maxY = guideline.minY + 100;
    expect(component.getMarkerOrient(guideline, MarkerPosition.End)).toBe(90);

  });

  it('should get path offset', () => {

    const guideline = { position: null };
    const positionOffsetMap = new Map<GuidelinePosition, number>([
      [GuidelinePosition.Top, -0.75],
      [GuidelinePosition.Left, -0.75],
      [GuidelinePosition.Right, 0.75],
      [GuidelinePosition.Bottom, 0.75],
    ]);

    /**
     * guideline.position is null
     */
    expect(component.getPathOffset(guideline)).toBe(0);

    /**
     * guideline.position is set
     */
    positionOffsetMap.forEach((offset, position) => {
      guideline.position = position;
      expect(component.getPathOffset(guideline)).toBe(offset);
    });

  });

  it('should make guideline path', () => {

    const guideline = {
      minX: 20,
      minY: 10,
      maxX: 200,
      maxY: 320,
      position: GuidelinePosition.Top,
    };

    function normalizeResult(res: string): string {
      return res.replace(/\n\s+/g, ' ');
    }

    component.scale = 0.5;

    /**
     * argument position is null
     * guideline.minY is NOT equal to guideline.maxY
     */
    let result = component.makeGuidelinePath(guideline, null);

    expect(normalizeResult(result)).toEqual('m 10 5 l -0.75 155');

    /**
     * guideline.minY is equal to guideline.maxY
     */
    guideline.maxY = guideline.minY;
    result = component.makeGuidelinePath(guideline, null);

    expect(normalizeResult(result)).toEqual('m 10 5 l 90 -0.75');

    /**
     * argument position is MarkerPosition.Start
     */
    result = component.makeGuidelinePath(guideline, MarkerPosition.Start);

    expect(normalizeResult(result)).toEqual('m 10.75 -2.5 l 0 15');

    /**
     * argument position is MarkerPosition.End
     */
    result = component.makeGuidelinePath(guideline, MarkerPosition.End);

    expect(normalizeResult(result)).toEqual('m 99.25 -2.5 l 0 15');

    /**
     * argument position is MarkerPosition.Start
     * guideline.minY is NOT equal to guideline.maxY
     */
    guideline.maxY = guideline.minY + 200;
    result = component.makeGuidelinePath(guideline, MarkerPosition.Start);

    expect(normalizeResult(result)).toEqual('m 2.5 5.75 l 15 0');

    /**
     * argument position is MarkerPosition.End
     */
    result = component.makeGuidelinePath(guideline, MarkerPosition.End);

    expect(normalizeResult(result)).toEqual('m 2.5 104.25 l 15 0');

  });

});
