export function sortItems(order, originItems) {
  if (order === 'asc') {
    return originItems.sort((a, b) => a.name?.localeCompare(b.name));
  } else if(order === 'desc') {
    return originItems.sort((a, b) => b.name?.localeCompare(a.name));
  } else {
    return originItems.sort((a, b) => {
      const dateA = a?.updatedAt;
      const dateB = b?.updatedAt;
      if (dateA < dateB) {
        return order.includes('desc') ? -1 : 1;
      }
      if (dateA > dateB) {
        return order.includes('asc') ? 1 : -1;
      }

      return 0;
    });
  }
}
