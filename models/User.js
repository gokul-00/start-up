// const mongoose = require('mongoose')

// const UserSchema = new mongoose.Schema({
//   googleId: {
//     type: String,
//     required: true,
//   },
//   displayName: {
//     type: String,
//     required: true,
//   },
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   image: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// })

// module.exports = mongoose.model('User', UserSchema)

const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    },
    password:{
        type: String,
        required:true
    },
    
})


module.exports = mongoose.model('User',UserSchema);