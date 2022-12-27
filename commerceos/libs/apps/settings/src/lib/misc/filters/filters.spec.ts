import { getFilterValue } from './filters';

describe('Filters', () => {
  it('should handle "is" case', () => {
    const mockFilter = { key: 'test', value: 'testValue', condition: 'is' };
    expect(getFilterValue(mockFilter)).toBe(`^${mockFilter.value}$`);
  });

  it('should handle "isNot" case', () => {
    const mockFilter = { key: 'test', value: 'testValue', condition: 'isNot' };
    expect(getFilterValue(mockFilter)).toBe(`^(?!${mockFilter.value}$)`);
  });

  it('should handle "startsWith" case', () => {
    const mockFilter = {
      key: 'test',
      value: 'testValue',
      condition: 'startsWith',
    };
    expect(getFilterValue(mockFilter)).toBe(`^${mockFilter.value}`);
  });

  it('should handle "endsWith" case', () => {
    const mockFilter = {
      key: 'test',
      value: 'testValue',
      condition: 'endsWith',
    };
    expect(getFilterValue(mockFilter)).toBe(`${mockFilter.value}$`);
  });

  it('should handle "doesNotContain" case', () => {
    const mockFilter = {
      key: 'test',
      value: 'testValue',
      condition: 'doesNotContain',
    };
    expect(getFilterValue(mockFilter)).toBe(`^((?!${mockFilter.value}).)*$`);
  });

  it('should handle "test" case', () => {
    const mockFilter = { key: 'test', value: 'testValue', condition: 'test' };
    expect(getFilterValue(mockFilter)).toBe(mockFilter.value);
  });
});
