const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tracery = require('tracery-grammar')

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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

io.on('connection', socket => {
  console.log('a user has connected')
  socket.on('disconnect', () => console.log('user disconnected'))
  socket.on('vote', voteString => {
    try {
      const vote = JSON.parse(voteString)
      // TODO: save vote in database for that story
    } catch (e) {
      console.log('error on parsing and saving vote')
    }
  })
})

// interval each minute generate, save and emit story:
//io.emit('story', story)
setInterval(() => {
  const storyText = generateStory()
  // TODO: save on database
  const storyString = JSON.stringify({ id: 1, text: storyText })
  console.log(`sending story: ${storyString}`)
  io.emit('story', storyString)
}, 5 * 1000)

http.listen(3000, () => {
  console.log('listening on *:3000')
})