import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { PebPageVariant } from '@pe/builder-core';
import { PebEditorBlogSeoSidebarComponent } from './seo.sidebar';

describe('PebEditorBlogSeoSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorBlogSeoSidebarComponent>;
  let component: PebEditorBlogSeoSidebarComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorBlogSeoSidebarComponent],
      providers: [FormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorBlogSeoSidebarComponent);
      component = fixture.componentInstance;
      component.routing = [{
        routeId: 'r-001',
        pageId: 'p-001',
        url: 'pages/p-001',
      }];

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const page = {
      id: 'p-001',
      name: 'Page 1',
      variant: PebPageVariant.Front,
      data: null,
    };
    const titleEmitSpy = spyOn(component.changeTitle, 'emit').and.callThrough();
    const urlEmitSpy = spyOn(component.changeUrl, 'emit').and.callThrough();
    const descEmitSpy = spyOn(component.changeDescription, 'emit').and.callThrough();
    const showInSearchEmitSpy = spyOn(component.changeShowInSearchResults, 'emit').and.callThrough();
    const canonicalSpy = spyOn(component.changeCanonicalUrl, 'emit').and.callThrough();
    const markupSpy = spyOn(component.changeMarkupData, 'emit').and.callThrough();
    const metaTagsSpy = spyOn(component.changeCustomMetaTags, 'emit').and.callThrough();

    /**
     * component.page is null
     */
    component.page = null;
    component.url = 'url/test';
    component.ngOnInit();
    component.destroy$.next();

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
     * component.page is set
     * component.page.data is null
     */
    component.page = page as any;
    component.ngOnInit();
    component.destroy$.next();

    expect(component.form.value).toEqual({
      title: page.name,
      description: null,
      showInSearchResults: null,
      canonicalUrl: null,
      markupData: null,
      customMetaTags: null,
    });
    expect(component.form.controls.url.disabled).toBe(true);

    /**
     * component.page.data is set
     * component.page.variant is PebPageVariant.Default
     */
    page.data = {
      seo: {
        description: 'desc',
        showInSearchResults: true,
        canonicalUrl: 'url/canonical',
        markupData: 'markup',
        customMetaTags: 'tag',
      },
    };
    page.variant = PebPageVariant.Default;

    component.ngOnInit();

    expect(component.form.value).toEqual({
      ...page.data.seo,
      title: page.name,
      url: component.url,
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

  });

  it('should validate routing url', () => {

    fixture.detectChanges();

    component.form.patchValue({
      url: 'pages/p-001',
    });
    expect(component.form.controls.url.valid).toBe(false);

  });

});
