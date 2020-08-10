const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Project = require('../models/Project')
const Investor = require('../models/Investor')


// @desc    Show add page
// @route   GET /Projects/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('projects/add')
})

// @desc    Process add form
// @route   POST /Projects
router.post('/', ensureAuth, async (req, res) => {
  try {
    const count = [0,0,0,0,0,0]
    req.body.rating = count
    req.body.user = req.user.id
    await Project.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all Projects
// @route   GET /Projects
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

// @desc    Show single Project
// @route   GET /Projects/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user').lean()
    let value,name = '',email = '';
    const investor = await Investor.findOne({user:req.user._id})
                                   .populate('user')
                                   .lean()
    if(investor){
      if(!(req.user._id.equals(project.user._id))){
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

// GET user Analysis
router.get('/userAnalysis/:id', ensureAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user').lean()
    if (!project) {
      return res.render('error/404')
    }
    res.render('projects/userShow', {
      project,
    })
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /Projects/edit/:id
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

// @desc    Update Project
// @route   PUT /Projects/:id
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

router.put('/rating/:id', ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id).lean()
    let rating = project.rating
    if (!project) {
      return res.render('error/404')
    }

    if (project.user != req.user.id) {
      res.redirect('/projects')
    } else {
      let index = req.body.rating
      rating = UpdateArray(rating,index)
      await Project.updateOne({ _id: req.params.id }, {
        rating: rating
      })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete Project
// @route   DELETE /Projects/:id
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

// @desc    User Projects
// @route   GET /Projects/user/:userId
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

function UpdateArray(ratings,index){
  let x = []
  for(let i=0;i<6;i++){
    if(i==index){
      x[i] = ratings[i]+1
    }
    else{
      x[i] = ratings[i]
    }
  }
  return x
}

module.exports = router
