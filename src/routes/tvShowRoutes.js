const express = require('express');
const router = express.Router();
const TVShow = require('../models/TVShow');

// Get all TV shows
router.get('/', async (req, res) => {
  try {
    const shows = await TVShow.find();
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get TV shows by category
router.get('/category/:category', async (req, res) => {
  try {
    const shows = await TVShow.find({ category: req.params.category });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single TV show by ID
router.get('/:id', async (req, res) => {
  try {
    const show = await TVShow.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'TV show not found' });
    }
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new TV show
router.post('/', async (req, res) => {
  const show = new TVShow({
    name: req.body.name,
    category: req.body.category,
    url: req.body.url,
    description: req.body.description,
    thumbnail: req.body.thumbnail,
    isLive: req.body.isLive,
  });

  try {
    const newShow = await show.save();
    res.status(201).json(newShow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a TV show
router.put('/:id', async (req, res) => {
  try {
    const show = await TVShow.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!show) {
      return res.status(404).json({ message: 'TV show not found' });
    }
    res.json(show);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a TV show
router.delete('/:id', async (req, res) => {
  try {
    const result = await TVShow.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'TV show not found' });
    }
    res.json({ message: 'TV show deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
