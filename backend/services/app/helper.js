const knexBuilder = require('../../services/connection/knex');

const Helper = {
  setUser: (user, session) => {
    return new Promise((resolve, reject) => {
      delete user.user_pw;
      user.user_work = false;

      knexBuilder.getConnection().then(cur => {
        cur('work_tbl')
          .count('* AS count')
          .where({
            wk_user: user.user_pk
          })
          .limit(1)
          .then(response => {
            if (response[0].count > 0) {
              user.user_work = true;
            }
            session.user = user;
            resolve();
          })
          .catch(reason => {
            console.error(reason);
            session.user = user;
            reject(user);
          });
      });
    });
  }
};

module.exports = Helper;