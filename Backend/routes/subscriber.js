const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ message: 'Already subscribed' });
    }

    await Subscriber.create({ email });
    res.json({ message: 'Subscribed successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
