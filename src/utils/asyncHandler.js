/*
    Database calling common function 
*/

const asyncHandler = (requestHandler) => {
   return async (req, res, next) => {
     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
   };
};

export default asyncHandler;
