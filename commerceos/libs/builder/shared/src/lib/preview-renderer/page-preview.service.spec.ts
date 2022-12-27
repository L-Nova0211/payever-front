import { PagePreviewService } from './page-preview.service';

describe('PagePreviewService', () => {

  const service = new PagePreviewService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should render preview', () => {

    const dataMock: any = { test: 'data' };
    let page: any = null;

    service.page$.subscribe(p => page = p);
    const result = service.renderPreview(dataMock);

    expect(page).toEqual({
      data: dataMock,
      result,
    });

  });

});
