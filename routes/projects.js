const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Project = require('../models/Project')
const Investor = require('../models/Investor')


//   Show add page
router.get('/add', ensureAuth, (req, res) => {
  res.render('projects/add')
})

//  Add Project
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

//  Show all Projects

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

//  Show single Project
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user').lean()
    let value,name = '',email = '',like;
    let avg = 0
    project.rating.forEach(n => {
      avg += n
    });
    let avgrating = avgRating(avg/5)
    console.log(avgrating,avg/5)
    const investor = await Investor.findOne({user:req.user._id})
                                   .populate('user')
                                   .lean()
    if(investor){
      if(!(req.user._id.equals(project.user._id))){
        like = true
        value = true
        name = investor.username
        email = investor.user.email
      }else{
        like = false
        value = false
      }
    }else{
      if(!(req.user._id.equals(project.user._id))){
        like = true
      }else{
        like = false
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
      like,
      avgrating,
      avg:avg/5,
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

//  Show edit page
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

//  Update Project
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

// Update Rating 
router.put('/rating/:id', ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id).lean()
    let rating = project.rating
    if (!project) {
      return res.render('error/404')
    }
      let index = req.body.rating
      rating = UpdateArray(rating,index)
      await Project.updateOne({ _id: req.params.id }, {
        rating: rating
      })
      res.redirect(`/projects/${req.params.id}`)
    }
   catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//  Delete Project
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id).lean()

    if (!project) {
      return res.render('error/404')
    }

    if (project.user != req.user.id) {
      res.redirect('/projects')
    } else {
      await Project.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//  User Projects
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

// Updating Rating array
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

// Calculating average rating
function avgRating(n) {
  let output = ''
  let roundOff = Math.round(n)
  for(let i=1;i<=n;i++){
    output += '<i class="material-icons orange-text">star</i>'
  }
  if(n-roundOff < 0.5 && n!=roundOff){
    output += '<i class="material-icons orange-text">star_border</i>'
  }else if(n!=roundOff){
    output += '<i class="material-icons orange-text">star_half</i>'
  }
  for(let j=1;j<=(5-n);j++){
    output += '<i class="material-icons orange-text">star_border</i>'
  }

  return output
}

module.exports = router
