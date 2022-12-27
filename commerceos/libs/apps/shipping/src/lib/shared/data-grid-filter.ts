export function filterDataGrid(searchItems, items) {
  let filterItems = items;

  searchItems.forEach((searchItem) => {
    const { filter, contain, search } = searchItem;
    let filtered = [];
    if (filter.toLowerCase() === 'price') {
      filtered = filterItems.filter((item) => {
        return item.data.rates.find(rate => contain === 0
          ? rate.price.toString().includes(search)
          : !rate.price.toString().includes(search));
      });
    } else {
      filtered = filterItems.filter((item) => {
        if (contain === 'contains') {
          return String(item[filter.toLowerCase()]).toLowerCase().includes(search.toLowerCase());
        }

        return !String(item[filter.toLowerCase()]).toLowerCase().includes(search.toLowerCase());
      });
    }

    filterItems = filtered;
  });

  return filterItems;
}
