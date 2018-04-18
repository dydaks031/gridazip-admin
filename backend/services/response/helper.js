const Helper = {
  getJson: (json, code) => {
    code = code || 200;
    return {
      code: code,
      data: json
    };
  },
  getError: (error, code) => {
    code = code || 500;

    return Helper.getJson({
      msg: error
    }, code);
  }
};

module.exports = Helper;