const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

const Project = require('../models/Project')
const Developer = require('../models/Developer')
const Investor = require('../models/Investor')
const Notification = require('../models/Notification')
const User = require('../models/User')

//  Login/Landing page
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

//  Dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).lean()
    const developer = await Developer.findOne({ user: req.user.id }).lean()
    const investor = await Investor.findOne({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.name,
      projects,
      developer,
      investor,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

router.get('/profile/:id', ensureAuth, async(req, res) => {
  try {
    const user = await User.findById( req.params.id ).lean()
    res.render('profile', {
      layout:'main',
      user,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})
// GET notification
router.get('/notification', ensureAuth, async (req, res) => {
  try {
    const notification = await Notification.find({ user: req.user.id }).populate('user').lean()
    let count = notification.length
    res.render('notification', {
      notification,
      layout:'main',
      count,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//POST notification
router.post('/notify/:id', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.params.id
    await Notification.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//DELETE notification
router.delete('/notification/:id', ensureAuth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id).lean()

    if (!notification) {
      return res.render('error/404')
    }

    if (notification.user != req.user.id) {
      res.redirect('/dashboard')
    } else {
      await Notification.deleteOne({ _id: req.params.id })
      res.redirect('/notification')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

module.exports = router


