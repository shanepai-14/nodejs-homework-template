// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../../middleware/auth');

// Validation schema for user signup
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// User signup endpoint
router.post('/signup', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).send({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    res.status(500).send({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
  
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required' });
    }
  
    try {
      const user = await User.findOne({ email });
      
      if(!user){
        return res.status(401).send({ message: 'No user found' });
      }

      console.log('Stored Password:', user.password);
        console.log('Entered Password:', password);
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ message: 'email or password is wrong : '});
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      user.token = token; 
      await user.save();
  
      res.status(200).send({
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } catch (err) {
      res.status(500).send({ message: 'Server error' });
    }
  });

  router.get('/logout', auth, async (req, res) => {
    try {
      req.user.token = null; // Clear the token
      await req.user.save();
      res.status(204).send();
    } catch (err) {
      res.status(401).send({ message: 'Not authorized' });
    }
  });

  router.get('/current', auth, (req, res) => {
    res.status(200).send({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  });

module.exports = router;
