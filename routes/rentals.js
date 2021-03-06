const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {Rental, validate} = require('../models/rental'); 
const {Movie} = require('../models/movie'); 
const {Customer} = require('../models/customer'); 

router.get('/', async (req, res) => {
  const rental = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  const session = await Rental.startSession();
  session.startTransaction();

  try {
    await rental.save();

    movie.numberInStock--;
    movie.save();

    await session.commitTransaction();
    session.endSession();

    return res.send(rental);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.log(err);
    return res.status(500).send(err.message);
  }
  
});

module.exports = router; 