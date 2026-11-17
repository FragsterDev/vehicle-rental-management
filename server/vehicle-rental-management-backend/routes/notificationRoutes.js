const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 1. GET ALL NOTIFICATIONS (ADMIN ONLY)
// Route: GET /api/notifications
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('booking')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// 2. MARK SPECIFIC NOTIFICATION AS READ
// Route: PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// 3. MARK ALL NOTIFICATIONS AS READ
// Route: PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });

    res.status(200).json({
      success: true,
      unreadCount: 0,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
