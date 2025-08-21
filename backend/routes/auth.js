const express = require('express');
const User = require('../models/User');

const router = express.Router();
const authController = require('../controllers/authController');

// Register/Login user
router.post('/login', async (req, res) => {
  try {
    const { name, mobile, organizationId, zoneId, storeId } = req.body;

    // Validate required fields
    if (!name || !mobile) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and mobile number are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ mobile });

    if (user) {
      // Update user info if exists
      user.name = name;
      if (organizationId) user.organizationId = organizationId;
      if (zoneId) user.zoneId = zoneId;
      if (storeId) user.storeId = storeId;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        mobile,
        organizationId: organizationId || 'ORG001',
        zoneId: zoneId || 'ZONE001',
        storeId: storeId || 'STORE001'
      });
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        zoneId: user.zoneId,
        storeId: user.storeId
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
  });

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        zoneId: user.zoneId,
        storeId: user.storeId
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

module.exports = router;