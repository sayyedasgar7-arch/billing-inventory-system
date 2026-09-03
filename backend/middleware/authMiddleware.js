// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization; // the frontend sends this as "Bearer <token>"
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // splits "Bearer xxxxx" into ["Bearer", "xxxxx"] and takes the token part
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws an error automatically if the token is fake/expired
    req.user = decoded; // attaches the logged-in user's info onto the request, so later controllers can read req.user
    next(); // hands control to the next function in line (the actual route)
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};