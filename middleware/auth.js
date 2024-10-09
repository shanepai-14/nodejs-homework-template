// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from headers

  if (!token) {
    return res.status(401).send({ message: 'Not authorized' });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);

    if (!user || user.token !== token) {
      return res.status(401).send({ message: 'Not authorized' });
    }

    req.user = user; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).send({ message: 'Not authorized' });
  }
};

module.exports = auth;
