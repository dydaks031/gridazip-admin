function Filter(filter) {
  this.filter = filter || {};
}

Filter.prototype.set = function (filter) {
  this.filter = $.extend(this.filter, filter);
}

Filter.prototype.get = function () {
  return this.filter;
}

Filter.prototype.setFilter = function (key, value) {
  this.filter[key] = value;
}

Filter.prototype.getFilter = function (key) {
  return this.filter[key] || null;
}

module.exports = Filter;