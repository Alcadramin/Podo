module.exports = {
  searchQuery: (query, toFind) =>
    new RegExp(`.*${query.split(' ').join('.*')}.*`, 'gi').test(toFind),
};
