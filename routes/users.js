const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  // destructure to remove password from being passed in req.body
  const { name, password, email } = req.body;
  user = new User({
    name,
    password,
    email
  });

  // generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // save new user
  await user.save();

  res.send({ name, email })
});

module.exports = router;