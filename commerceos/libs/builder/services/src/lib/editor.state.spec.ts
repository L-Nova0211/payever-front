import { PebEditorElementInteraction, PebElementType, PebLanguage, PebPageType, PebScreen } from '@pe/builder-core';
import { EditorSidebarTypes, PebBaseEditorState, PebEditorStateType } from './editor.state';

describe('PebEditorState', () => {

  let service: PebBaseEditorState;

  const INITIAL_STATE: PebEditorStateType = {
    scale: .75,
    screen: PebScreen.Desktop,
    defaultScreen: PebScreen.Desktop,
    locale: 'en',
    hoveredElement: null,
    selectedElements: [],
    sidebarType: null,
    pagesView: PebPageType.Replica,
    sidebarsActivity: {
      [EditorSidebarTypes.Navigator]: true,
      [EditorSidebarTypes.Inspector]: true,
      [EditorSidebarTypes.Layers]: false,
    },
    language: PebLanguage.English,
    scaleToFit: true,
    animating: true,
  };

  beforeEach(() => {

    service = new PebBaseEditorState();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get scale', () => {

    const nextSpy = spyOn(service[`scaleSubject$`], 'next').and.callThrough();

    service.scale = 5;

    expect(nextSpy).toHaveBeenCalledWith(5);
    expect(service.scale).toBe(5);
    expect(JSON.parse(localStorage.getItem('PEB_EDITOR_STATE_SCALE'))).toBe(5);

  });

  it('should set/get default screen', () => {

    const nextSpy = spyOn(service[`defaultScreenSubject$`], 'next').and.callThrough();

    service.defaultScreen = PebScreen.Mobile;

    expect(nextSpy).toHaveBeenCalledWith(PebScreen.Mobile);
    expect(service.defaultScreen).toEqual(PebScreen.Mobile);
    expect(JSON.parse(localStorage.getItem('PEB_EDITOR_DEFAULT_SCREEN'))).toEqual(PebScreen.Mobile);

  });

  it('should set/get screen', () => {

    const nextSpy = spyOn(service[`screenSubject$`], 'next').and.callThrough();

    service.screen = PebScreen.Desktop;

    expect(nextSpy).toHaveBeenCalledWith(PebScreen.Desktop);
    expect(service.screen).toEqual(PebScreen.Desktop);
    expect(JSON.parse(localStorage.getItem('PEB_EDITOR_STATE_SCREEN'))).toEqual(PebScreen.Desktop);

  });

  it('should set/get hovered element', () => {

    const nextSpy = spyOn(service[`hoveredElementSubject$`], 'next').and.callThrough();

    service.hoveredElement = 'hovered';

    expect(nextSpy).toHaveBeenCalledWith('hovered');
    expect(service.hoveredElement).toEqual('hovered');

  });

  it('should set/get sidebar type', () => {

    const nextSpy = spyOn(service[`sidebarTypeSubject$`], 'next').and.callThrough();

    service.sidebarType = PebElementType.Button;

    expect(nextSpy).toHaveBeenCalledWith(PebElementType.Button);
    expect(service.sidebarType).toEqual(PebElementType.Button);

  });

  it('should set/get animating', () => {

    const nextSpy = spyOn(service[`animatingSubject$`], 'next').and.callThrough();

    service.animating = true;

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(service.animating).toBe(true);

  });

  it('should set/get text editor active', () => {

    const nextSpy = spyOn(service[`textEditorActiveSubject$`], 'next').and.callThrough();
    const textEditor: any = { test: true };

    service.textEditorActive = textEditor;

    expect(nextSpy).toHaveBeenCalledWith(textEditor);
    expect(service.textEditorActive).toEqual(textEditor);

  });

  it('should set/get misc', () => {

    const nextSpy = spyOn(service[`miscSubject$`], 'next').and.callThrough();

    service.misc = { test: true };

    expect(nextSpy).toHaveBeenCalledWith({ test: true } as any);
    expect(service.misc).toEqual({ test: true } as any);

  });

  it('should set/get pages view', () => {

    const nextSpy = spyOn(service[`pagesViewSubject$`], 'next').and.callThrough();

    service.pagesView = PebPageType.Master;

    expect(nextSpy).toHaveBeenCalledWith(PebPageType.Master);
    expect(service.pagesView).toEqual(PebPageType.Master);

  });

  it('should set/get language', () => {

    const nextSpy = spyOn(service[`languageSubject$`], 'next').and.callThrough();

    service.language = PebLanguage.Chinese;

    expect(nextSpy).toHaveBeenCalledWith(PebLanguage.Chinese);
    expect(service.language).toEqual(PebLanguage.Chinese);

  });

  it('should set sidebar activity', () => {

    const nextSpy = spyOn(service[`sidebarsActivitySubject$`], 'next').and.callThrough();

    service.sidebarsActivity = { test: true };

    expect(nextSpy).toHaveBeenCalledWith({ test: true });
    expect(service.sidebarsActivity).toEqual({ test: true });
    expect(JSON.parse(localStorage.getItem('PEB_EDITOR_STATE_SIDEBARS_ACTIVITY'))).toEqual({ test: true });

  });

  it('should set/get selected grid cells', () => {

    const nextSpy = spyOn(service[`selectedGridCellsSubject`], 'next').and.callThrough();
    const cells: any[] = [
      { id: 'c-001' },
      { id: 'c-002' },
    ];

    service.selectedGridCells = cells;

    expect(nextSpy).toHaveBeenCalledWith(cells);
    expect(service.selectedGridCells).toEqual(cells);

  });

  it('should get single selected grid cell', () => {

    const cell: any = { id: 'c-001' };

    /**
     * service.selectedGridCells is null
     */
    service.selectedGridCells = null;
    expect(service.singleSelectedGridCell).toBeNull();
    service.singleSelectedGridCell$.subscribe(cell => expect(cell).toBeNull()).unsubscribe();

    /**
     * service.selectedGridCells is set
     */
    service.selectedGridCells = [cell];
    expect(service.singleSelectedGridCell).toEqual(cell);
    service.singleSelectedGridCell$.subscribe(cell => expect(cell).toEqual(cell)).unsubscribe();

  });

  it('should set/get selected elements', () => {

    const nextSpy = spyOn(service[`selectedElementsSubject$`], 'next').and.callThrough();
    const selectedIds = ['test', 'selected'];

    service.selectedElements = selectedIds;

    expect(nextSpy).toHaveBeenCalledWith(selectedIds);
    expect(service.selectedElements).toEqual(selectedIds);

  });

  it('should get single selected element', () => {

    service.singleSelectedElement$.subscribe((elem) => {
      expect(elem).toBeNull();
    }).unsubscribe();

    service.selectedElements = ['selected'];

    service.singleSelectedElement$.subscribe((elem) => {
      expect(elem).toEqual('selected');
    });

  });

  it('should detect selection change', () => {

    const selectedIds = ['selected', 'test'];

    // w/o selected ids
    service.selectionChanged$().subscribe();

    // w/ selected ids
    service.selectionChanged$(selectedIds).subscribe((changed) => {
      expect(changed).toBe(true);
    });

  });

  it('should scale to fit', () => {

    const nextSpy = spyOn(service[`scaleToFitSubject$`], 'next').and.callThrough();
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.scaleToFit(true);

    expect(setItemSpy).toHaveBeenCalledWith('PEB_EDITOR_STATE_SCALE_TO_FIT', JSON.stringify(true));
    expect(nextSpy).toHaveBeenCalledWith(true);
    service.scaleToFit$.subscribe(value => expect(value).toBe(true));

  });

  it('should start/complete interaction', () => {

    const startSpy = spyOn(service[`interactionStartSubject$`], 'next');
    const completedSpy = spyOn(service[`interactionCompletedSubject$`], 'next');

    service.startInteraction(PebEditorElementInteraction.Move);
    service.completeInteraction(PebEditorElementInteraction.Resize);

    expect(startSpy).toHaveBeenCalledWith(PebEditorElementInteraction.Move);
    expect(completedSpy).toHaveBeenCalledWith(PebEditorElementInteraction.Resize);

  });

  it('should get grid square', () => {

    const cellsSpy = spyOnProperty(service, 'selectedGridCells');
    const cells = [
      {
        id: 'c-001',
        col: 1,
        row: 1,
      },
      {
        id: 'c-002',
        col: 3,
        row: 3,
      },
      {
        id: 'c-003',
        col: 2,
        row: 2,
      },
      {
        id: 'c-004',
        col: 0,
        row: 0,
      },
    ];

    /**
     * service.selectedGridCells is []
     */
    cellsSpy.and.returnValue([]);

    expect(service.getGridSquare()).toBeNull();

    /**
     * service.selectedGridCells is set
     */
    cellsSpy.and.returnValue(cells);

    expect(service.getGridSquare()).toEqual({
      minCol: 0,
      maxCol: 3,
      minRow: 0,
      maxRow: 3,
    });

  });

  it('should reset', () => {

    const spies = {
      scale: spyOnProperty(service, 'scale', 'set'),
      screen: spyOnProperty(service, 'screen', 'set'),
      hoveredElement: spyOnProperty(service, 'hoveredElement', 'set'),
      sidebarType: spyOnProperty(service, 'sidebarType', 'set'),
      textEditorActive: spyOnProperty(service, 'textEditorActive', 'set'),
      misc: spyOnProperty(service, 'misc', 'set'),
      pagesView: spyOnProperty(service, 'pagesView', 'set'),
      sidebarsActivity: spyOnProperty(service, 'sidebarsActivity', 'set'),
      selectedElements: spyOnProperty(service, 'selectedElements', 'set'),
      language: spyOnProperty(service, 'language', 'set'),
    };

    service.reset();

    expect(spies.scale).toHaveBeenCalledWith(INITIAL_STATE.scale);
    expect(spies.screen).toHaveBeenCalledWith(INITIAL_STATE.screen);
    expect(spies.hoveredElement).toHaveBeenCalledWith(INITIAL_STATE.hoveredElement);
    expect(spies.sidebarType).toHaveBeenCalledWith(INITIAL_STATE.sidebarType);
    expect(spies.textEditorActive).toHaveBeenCalledWith(null);
    expect(spies.misc).toHaveBeenCalledWith({});
    expect(spies.pagesView).toHaveBeenCalledWith(INITIAL_STATE.pagesView);
    expect(spies.sidebarsActivity).toHaveBeenCalledWith(INITIAL_STATE.sidebarsActivity);
    expect(spies.selectedElements).toHaveBeenCalledWith(INITIAL_STATE.selectedElements);
    expect(spies.language).toHaveBeenCalledWith(INITIAL_STATE.language);

  });

  afterEach(() => {

    localStorage.clear();

  });

});
