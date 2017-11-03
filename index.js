const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tracery = require('tracery-grammar')
const mongoose = require('mongoose')
require('./models/Story')
const Story = mongoose.model('Story')
require('dotenv').config()

// Connec to the database:
mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', err => console.erro(`mongoose connection: ${err.message}`))

// Tracery stuff:
const rules = {
  who: ['Sonia', 'Adrián', 'Antonio', 'Georgina', 'Héctor', 'David', 'Chris', 'Nacho', 'Mao', 'Axel', 'Andrés', 'Javi', 'Benja', 'Isabel', 'Aritz', 'Fred', 'Víctor', 'Matt', 'Nico', 'Edu', 'Ana', 'Rodrigo'],
  what: [
    'stole bussiness secrets',
    'broke the code',
    'forgot a semicolon in core code',
    'broke the api',
    'removed the database',
    'pushed failed code to qa branch',
    'hide one puzzle piece',
  ],
  when: [
    'during prod',
    'during summer kickoff',
    'when everybody was distracted',
    'when nobody watch',
    'during the night watch surveilance',
    'the day of the project launch',
  ],
  where: [
    'test'
  ],
  origin: [
    '#who# #what# #when# #where#',
    '#who# #what# #where# #when#',
    '#when# #who# #what# #where#',
    '#when# #who# #where# #what#',
    '#who# #what# #where#',
  ]
}

const grammar = tracery.createGrammar(rules)

const generateStory = () => {
  const generatedStory = grammar.flatten('#origin#')
  const formattedStory = generatedStory.substr(0, 1).toUpperCase() + generatedStory.substr(1)
  return formattedStory
}

// Express routes:
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

// Socket.io events:
io.on('connection', socket => {
  console.log('a user has connected')
  socket.on('disconnect', () => console.log('user disconnected'))
  socket.on('vote', async voteString => {
    try {
      const storyId = JSON.parse(voteString)
      const story = await Story.findOneAndUpdate(
        { _id: storyId },
        { $inc: { votes: 1 }},
        { new: true }
      )
      const updatedStoryString = JSON.stringify({ id: story._id, text: story.text, votes: story.votes, creation_date: story.creation_date })
      io.emit('vote', updatedStoryString)
    } catch (e) {
      console.log('error on parsing and saving vote')
    }
  })
})

// Generate, save and emit stories:
setInterval(async () => {
  const storyText = generateStory()
  try {
    const story = new Story({ text: storyText })
    await story.save()
    const storyString = JSON.stringify({ id: story._id, text: story.text, votes: story.votes, creation_date: story.creation_date })
    console.log(`sending story: ${storyString}`)
    io.emit('story', storyString)
  } catch (e) {
    console.log(`error on saving and emiting story: ${e}`)
  } finally {

  }
}, 5 * 1000)

// TODO: once a day query de database to delete all stories created more than 24 h ago and with 0 votes

// Server listen on port...
const port = process.env.PORT || 3000
http.listen(port, () => {
  console.log(`listening on *:${port}`)
})

// End script
console.log('End script!')