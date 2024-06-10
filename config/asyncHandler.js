module.exports = (routeHandler) => {
     return async (req, res, next) => {
          try {
               await routeHandler(req, res, next);
          } catch (err) {
               const error = {
                    message: err.message,
                    status: false,
               };

               res.status(500).json(error);
          }
     };
};
