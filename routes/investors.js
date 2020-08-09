const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Investor = require('../models/Investor')

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => { 
  res.render('investors/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Investor.create(req.body)
    res.redirect('/investors')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const investors = await Investor.find()
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()
    let value;
    const count = await Investor.find({user:req.user._id})  
    if(count.length >= 1){
      value = false
    }else{
      value = true
    }
    res.render('investors/index', {
        investors,
      value,
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
    let investor = await Investor.findById(req.params.id).populate('user').lean()

    if (!investor) {
      return res.render('error/404')
    }
    
    res.render('investors/show', {
        investor,
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
    const investor = await Investor.findOne({
      _id: req.params.id,
    }).lean()

    if (!investor) {
      return res.render('error/404')
    }

    if (investor.user != req.user.id) {
      res.redirect('/investors')
    } else {
      res.render('investors/edit', {
        investor,
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
    let investor = await Investor.findById(req.params.id).lean()

    if (!investor) {
      return res.render('error/404')
    }

    if (investor.user != req.user.id) {
      res.redirect('/investors')
    } else {
        investor = await Investor.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/investors')
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
    let investor = await Investor.findById(req.params.id).lean()

    if (!investor) {
      return res.render('error/404')
    }

    if (investor.user != req.user.id) {
      res.redirect('/investors')
    } else {
      await Investor.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


module.exports = router
