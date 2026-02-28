const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Subscriber = require('../models/Subscriber');
const sendEmail = require('../utils/sendEmail');


router.get('/', async (req, res) => {
  try {
    const { rare, category } = req.query;
    let filter = {};

    if (rare === 'true') filter.rare = true;
    if (category && category !== 'all') filter.category = category;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    // 1️⃣ Save product
    const p = new Product(req.body);
    await p.save();

    
    try {
      const subscribers = await Subscriber.find();

      for (const user of subscribers) {
        await sendEmail(
          user.email,
          'New Product Added | Local Parts',
          `Hello,

A new product "${p.title}" has been added.

Price: ₹${p.price}
Category: ${p.category || 'N/A'}

Visit the website to view details.

— Local Parts Platform`
        );
      }
    } catch (emailErr) {
      console.warn('⚠ Email sending failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Product added successfully',
      product: p
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ========== DELETE PRODUCT ========== */
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ ok: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
