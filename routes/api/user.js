// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const { Jimp } = require("jimp");
const gravatar = require('gravatar');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, '..', '..', 'public', 'avatars');
    console.log(`Avatar directory: ${avatarDir}`);
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
        avatarURL: user.avatarURL,
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

  router.patch('/avatars', auth, upload.single('avatar'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Avatar file is required' });
      }
  
      console.log('Uploaded file:', req.file);
  
      const avatarURL = `/avatars/${req.file.filename}`;
  
      User.findByIdAndUpdate(req.user._id, { avatarURL })
        .then(() => {
          console.log(`Avatar URL updated for user: ${req.user._id}`);
          res.json({ avatarURL });
        })
        .catch(error => {
          console.error('Error updating user:', error);
          res.status(500).json({ message: 'Failed to update user', error: error.toString() });
        });
  
    } catch (error) {
      console.error('Error in avatar update:', error);
      res.status(500).json({ message: 'Server error', error: error.toString() });
    }
  });
module.exports = router;
