const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');

// Get current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

// Register new user
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  // Destructure to remove password from being passed in req.body
  const { name, password, email } = req.body;
  user = new User({
    name,
    password,
    email
  });

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Save new user
  await user.save();

  const token = user.generateAuthToken();
  // Send 'x-auth-token' with jwt token attached to header
  res.header('x-auth-token', token).send({ name, email })
});

module.exports = router;