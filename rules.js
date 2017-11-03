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
  origin: [
    '#who# #what# #when#',
    '#who# #what# #when#',
    '#when# #who# #what#',
    '#who# #what#',
  ]
}

module.exports = rules