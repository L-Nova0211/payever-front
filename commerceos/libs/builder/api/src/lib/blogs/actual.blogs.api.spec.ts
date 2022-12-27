import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { ActualBlogApi, PEB_BLOG_API_PATH } from './actual.blogs.api';

describe('ActualBlogApi', () => {

  let api: ActualBlogApi;
  let http: HttpTestingController;

  const envService = { businessId: 'b-001' };
  const applicationId = 'app-001';
  const domainId = 'dom-001';
  const blogApiPath = 'api/blog';
  const payload = { test: 'blog' };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActualBlogApi,
        { provide: EnvService, useValue: envService },
        { provide: PEB_BLOG_API_PATH, useValue: blogApiPath },
      ],
    });

    api = TestBed.inject(ActualBlogApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get blogs list', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog`;

    api.getBlogsList().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get single blog', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}`;

    api.getSingleBlog(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create blog', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog`;

    api.createBlog(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  it('should validate blog name', () => {

    const name = 'Blog';
    const url = `${blogApiPath}/business/${envService.businessId}/blog/isValidName?name=${name}`;

    api.validateBlogName(name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete blog', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}`;

    api.deleteBlog(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should update blog', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}`;

    api.updateBlog(applicationId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should mark blog as default', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/default`;

    api.markBlogAsDefault(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({});

  });

  it('should update blog deploy', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/access/${applicationId}`;

    api.updateBlogDeploy(applicationId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should update blog access config', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/access/${applicationId}`;

    api.updateBlogAccessConfig(applicationId, payload as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should check is live', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/access/${applicationId}/is-live`;

    api.checkIsLive(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush(true);

    expect(req.request.method).toEqual('GET');

  });

  it('should patch is live', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/access/${applicationId}`;

    api.patchIsLive(applicationId, false).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ isLive: false });

  });

  it('should add social image', () => {

    const accessId = 'access-001';
    const picture = 'pic.jpg';
    const url = `${blogApiPath}/business/${envService.businessId}/blog/access/${accessId}`;

    api.addSocialImage(accessId, picture).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ socialImage: picture });

  });

  it('should get all domains', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/domain`;

    api.getAllDomains(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should add domain', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/domain`;
    const domain = 'test.domain';

    api.addDomain(applicationId, domain).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name: domain });

  });

  it('should check domain', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/domain/${domainId}/check`;

    api.checkDomain(applicationId, domainId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should patch domain', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/domain/${domainId}`;
    const domain = 'test.domain';

    api.patchDomain(applicationId, domainId, domain).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ name: domain });

  });

  it('should delete domain', () => {

    const url = `${blogApiPath}/business/${envService.businessId}/blog/${applicationId}/domain/${domainId}`;

    api.deleteDomain(applicationId, domainId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  afterAll(() => {

    http.verify();

  });

});
