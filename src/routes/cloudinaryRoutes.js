const crypto = require('crypto');

const router = require('express').Router();

router.get('/sign', (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { timestamp };
    const keys = Object.keys(params).sort();
    const signatureString = keys.map((k) => `${k}=${params[k]}`).join('&') + process.env.CLOUDINARY_API_SECRET;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
