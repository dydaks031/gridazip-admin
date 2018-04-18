const Helper = {
  register: (targetObj) => {
    for (let idx in Helper) {
      if (idx !== 'register') {
        targetObj[idx] = Helper[idx];
      }
    }
  },
  activeLink: (id, cond, className) => {
    if (cond === id) {
      return className;
    } else {
      return '';
    }
  },
  activeSubLink: (id, sub, idCond, subCond, className) => {
    if (idCond === id && subCond === sub) {
      return className;
    } else {
      return '';
    }
  },
  getTitle: (title) => {
    if (typeof title !== 'undefined' && title !== null) {
      return title + ' | ' + Helper.title;
    } else {
      return Helper.title;
    }
  },
  title: '그리다집'
};

module.exports = Helper;