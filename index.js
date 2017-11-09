const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tracery = require('tracery-grammar')
const rules = require('./rules.json')
const mongoose = require('mongoose')
require('./Story')
const Story = mongoose.model('Story')
require('dotenv').config()

const storyInterval = process.env.STORY_INTERVAL || 10 // seconds
const removeDelay = process.env.REMOVE_DELAY || 3 // hours

// Connec to the database:
mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => console.error(`mongoose connection: ${err.message}`))

// Tracery stuff:
const grammar = tracery.createGrammar(rules)

const generateStory = () => {
  const generatedStory = grammar.flatten('#origin#')
  const formattedStory = generatedStory.substr(0, 1).toUpperCase() + generatedStory.substr(1)
  return formattedStory
}

// Express routes:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

// Socket.io events:
io.on('connection', socket => {
  console.log('a user has connected')
  socket.on('disconnect', () => console.log('user disconnected'))
  socket.on('vote', voteHandler)
})

const voteHandler = async voteString => {
  try {
    const story = JSON.parse(voteString)
    const updatedStory = await Story.findOneAndUpdate(
      { _id: story.id },
      { $inc: { votes: 1 } },
      { new: true }
    )
    const updatedStoryString = JSON.stringify({ id: updatedStory._id, text: updatedStory.text, votes: updatedStory.votes })
    io.emit('vote', updatedStoryString)
  } catch (e) {
    console.log(`Error on parsing and saving vote: ${e}`)
  }
}

let mostVotedStories = []
let pointer = 0

const sendStory = (story) => {
  const storyString = JSON.stringify({ id: story._id, text: story.text, votes: story.votes })
  console.log(`sending story: ${storyString}`)
  io.emit('story', storyString)
}

// Generate, find or save, emit stories:
setInterval(async () => {
  if (new Date().getDay() === 0) { // if is Sunday, emit the most voted stories
    try {
      if (mostVotedStories && !mostVotedStories.length) mostVotedStories = await Story.find({}, null, { sort: { votes: -1 }, limit: 50 })
      sendStory(mostVotedStories[pointer])
      pointer++
      if (pointer >= mostVotedStories.length) pointer = 0
    } catch (e) {
      console.log(`error on saving and emiting most voted stories: ${e}`)
    }
  } else {
    if (mostVotedStories && mostVotedStories.length) {
      mostVotedStories = []
      pointer = 0
    }
    const storyText = generateStory()
    try {
      const story = await Story.findOneOrCreate(storyText)
      if (!story || !story.text) return
      sendStory(story)
    } catch (e) {
      console.log(`error on get and emit story: ${e}`)
    }
  }
}, storyInterval * 1000)

// Removes 24h old stories with 0 votes:
setInterval(async () => {
  const aDayInThePast = new Date(new Date() - 24 * 60 * 60 * 1000).toISOString()
  const affected = await Story.count({ $and: [{ creation_date: { $lte: aDayInThePast } }, { votes: 0 }] })
  console.log(`affected documents on remove older than 24h with 0 votes: ${affected}`)
  await Story.deleteMany({ $and: [{ creation_date: { $lte: aDayInThePast } }, { votes: 0 }] })
}, removeDelay * 60 * 60 * 1000)

// Server listen on port...
const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log(`listening on *:${port}`)
})
