const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Assuming the token is in the Authorization header

  console.log('Token recived',token)
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token found.' });
  }
};

module.exports = authenticateJWT;
