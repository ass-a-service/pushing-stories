const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
  text: {
    type: String,
    required: 'You must supply a string for the story text field',
    trim: true,
    index: true,
    unique: true
  },
  votes: {
    type: Number,
    default: 0
  },
  creation_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Story', storySchema)
