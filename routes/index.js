const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

const Project = require('../models/Project')
const Profile = require('../models/Profile')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

// @desc    Show add page
// @route   GET /stories/add
router.get('/profile/add', ensureAuth, (req, res) => {
  res.render('profile',{
    layout: 'main',
  })
})

// @desc    Process add form
// @route   POST /stories
router.post('/profile/add', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    const profile = await Profile.create(req.body)
    saveImg(profile, req.body.ProfileImg)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})
// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).lean()
    res.render('dashboard', {
      name: req.user.name,
      projects,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

function saveImg(profile, imgEncoded) {
  if(imgEncoded == null) return
  const ProfileImg = JSON.parse(imgEncoded)
  if(ProfileImg !== null && imageMimeTypes.includes(ProfileImg.type)){
    profile.ProfileImg = new Buffer.from(ProfileImg.data,'base64')
    profile.ProfileImgType = ProfileImg.type
  }
}

module.exports = router


