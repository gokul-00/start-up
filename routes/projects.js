const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Project = require('../models/Project')
const Investor = require('../models/Investor')

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('projects/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Project.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  let query = Project.find()
                     .populate('user')
                     .sort({ createdAt: 'desc' })
                     .lean()
  if(req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  try {
    const projects = await query.exec()

    res.render('projects/index', {
      projects,
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
    const project = await Project.findById(req.params.id).populate('user').lean()
    let value,name = '',email = '';
    const investor = await Investor.findOne({user:req.user._id})
                                   .populate('user')
                                   .lean()
    if(investor){
      if(!(investor.user._id.equals(project.user._id))){
        value = true
        name = investor.username
        email = investor.user.email
      }else{
        value = false
      }
    }
    if (!project) {
      return res.render('error/404')
    }
    res.render('projects/show', {
      project,
      value,
      name,
      email,
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
    const project = await Project.findOne({
      _id: req.params.id,
    }).lean()

    if (!project) {
      return res.render('error/404')
    }

    if (project.user != req.user.id) {
      res.redirect('/projects')
    } else {
      res.render('projects/edit', {
        project,
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
    let project = await Project.findById(req.params.id).lean()

    if (!project) {
      return res.render('error/404')
    }

    if (project.user != req.user.id) {
      res.redirect('/projects')
    } else {
      project = await Project.findOneAndUpdate({ _id: req.params.id }, req.body, {
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
    let project = await Project.findById(req.params.id).lean()

    if (!project) {
      return res.render('error/404')
    }

    if (project.user != req.user.id) {
      res.redirect('/stories')
    } else {
      await Project.deleteOne({ _id: req.params.id })
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
    const projects = await Project.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('projects/index', {
      projects,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
