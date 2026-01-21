import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: { // Optional, e.g., system notification doesn't have a sender user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'job_alert', 'system'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String // Where to go when clicked
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
