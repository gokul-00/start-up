const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Notification',NotificationSchema)
