const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  carrer: {
    type: String,
    default: 'student',
    enum: ['student', 'professional', 'business'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ProfileImg:{
    type: Buffer,
    required:false
  },
  ProfileImgType:{
    type: String,
    required:false
  },
})

ProfileSchema.virtual('ProfileImgPath').get(function() {
    if (this.ProfileImg != null && this.ProfileImgType != null) {
      return `data:${this.ProfileImgType};charset=utf-8;base64,${this.ProfileImg.toString('base64')}`
    }
})

module.exports = mongoose.model('Profile', ProfileSchema)
