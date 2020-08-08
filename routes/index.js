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
  res.render('profile/add',{
    layout: 'main',
  })
})

// @desc    Process add form
// @route   POST /stories
router.post('/profile/add', ensureAuth, async (req, res) => {
  req.body.user = req.user.id
  const profile = new Profile({
    userName: req.body.userName,
    carrer: req.body.carrer,
    user: req.body.user
  })
  saveImg(profile, req.body.ProfileImg)
  try {
    // req.body.user = req.user.id
    // const profile = await Profile.create(req.body)
    // saveImg(profile, req.body.ProfileImg)
    // res.redirect('/dashboard')
    await profile.save()
    res.redirect('/dashboard')

  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

router.get('/profile/:id', ensureAuth, async (req, res) => {
  try {
    let profile = await Profile.findById(req.params.id).populate('user').lean()

    if (!profile) {
      return res.render('error/404')
    }
    
    res.render('profile/show', {
      profile,
    })
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).lean()
    const profile = await Profile.findOne({ user: req.user.id })
    res.render('dashboard', {
      name: req.user.name,
      projects,
      id:profile._id,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

function saveImg(profile, ProfileImgEncoded) {
  if(ProfileImgEncoded == null) return
  const ProfileImg = JSON.parse(ProfileImgEncoded)
  if(ProfileImg !== null && imageMimeTypes.includes(ProfileImg.type)){
    profile.ProfileImg = new Buffer.from(ProfileImg.data,'base64')
    profile.ProfileImgType = ProfileImg.type
  }
}

module.exports = router


