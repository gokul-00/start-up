const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Developer = require('../models/Developer')

// @desc    Show add page
// @route   GET /developers/add
router.get('/add', ensureAuth, (req, res) => { 
  res.render('developers/add')
})

// @desc    Process add form
// @route   POST /developers
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

// @desc    Show all developers
// @route   GET /developers
router.get('/', ensureAuth, async (req, res) => {
  let query = Developer.find()
                       .populate('user')
                       .sort({ createdAt: 'desc' })
                       .lean()
  if(req.query.field != null && req.query.field != '') {
    query = query.regex('field', new RegExp(req.query.field, 'i'))
  }
  try {
    const developers = await query.exec()
    let value;
    const count = await Developer.find({user:req.user._id})  
    if(count.length >= 1){
      value = false
    }else{
      value = true
    }
    res.render('developers/index', {
      developers,
      value,
      searchOptions:req.query
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single developer
// @route   GET /developers/:id
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
// @route   GET /developers/edit/:id
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

// @desc    Update developer
// @route   PUT /developers/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let developer = await Developer.findById(req.params.id).lean()

    if (!developer) {
      return res.render('error/404')
    }

    if (developer.user != req.user.id) {
      res.redirect('/developers')
    } else {
      developer = await Developer.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/developers')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete developer
// @route   DELETE /developers/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let developer = await Developer.findById(req.params.id).lean()

    if (!developer) {
      return res.render('error/404')
    }

    if (developer.user != req.user.id) {
      res.redirect('/developers')
    } else {
      await Developer.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


module.exports = router
