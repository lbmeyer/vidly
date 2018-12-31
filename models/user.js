const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: Boolean
});

// create a method on userSchema to generate token
// note this._id refers to user object
userSchema.methods.generateAuthToken = function() {
  const payload = { 
    _id: this._id,
    isAdmin: this.isAdmin 
  };

  const token = jwt.sign(
    payload, 
    config.get('jwtPrivateKey'),
    { expiresIn: 3600 }
  );
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
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

  return Joi.validate(user, schema);
}

/* Password validation
- at least 8 characters
- must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
- Can contain special characters
*/

module.exports.User = User;
module.exports.validate = validateUser;