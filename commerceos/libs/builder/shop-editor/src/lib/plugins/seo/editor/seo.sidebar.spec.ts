import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { PebPageVariant } from '@pe/builder-core';
import { PebEditorShopSeoSidebarComponent } from './seo.sidebar';

describe('PebEditorShopSeoSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorShopSeoSidebarComponent>;
  let component: PebEditorShopSeoSidebarComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorShopSeoSidebarComponent],
      providers: [FormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorShopSeoSidebarComponent);
      component = fixture.componentInstance;

      component.page = { id: 'p-001' } as any;
      component.routing = [{
        routeId: '001',
        url: 'test',
        pageId: 'p-002',
      }];

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should create form with initial value on init', () => {

    const titleEmitSpy = spyOn(component.changeTitle, 'emit').and.callThrough();
    const urlEmitSpy = spyOn(component.changeUrl, 'emit').and.callThrough();
    const descEmitSpy = spyOn(component.changeDescription, 'emit').and.callThrough();
    const showInSearchEmitSpy = spyOn(component.changeShowInSearchResults, 'emit').and.callThrough();
    const canonicalSpy = spyOn(component.changeCanonicalUrl, 'emit').and.callThrough();
    const markupSpy = spyOn(component.changeMarkupData, 'emit').and.callThrough();
    const metaTagsSpy = spyOn(component.changeCustomMetaTags, 'emit').and.callThrough();
    const page = {
      id: 'p-001',
      name: 'Page 1',
      variant: PebPageVariant.Front,
      data: {
        seo: {
          description: 'desc',
          showInSearchResults: true,
          canonicalUrl: 'canonical',
          markupData: 'markup',
          customMetaTags: 'metaTags',
        },
      },
    };

    /**
     * component.page is null
     */
    component.url = 'test/url';
    component.page = null;
    component.ngOnInit();

    expect(component.form.value).toEqual({
      title: null,
      url: component.url,
      description: null,
      showInSearchResults: null,
      canonicalUrl: null,
      markupData: null,
      customMetaTags: null,
    });
    expect(component.form.controls.url.disabled).toBe(false);

    /**
     * change all component.form values to VALID ones
     */
    component.form.patchValue({
      title: 'test',
      url: 'testUrl',
      description: 'test',
      showInSearchResults: false,
      canonicalUrl: 'test',
      markupData: 'test',
      customMetaTags: 'test',
    });

    expect(titleEmitSpy).toHaveBeenCalled();
    expect(urlEmitSpy).toHaveBeenCalled();
    expect(descEmitSpy).toHaveBeenCalled();
    expect(showInSearchEmitSpy).toHaveBeenCalled();
    expect(canonicalSpy).toHaveBeenCalled();
    expect(markupSpy).toHaveBeenCalled();
    expect(metaTagsSpy).toHaveBeenCalled();

    /**
     * url and canonicalUrl are invalid
     */
    urlEmitSpy.calls.reset();
    canonicalSpy.calls.reset();

    component.form.patchValue({
      url: '!test',
      canonicalUrl: '!test',
    });

    expect(urlEmitSpy).not.toHaveBeenCalled();
    expect(canonicalSpy).not.toHaveBeenCalled();

    /**
     * component.page is set
     */
    component.page = page as any;
    component.ngOnInit();

    expect(component.form.value).toEqual({
      title: page.name,
      description: page.data.seo.description,
      showInSearchResults: page.data.seo.showInSearchResults,
      canonicalUrl: page.data.seo.canonicalUrl,
      markupData: page.data.seo.markupData,
      customMetaTags: page.data.seo.customMetaTags,
    });
    expect(component.form.getRawValue().url).toEqual(component.url);
    expect(component.form.controls.url.disabled).toBe(true);

  });

  it('should validate routing url', () => {

    fixture.detectChanges();

    component.form.patchValue({
      url: 'test',
    });
    expect(component.form.controls.url.valid).toBe(false);

  });

});
