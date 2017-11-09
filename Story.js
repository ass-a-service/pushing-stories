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

storySchema.statics.findOneOrCreate = async function (storyText) {
  try {
    const story = await this.findOne({ text: storyText })
    if (story) {
      return story
    } else {
      const insertedStory = await this.create({ text: storyText })
      if (insertedStory) return insertedStory
      return null
    }
  } catch (e) {
    console.log(`something was wrong on findOneOrCreate: ${e}`)
    return null
  }
}

module.exports = mongoose.model('Story', storySchema)
