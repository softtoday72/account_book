const bcrypt = require('bcryptjs')
const { User } = require('../models')

const adminController = {

  signInPage: (req, res, next) => {
    res.render('adminSignin')
  },

  signIn: (req, res, next) => {
    if (!req.user.isAdmin) {
      req.flash('warning_msg', '您不是管理員！')
      req.logout()
      res.redirect('/admin/signin')
    }
    req.flash('success_messages', '管理員成功登入！')
    res.redirect('/admin')
  },

  userTable: (req, res, next) => {
    User.findAll({
      raw: true
    })
      .then(users => {
        res.render('admin', {users})
      })
      .catch(err => next(err))
  },

  userEdit: (req, res, next) => {
    const { account, email, password, id, is_admin } = req.body
    const isAdmin = is_admin === 'on'
    
    User.findByPk(id)
      .then(user => {
        if (!user) throw new Error("使用者不存在!")
        return bcrypt.hash(password, 10)
          .then(hash => {
            user.update({
              account,
              email,
              isAdmin,
              password: hash
            })
          })
      })
      .then(() => {
        res.redirect('/admin')
      })
      .catch(err => next(err))
  }

}

module.exports = adminController