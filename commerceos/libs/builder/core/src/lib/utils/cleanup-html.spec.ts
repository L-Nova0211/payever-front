import { cleanUpHtml } from './cleanup-html';

describe('Utils:CleanUp Html', () => {

  it('should clean up htmle', () => {

    const html = `
      <section>
        <div>
          <img src="test.jpg">
        </div>
        <div>
          <img src="test2.jpg">
          <span>Image Caption</span>
        </div>
        <p>
          <!-- Test Comment -->
          Lorem, ipsum dolor.
          <br>
          After lorem text.
        </p>
      </section>
    `;

    expect(cleanUpHtml(html).trim().replace(/\n+\s+/gi, ' / '))
      .toEqual('Image Caption / Lorem, ipsum dolor. / After lorem text.');

  });

});
