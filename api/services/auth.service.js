const jwt = require('jsonwebtoken');

const secret = process.env.NODE_ENV === 'production' ? 'bjsbdjsdjsjdjsdnjsdjn' : 'secret';

const authService = () => {
  const issue = (payload) => jwt.sign(payload, secret, { expiresIn: 1209600 });
  const verify = (token, cb) => jwt.verify(token, secret, {}, cb);

  return {
    issue,
    verify,
  };
};

module.exports = authService;
