const mongoose = require('mongoose')
const { link } = require('fs-extra')

const DeveloperSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  field: {
    type: String,
    required: true,
  },
  github:{
    type:String,
    required:false,
  },
  codepen:{
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

module.exports = mongoose.model('Developer',DeveloperSchema)
