// middleware/errorMiddleware.js
module.exports = (err, req, res, next) => {
  // Express recognizes this as an error handler because it takes 4 arguments (err, req, res, next)
  console.error(err.message); // logs the real error in your terminal, for you to debug
  res.status(err.status || 500).json({ message: err.message || 'Server error' }); // sends a safe, clean message to the client
};