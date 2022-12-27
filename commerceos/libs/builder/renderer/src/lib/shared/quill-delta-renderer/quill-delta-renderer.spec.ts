import { PebInteractionType } from '@pe/builder-core';

import { PebQuillRenderer } from './quill-delta-renderer';

describe('PebQuillRenderer', () => {

  let renderer: PebQuillRenderer;

  beforeEach(() => {

    renderer = new PebQuillRenderer();

  });

  it('should be defined', () => {

    expect(renderer).toBeDefined();

  });

  it('should render', () => {

    const processSpy = spyOn<any>(renderer, 'processOps').and.returnValue(['test1', 'test2']);

    // w/o ops
    expect(renderer.render({ ops: [] }, 1)).toEqual('test1test2');
    expect(processSpy).toHaveBeenCalled();

    // w/ ops
    expect(renderer.render({ ops: [] }, 1)).toEqual('test1test2');

  });

  it('should process ops', () => {

    let ops = [
      {
        insert: 'task\nfailed\nsuccessfully',
        attributes: [],
      },
      {
        insert: 'task failed successfully',
        attributes: [],
      },
      {
        insert: '\n',
        attributes: [],
      },
      {
        insert: null,
        attributes: [],
      },
    ];

    expect(renderer[`processOps`](ops, 1)).toEqual([
      '<p>task</p>',
      '<p>failed</p>',
      '<p>successfullytask failed successfully</p>',
    ]);

    //
    ops = [
      {
        insert: '\n',
        attributes: [],
      },
    ];

    expect(renderer[`processOps`](ops, 1)).toEqual(['<p><br/></p>']);

    //
    ops = [
      {
        insert: 'task failed successfully',
        attributes: [],
      },
    ];

    expect(renderer[`processOps`](ops, 1)).toEqual(['<p>task failed successfully</p>']);

    //
    ops = [
      {
        insert: 'task\nfailed\nsuccessfully',
        attributes: [],
      },
    ];

    expect(renderer[`processOps`](ops, 1)).toEqual([
      '<p>task</p>',
      '<p>failed</p>',
      '<p>successfully</p>',
    ]);

  });

  it('should chunk', () => {

    const text = 'task failed successfully';
    let attributes: any = {
      fontFamily: 'Montserrat',
      color: '#333333',
      fontSize: 18,
    };

    /**
     * argument attributes is undefined
     * argument text is a plain text without tags
     */
    expect(renderer[`chunk`](text, undefined, 1)).toEqual(text);

    /**
     * argument attributes is set
     * attributes.fontFamily is 'Montserrat'
     */
    expect(renderer[`chunk`](text, attributes, 1))
      .toEqual(`<span style="font-family: ${attributes.fontFamily}; color: ${attributes.color}; font-size: ${attributes.fontSize}px;">task failed successfully</span>`);

    /**
     * attributes link is set
     */
    attributes = {
      link: {
        type: PebInteractionType.NavigateInternal,
        payload: '/test',
      },
    };

    expect(renderer[`chunk`](text, attributes, 1))
      .toEqual(`<a href="#" peb-link-action="${attributes.link.type}" peb-link-payload="${attributes.link.payload}">task failed successfully</a>`);

    /**
     * attributes.fontWeight, italic, underline & strike are set
     */
    attributes = {
      fontWeight: 600,
      italic: true,
      underline: true,
      strike: true,
    };

    expect(renderer[`chunk`](text, attributes, 1)).toEqual('<s style="font-weight: 600;"><u><em>task failed successfully</em></u></s>');

    /**
     * attributes.fontFamily contains space character
     */
    attributes = {
      fontFamily: 'Roboto, sans-serif',
    };

    expect(renderer[`chunk`](text, attributes, 1)).toEqual(`<span style="font-family: 'Roboto, sans-serif';">task failed successfully</span>`);

    /**
     * attributes fontSize is null
     */
    attributes = {
      fontSize: null,
    };

    expect(renderer[`chunk`](text, attributes, 1)).toEqual(text);

  });

  it('should end line', () => {

    // w/o align
    // w/ line
    expect(renderer[`endLine`]('line')).toEqual(`<p>line</p>`);

    // w/o line
    expect(renderer[`endLine`](null)).toEqual(`<p><br/></p>`);

    // w/ align
    // w/ line
    const alignClasses = {
      right: 'ql-align-right',
      center: 'ql-align-center',
      justify: 'ql-align-justify',
    };

    Object.entries(alignClasses).forEach(([key, className]) => {
      expect(renderer[`endLine`]('line', { align: key })).toEqual(`<p class="${className}">line</p>`);
    });

    // w/o line
    expect(renderer[`endLine`](null, { align: 'right' })).toEqual(`<p class="ql-align-right"><br/></p>`);

  });

});
