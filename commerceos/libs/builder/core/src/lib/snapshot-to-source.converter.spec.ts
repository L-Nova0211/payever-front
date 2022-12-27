import { snapshotToSourceConverter } from './snapshot-to-source.converter';

describe('snapshotToSourceConverter', () => {

  it('should cover snapshot to source', () => {

    const pages = [
      { id: 'p-001' },
      { id: 'p-002' },
      { id: 'p-003' },
    ];
    const snapshot = {
      application: {
        data: {
          productPages: '/products/:productId',
        },
        routing: pages.map(page => ({
          routeId: `r-${page.id.replace(/\D-/, '')}`,
          pageId: page.id,
          url: `pages/${page.id}`,
        })),
        context: {
          test: { value: 'test.context' },
        },
      },
    };

    expect(snapshotToSourceConverter({ snapshot, pages } as any)).toEqual({
      pages,
      data: snapshot.application.data,
      routing: snapshot.application.routing,
      context: snapshot.application.context,
    } as any);

  });

});
