const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

const Project = require('../models/Project')
const Developer = require('../models/Developer')
const Investor = require('../models/Investor')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

// @desc    Dashboard
// @route   GET /dashboard
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


module.exports = router


