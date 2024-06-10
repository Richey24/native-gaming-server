const jwt = require("jsonwebtoken");

module.exports = (err, req, res, next) => {
     const statusCode = err.statusCode || 500;
     res.status(statusCode);
     console.error(err);

     res.json({
          message: err.message,
     });
};
