const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const app = express()
const PORT = 3000
app.engine('hbs', exphbs({ defaultLayout: 'main', extname:'.hbs'}))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'))
app.get('/', (req, res) => {
  res.send('no no no hi~')
})
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})