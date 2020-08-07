const mongoose = require('mongoose')

const AnalysisSchema = new mongoose.Schema({
  rating:{
      type:Array,
      required:true
  }
})

module.exports = mongoose.model('Analysis', AnalysisSchema)