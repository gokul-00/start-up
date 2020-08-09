const mongoose = require('mongoose')

const InvestorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  field: {
    type: String,
    required: true,
  },
  linkedin:{
    type:String,
    required:false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Investor',InvestorSchema)
