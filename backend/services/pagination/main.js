function Pagination(data) {
  this.options = {
    page: 0,
    limit: 20,
    point: null,
    count: 0,
    end: false,
    max: 5,
    index: 1
  };
  this.set(data);
}

Pagination.prototype.reset = function () {
  this.set(this.options);
};

Pagination.prototype.set = function (data) {
  data = data || {};

  this.page = parseInt((typeof data.page !== 'undefined') ? data.page : ((typeof this.page !== 'undefined') ? this.page : this.options.page));
  this.limit = parseInt((typeof data.limit !== 'undefined') ? data.limit : ((typeof this.limit !== 'undefined') ? this.limit : this.options.limit));
  this.point = (typeof data.point === 'undefined' || data.point === null ? this.options.point : parseInt(data.point));
  this.index = Math.max(Math.ceil(this.page / this.limit), 1);
  this.count = parseInt(data.count || this.count || this.options.count);
  this.end = (typeof data.end !== 'undefined') ? data.end : ((typeof this.end !== 'undefined') ? this.end : this.options.end);
  this.max = parseInt(typeof data.max === 'undefined' || data.max === null ? (this.max || this.options.max) : data.max);
};

Pagination.prototype.get = function () {
  return {
    index: this.index,
    limit: this.limit,
    point: this.point,
    page: this.page,
    count: this.count,
    end: !!this.end
  };
};

Pagination.prototype.setIndex = function (index) {
  this.index = index;
  this.page = (index - 1) * this.limit;
};

Pagination.prototype.getIndex = function () {
  return this.index;
}

Pagination.prototype.setPage = function (page) {
  this.page = parseInt(page);
};

Pagination.prototype.getPage = function () {
  return this.page;
};

Pagination.prototype.setLimit = function (limit) {
  this.limit = parseInt(limit);
};

Pagination.prototype.getLimit = function () {
  return this.limit;
}

Pagination.prototype.setPoint = function (point) {
  this.point = (typeof point === 'undefined' || point === null ? null : parseInt(point));
}

Pagination.prototype.getPoint = function () {
  return this.point || null;
}

Pagination.prototype.setCount = function (count) {
  this.count = parseInt(count);
}

Pagination.prototype.getCount = function () {
  return this.count;
}

Pagination.prototype.setEnd = function (end) {
  this.end = end;
}

Pagination.prototype.getEnd = function () {
  return this.end;
}

Pagination.prototype.isEnd = function () {
  // syntax sugar
  return this.getEnd();
}

Pagination.prototype.getHtml = function () {
  let htmlArr = [];
  let startIndex = 1;
  let middleCount = Math.ceil((this.max - 1) / 2);
  let maxCount = Math.ceil(this.count / this.limit);

  let prevIndex = Math.max(this.index - this.max, 1);
  let nextIndex = Math.min(this.index + this.max, maxCount);

  if (this.index > middleCount) {
    startIndex = Math.max(Math.min(this.index - middleCount, maxCount - this.max + 1), 1);
  }

  let maxIndex = Math.max(Math.min(this.max, maxCount - startIndex + 1), 1);

  if (this.index > 1) {
    htmlArr.push('<a href="#" data-index="' + prevIndex + '" class="arrow prev"><i class="fa fa-angle-left"></i></a>');
  }

  for (let index = startIndex; index < startIndex + maxIndex; index++) {
    htmlArr.push('<a href="#" data-index="' + index + '" ' + (index === this.index ? 'class="active"' : '') + '>' + index + '</a>');
  }

  if (this.index < maxCount) {
    htmlArr.push('<a href="#" data-index="' + nextIndex + '" class="arrow next"><i class="fa fa-angle-right"></i></a>');
  }

  return htmlArr.join('');
}

module.exports = Pagination;