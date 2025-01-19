// Desc: Async Handler for Express Routes using Async/Await
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

// Desc: Async Handler for Express Routes using try/catch
// export const asyncHandler = (fn) => async (err, req, res, next) => {
//   return
//   try {
//     await fn(err, req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message || "Internal Server Error"
//     });
//   }
// }

/*
The asyncHandler is a function that takes a function as an argument and returns a function. 
The function that is passed as an argument is the route handler function. 
The function that is returned is the route handler function wrapped in a try-catch block or in a Promise.
The route handler function is passed to the asyncHandler function as an argument. 
The route handler function is then called inside the try block. 
If the route handler function throws an error, the error is caught in the catch block and a response is sent to the client.

export default asyncHandler = () => {}
export default asyncHandler = (fn) => {
    async () => {}
}

*/
