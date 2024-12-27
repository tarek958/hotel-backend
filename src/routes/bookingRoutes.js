const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const query = req.query.userId ? { userId: req.query.userId } : {};
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  const booking = new Booking({
    service: req.body.service,
    date: req.body.date,
    time: req.body.time,
    userId: req.body.userId,
    specialRequests: req.body.specialRequests,
  });

  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a booking
router.patch('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking == null) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.body.status) booking.status = req.body.status;
    if (req.body.specialRequests) booking.specialRequests = req.body.specialRequests;

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking == null) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
