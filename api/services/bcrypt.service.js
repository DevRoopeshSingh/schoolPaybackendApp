const bcrypt = require('bcrypt-nodejs');

const bcryptService = () => {
  const password = (password) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);

    return { hashPassword: hash, salt: salt };
  };
  
  const generateHashPassword = (pass, salt) => (
    bcrypt.hashSync(pass, salt)
  );

  const comparePassword = (pw, hash) => (
    bcrypt.compareSync(pw, hash)
  );

  return {
    password,
    comparePassword,
    generateHashPassword
  };
};

module.exports = bcryptService;
