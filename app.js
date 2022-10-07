if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const routes = require('./routes')
const app = express()
const PORT = process.env.PORT || 3000
const SESSION_SECRET = 'secret'
const passport = require('./config/passport')
const { getUser } = require('./helpers/auth-helpers')
const handlebarsHelpers = require('./helpers/handlebars-helpers')

app.engine('hbs', exphbs({ defaultLayout: 'main', extname:'.hbs', helpers: handlebarsHelpers }))
app.use(express.static('public'))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: SESSION_SECRET , resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = getUser(req)
  next()
})
app.use(methodOverride('_method'))

app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${ PORT }`)
})