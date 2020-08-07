const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Developer = require('../models/Developer')
const Profile = require('../models/Profile')

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('developers/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Developer.create(req.body)
    res.redirect('/developers')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {

    const developers = await Developer.find()
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()
      const profile = await Profile.find()
    res.render('developers/index', {
       developers,
       profile,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let developer = await Developer.findById(req.params.id).populate('user').lean()

    if (!developer) {
      return res.render('error/404')
    }
    
    res.render('developers/show', {
      developer,
    })
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const developer = await Developer.findOne({
      _id: req.params.id,
    }).lean()

    if (!developer) {
      return res.render('error/404')
    }

    if (developer.user != req.user.id) {
      res.redirect('/developers')
    } else {
      res.render('developers/edit', {
        developer,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let developer = await Developer.findById(req.params.id).lean()

    if (!developer) {
      return res.render('error/404')
    }

    if (developer.user != req.user.id) {
      res.redirect('/developers')
    } else {
      developer = await developer.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let developer = await Developer.findById(req.params.id).lean()

    if (!developer) {
      return res.render('error/404')
    }

    if (developer.user != req.user.id) {
      res.redirect('/developers')
    } else {
      await Developer.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const developers = await Developer.find({
      user: req.params.userId,
    }).populate('user')
      .lean()

    res.render('developers/index', {
      developers,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
