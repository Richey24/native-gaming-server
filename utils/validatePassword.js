const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
};

module.exports = validatePassword;
