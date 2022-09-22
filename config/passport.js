const bcrypt = require('bcryptjs/dist/bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const db = require('../models')
const { User } = db

  passport.use(new LocalStrategy({ 
    usernameField: 'account', 
    passwordField:'password',
    passReqToCallback: true 
  },
    (req, account, password, done) => {
    User.findOne({ where: { account } })
      .then(user => {
        if (!user) return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return done(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
            }
            
            return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then(user => {
        user = user.toJSON()
        return done(null, user)
      })
      .catch(err => done(err, null))
  })

module.exports = passport