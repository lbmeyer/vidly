const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { User } = require('../models/user');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password');

  // compare user input password with mongodb password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.generateAuthToken();
  res.send(token)
});

function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
      .min(8)
      .max(255)
      .required()
      .error(() => "Password be at least 8 characters, contain at least 1 uppercase, 1 lowercase letter and 1 number")
  };

  return Joi.validate(req, schema);
}

module.exports = router;